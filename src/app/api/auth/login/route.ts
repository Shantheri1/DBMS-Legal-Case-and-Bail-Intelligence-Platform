import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, createAuthToken, normalizeRole, AUTH_COOKIE_NAME } from '@/lib/auth';

interface UserRow {
  user_id: number;
  name: string;
  email: string;
  password_hash: string;
  status: string;
  role_name: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected JSON with email and password.' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // 1. Validate inputs
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email address is required.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string' || password.length === 0) {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    const sanitizedEmail = email.trim().toLowerCase();

    // 2. Fetch user and associated role from database
    let userRow: UserRow | null = null;

    try {
      const result = await query<UserRow>(
        `SELECT 
           u.user_id,
           u.name,
           u.email,
           u.password_hash,
           u.status,
           r.role_name
         FROM users u
         JOIN roles r ON u.role_id = r.role_id
         WHERE LOWER(u.email) = $1
         LIMIT 1`,
        [sanitizedEmail]
      );

      if (result.rows.length > 0) {
        userRow = result.rows[0];
      }
    } catch (dbError) {
      console.error('Database query failure during login:', dbError instanceof Error ? dbError.message : dbError);
      return NextResponse.json(
        { error: 'Database service is currently unreachable. Please verify database connection configuration.' },
        { status: 503 }
      );
    }

    // 3. User existence check (generic 401 to prevent user enumeration)
    if (!userRow) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 4. Check account status (reject inactive or suspended accounts)
    if (userRow.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Account is ${userRow.status.toLowerCase()}. Please contact the court administrator.` },
        { status: 403 }
      );
    }

    // 5. Verify password hash using bcryptjs
    const isPasswordValid = await verifyPassword(password, userRow.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 }
      );
    }

    // 6. Map and normalize role (ADMIN, JUDGE, ADVOCATE -> LAWYER, REGISTRAR -> CLERK)
    const normalizedRole = normalizeRole(userRow.role_name);

    // 7. Generate signed JWT token
    const token = await createAuthToken({
      userId: userRow.user_id,
      email: userRow.email,
      name: userRow.name,
      role: normalizedRole,
    });

    // 8. Prepare safe user response (never return password_hash)
    const safeUser = {
      userId: userRow.user_id,
      email: userRow.email,
      name: userRow.name,
      role: normalizedRole,
      dbRole: userRow.role_name,
    };

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: safeUser,
    });

    // 9. Set secure HttpOnly session cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 hours in seconds
    });

    return response;
  } catch (error) {
    console.error('Unhandled login error:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred during authentication.' },
      { status: 500 }
    );
  }
}
