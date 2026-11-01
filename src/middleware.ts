import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_COOKIE_NAME, normalizeRole } from '@/lib/auth-token';

/**
 * Route Permission Definitions for Normalized Roles:
 * - ADMIN: Access all modules.
 * - JUDGE: Access dashboard, cases, and bail intelligence.
 * - LAWYER: Access dashboard, cases, bail application, and bail intelligence.
 * - CLERK: Access dashboard and case registry only.
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  '/dashboard': ['ADMIN', 'JUDGE', 'LAWYER', 'CLERK'],
  '/cases': ['ADMIN', 'JUDGE', 'LAWYER', 'CLERK'],
  '/bail/apply': ['ADMIN', 'LAWYER'],
  '/bail/intelligence': ['ADMIN', 'JUDGE', 'LAWYER'],
};

/**
 * Helper to determine if a route requires authentication and which roles are allowed.
 */
function getRequiredRolesForPath(pathname: string): string[] | null {
  // Check exact matches or prefix matches
  if (pathname.startsWith('/bail/apply')) {
    return ROLE_PERMISSIONS['/bail/apply'];
  }
  if (pathname.startsWith('/bail/intelligence')) {
    return ROLE_PERMISSIONS['/bail/intelligence'];
  }
  if (pathname.startsWith('/cases')) {
    return ROLE_PERMISSIONS['/cases'];
  }
  if (pathname.startsWith('/dashboard')) {
    return ROLE_PERMISSIONS['/dashboard'];
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Retrieve the session token from HttpOnly cookie
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  // 2. Verify token if present
  const session = token ? await verifyAuthToken(token) : null;
  const isAuthenticated = Boolean(session);
  const userRole = session ? normalizeRole(session.role) : null;

  // 3. Handle /login route: If already authenticated, redirect to /dashboard
  if (pathname === '/login') {
    if (isAuthenticated) {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
    return NextResponse.next();
  }

  // 4. Check if the current route is protected
  const allowedRoles = getRequiredRolesForPath(pathname);

  if (allowedRoles) {
    // A. Unauthenticated: Redirect to /login with safe callbackUrl
    if (!isAuthenticated || !userRole) {
      const loginUrl = new URL('/login', request.url);
      const destination = pathname + search;
      // Store relative destination path safely in callbackUrl
      loginUrl.searchParams.set('callbackUrl', destination);
      return NextResponse.redirect(loginUrl);
    }

    // B. Authenticated but unauthorized role: Redirect to /dashboard with error param
    if (!allowedRoles.includes(userRole)) {
      console.warn(`[RBAC] Access denied: User ${session?.email} (${userRole}) attempted unauthorized access to ${pathname}`);
      const deniedUrl = new URL('/dashboard', request.url);
      deniedUrl.searchParams.set('denied', '1');
      deniedUrl.searchParams.set('module', pathname);
      return NextResponse.redirect(deniedUrl);
    }
  }

  // 5. User is authenticated and authorized (or route is public)
  const response = NextResponse.next();

  // Forward user role in request headers for downstream server components if needed
  if (session) {
    response.headers.set('x-user-id', String(session.userId));
    response.headers.set('x-user-role', userRole || '');
    response.headers.set('x-user-email', session.email);
  }

  return response;
}

/**
 * Next.js Edge Middleware Route Matcher:
 * Targets protected judicial routes and the login page.
 * Explicitly excludes static assets, public files, and core auth APIs.
 */
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/cases/:path*',
    '/bail/:path*',
    '/login',
  ],
};
