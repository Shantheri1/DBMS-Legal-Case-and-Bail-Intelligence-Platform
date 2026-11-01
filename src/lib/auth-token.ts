import { SignJWT, jwtVerify, JWTPayload } from 'jose';

/**
 * Interface representing the authenticated user session payload.
 * Encapsulates essential identity and Role-Based Access Control (RBAC) claims.
 */
export interface AuthUserSession {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Extended JWT Claims Payload for JurisPredict tokens.
 */
interface JurisJwtClaims extends JWTPayload {
  userId: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Default token expiration duration (8 hours covers standard judicial work shifts).
 */
export const DEFAULT_TOKEN_EXPIRATION = '8h';

/**
 * Cookie identifier name for session transmission.
 */
export const AUTH_COOKIE_NAME = 'juris_session';

/**
 * Retrieves and validates the secret key from environment variables.
 * Converts secret string into an encoded Uint8Array required by jose WebCrypto API.
 * Throws a safe descriptive error if JWT_SECRET is not configured.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === '') {
    throw new Error(
      'Authentication configuration error: JWT_SECRET environment variable is required. Please set JWT_SECRET in your environment or .env.local file.'
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Creates and signs a secure JWT for an authenticated user session.
 * Uses HMAC SHA-256 (HS256) signature algorithm via Web Crypto API.
 *
 * @param user - User session properties (userId, email, name, role).
 * @param expiresIn - Expiration string (e.g. '8h', '24h', '7d'). Defaults to '8h'.
 * @returns Promise<string> - Compact signed JWT string.
 */
export async function createAuthToken(
  user: AuthUserSession,
  expiresIn: string = DEFAULT_TOKEN_EXPIRATION
): Promise<string> {
  if (!user || !user.userId || !user.email || !user.role) {
    throw new Error('Invalid user payload: userId, email, and role are required to create a token.');
  }

  const secret = getJwtSecret();

  const token = await new SignJWT({
    userId: user.userId,
    email: user.email.toLowerCase().trim(),
    name: user.name.trim(),
    role: user.role.toUpperCase().trim(),
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  return token;
}

/**
 * Verifies and decodes a signed JWT token using Web Crypto API.
 * Fully compatible with Next.js Edge Middleware and Node.js runtimes.
 * Validates expiration, signature integrity, and ensures required session claims exist.
 *
 * @param token - Compact signed JWT string to verify.
 * @returns Promise<AuthUserSession | null> - Decoded user session, or null if invalid/expired.
 */
export async function verifyAuthToken(
  token: string
): Promise<AuthUserSession | null> {
  if (!token || typeof token !== 'string' || token.trim() === '') {
    return null;
  }

  try {
    const secret = getJwtSecret();
    const { payload } = await jwtVerify<JurisJwtClaims>(token, secret, {
      algorithms: ['HS256'],
    });

    if (
      typeof payload.userId !== 'number' ||
      typeof payload.email !== 'string' ||
      typeof payload.name !== 'string' ||
      typeof payload.role !== 'string'
    ) {
      console.warn('Authentication token missing mandatory claims (userId, email, name, or role).');
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
  } catch (error) {
    // Gracefully handle token expiration or signature tampering without unhandled exceptions
    return null;
  }
}

/**
 * Normalizes database role names into consistent application role keys:
 * - 'ADVOCATE' / 'LAWYER' -> 'LAWYER'
 * - 'REGISTRAR' / 'CLERK' -> 'CLERK'
 * - 'JUDGE' -> 'JUDGE'
 * - 'ADMIN' -> 'ADMIN'
 */
export function normalizeRole(roleName: string): string {
  if (!roleName) return '';
  const upper = roleName.toUpperCase().trim();
  switch (upper) {
    case 'ADVOCATE':
    case 'LAWYER':
      return 'LAWYER';
    case 'REGISTRAR':
    case 'CLERK':
      return 'CLERK';
    case 'JUDGE':
      return 'JUDGE';
    case 'ADMIN':
      return 'ADMIN';
    default:
      return upper;
  }
}
