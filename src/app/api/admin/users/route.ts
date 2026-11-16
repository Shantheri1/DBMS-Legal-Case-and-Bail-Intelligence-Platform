import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuthToken, AUTH_COOKIE_NAME, normalizeRole } from '@/lib/auth-token';
import { getAllUsers, updateUser, deleteUser } from '@/lib/user-store';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const session = await verifyAuthToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    // Attempt PostgreSQL live fetch
    try {
      const res = await query(`
        SELECT u.user_id, u.name, u.email, u.status, r.role_name
        FROM users u
        LEFT JOIN user_roles ur ON u.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.role_id
        ORDER BY u.user_id ASC
      `);
      if (res.rows && res.rows.length > 0) {
        return NextResponse.json({ users: res.rows, source: 'postgresql_live' });
      }
    } catch (dbErr) {
      console.warn('PostgreSQL query fallback for /api/admin/users:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // Fallback to persistent user store
    const users = getAllUsers().map(({ password_hash, ...safeUser }) => safeUser);
    return NextResponse.json({ users, source: 'user_store' });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const session = await verifyAuthToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    const role = normalizeRole(session.role);
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only Master Administrators may modify user roles.' }, { status: 403 });
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.userId) {
      return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
    }

    const { userId, newRole, newStatus, name } = body;

    // 1. Try PostgreSQL live update
    try {
      if (newStatus) {
        await query(`UPDATE users SET status = $1 WHERE user_id = $2`, [newStatus.toUpperCase(), userId]);
      }
      if (name) {
        await query(`UPDATE users SET name = $1 WHERE user_id = $2`, [name.trim(), userId]);
      }
      if (newRole) {
        const roleRes = await query(`SELECT role_id FROM roles WHERE role_name = $1`, [newRole.toUpperCase()]);
        if (roleRes.rows.length > 0) {
          const roleId = roleRes.rows[0].role_id;
          await query(`UPDATE user_roles SET role_id = $1 WHERE user_id = $2`, [roleId, userId]);
        }
      }
    } catch (dbErr) {
      console.warn('PostgreSQL update fallback:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // 2. Persist in user store
    const result = updateUser(Number(userId), {
      role_name: newRole,
      status: newStatus,
      name,
    });

    if (!result.success) {
      return NextResponse.json({ error: 'User not found or cannot be modified.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User #${userId} role successfully updated to ${newRole || result.user?.role_name}`,
      user: result.user,
    });
  } catch (err) {
    console.error('Error updating user role:', err);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const session = await verifyAuthToken(token);
    if (!session) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }

    const role = normalizeRole(session.role);
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Only Master Administrators may delete user accounts.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
    }

    if (Number(userId) === 1) {
      return NextResponse.json({ error: 'Cannot delete master system administrator.' }, { status: 400 });
    }

    // 1. Try PostgreSQL live delete
    try {
      await query(`DELETE FROM user_roles WHERE user_id = $1`, [Number(userId)]);
      await query(`DELETE FROM users WHERE user_id = $1`, [Number(userId)]);
    } catch (dbErr) {
      console.warn('PostgreSQL delete fallback:', dbErr instanceof Error ? dbErr.message : dbErr);
    }

    // 2. Persist in user store
    const result = deleteUser(Number(userId));
    if (!result.success) {
      return NextResponse.json({ error: 'User not found or cannot be deleted.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User #${userId} and associated database roles successfully deleted from registry.`,
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
