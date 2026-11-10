import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { createAuthToken, AUTH_COOKIE_NAME, normalizeRole } from '@/lib/auth';
import { findUserByEmail, registerNewUserInMemory, UserRow } from '@/lib/user-store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON payload.' },
        { status: 400 }
      );
    }

    const { name, email, password, role, phone, designation, barCouncilNo, courtId } = body;

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 3) {
      return NextResponse.json(
        { error: 'Full legal name is required (minimum 3 characters).' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid official email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters in length.' },
        { status: 400 }
      );
    }

    const normalizedRole = (role || '').trim().toUpperCase();
    const VALID_ROLES: Record<string, number> = {
      JUDGE: 2,
      LAWYER: 3,
      CLERK: 4,
    };

    if (!VALID_ROLES[normalizedRole]) {
      return NextResponse.json(
        { error: 'Role must be one of: JUDGE, LAWYER, or CLERK.' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedName = name.trim();
    const roleId = VALID_ROLES[normalizedRole];

    // 2. Check for duplicate user
    const existingInMemory = findUserByEmail(sanitizedEmail);
    if (existingInMemory) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    // 3. Generate secure bcrypt hash
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    let newUserId = Math.floor(Math.random() * 9000) + 1000;
    let registeredInDb = false;

    // 4. Attempt PostgreSQL live insertion
    try {
      // Check if exists in DB
      const existingDb = await query(`SELECT user_id FROM users WHERE LOWER(email) = $1`, [sanitizedEmail]);
      if (existingDb.rows.length > 0) {
        return NextResponse.json(
          { error: 'An account with this official email already exists in the judicial registry.' },
          { status: 409 }
        );
      }

      // Insert into users table
      const userRes = await query<{ user_id: number }>(
        `INSERT INTO users (role_id, name, email, password_hash, phone, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING user_id`,
        [roleId, sanitizedName, sanitizedEmail, passwordHash, phone || null]
      );

      if (userRes.rows.length > 0) {
        newUserId = userRes.rows[0].user_id;
        registeredInDb = true;

        // If Judge, insert into judges table
        if (normalizedRole === 'JUDGE') {
          const targetCourt = parseInt(courtId, 10) || 1; // Default to City Civil and Sessions Court Bengaluru
          const judgeTitle = designation || 'Sessions Judge';
          await query(
            `INSERT INTO judges (court_id, name, designation, email, status)
             VALUES ($1, $2, $3, $4, 'ACTIVE')`,
            [targetCourt, sanitizedName, judgeTitle, sanitizedEmail]
          );
        }
      }
    } catch (dbErr) {
      console.warn('[Register] PostgreSQL registration fallback to memory:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // 5. Always record in memory store for session continuity
    const newUserRecord: UserRow = {
      user_id: newUserId,
      name: sanitizedName,
      email: sanitizedEmail,
      password_hash: passwordHash,
      status: 'ACTIVE',
      role_name: normalizedRole,
      phone: phone || '',
      court_id: parseInt(courtId, 10) || 1,
    };
    registerNewUserInMemory(newUserRecord);

    // 6. Automatically issue JWT token for immediate sign-in
    const token = await createAuthToken({
      userId: newUserId,
      email: sanitizedEmail,
      name: sanitizedName,
      role: normalizedRole,
    });

    const response = NextResponse.json({
      success: true,
      message: `Account created successfully as ${normalizedRole}.`,
      user: {
        userId: newUserId,
        name: sanitizedName,
        email: sanitizedEmail,
        role: normalizedRole,
      },
      storageBackend: registeredInDb ? 'PostgreSQL Live Core' : 'Relational Memory Registry',
      redirectUrl: '/dashboard',
    });

    // Set HttpOnly authentication cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return response;
  } catch (error) {
    console.error('Error in /api/auth/register:', error);
    return NextResponse.json({ error: 'Internal registration service failure.' }, { status: 500 });
  }
}
