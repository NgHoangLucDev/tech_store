import crypto from 'crypto';

/**
 * Hash a password using PBKDF2
 * @param password The plain text password
 * @returns Hashed password in format salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password
 * @param storedValue The stored password hash (or plaintext fallback)
 * @returns True if they match, false otherwise
 */
export function comparePassword(password: string, storedValue: string): boolean {
  if (!storedValue.includes(':')) {
    // Fallback for plain-text legacy passwords (e.g., '123')
    return password === storedValue;
  }
  const [salt, originalHash] = storedValue.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}
