import bcrypt from 'bcryptjs';

// Re-export all Edge-safe token and session utilities for seamless backward-compatibility
export * from './auth-token';

/**
 * Verifies a plain-text password against a stored bcrypt hash.
 * Never exposes or logs the plain-text password.
 *
 * @param plainPassword - The plain password provided during login.
 * @param passwordHash - The bcrypt hash retrieved from the database.
 * @returns Promise<boolean> - True if the password matches the hash, false otherwise.
 */
export async function verifyPassword(
  plainPassword: string,
  passwordHash: string
): Promise<boolean> {
  if (!plainPassword || !passwordHash) {
    return false;
  }

  try {
    return await bcrypt.compare(plainPassword, passwordHash);
  } catch (error) {
    console.error('Password verification failed due to internal error:', error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Generates a bcrypt password hash from a plain-text password.
 * Uses a work factor (salt rounds) of 10 to ensure collision and brute-force resistance.
 * Plain-text passwords must NEVER be persisted to storage.
 *
 * @param plainPassword - Plain password string to hash.
 * @returns Promise<string> - The resulting bcrypt hash string.
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword || plainPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
}
