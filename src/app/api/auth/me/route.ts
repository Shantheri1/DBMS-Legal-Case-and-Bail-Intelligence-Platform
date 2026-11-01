import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Read the session token from the HttpOnly cookie
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized: No active session.' },
        { status: 401 }
      );
    }

    // Verify token cryptographic signature and expiration
    const session = await verifyAuthToken(token);

    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'Unauthorized: Session is invalid or has expired.' },
        { status: 401 }
      );
    }

    // Return safe profile claims
    return NextResponse.json({
      authenticated: true,
      user: {
        userId: session.userId,
        email: session.email,
        name: session.name,
        role: session.role,
      },
    });
  } catch (error) {
    console.error('Error processing /api/auth/me:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { authenticated: false, error: 'Internal server error while resolving user session.' },
      { status: 500 }
    );
  }
}
