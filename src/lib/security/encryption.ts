// Token Encryption/Decryption using AES-256-GCM

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
// const SALT_LENGTH = 64 // Reserved for future use

/**
 * Get encryption key from environment or generate one
 * In production, this should be a secure environment variable
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY
  
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set')
  }

  // Derive a 32-byte key from the environment variable
  return crypto.scryptSync(key, 'salt', 32)
}

/**
 * Encrypt a token using AES-256-GCM
 * @param token - The plaintext token to encrypt
 * @returns Encrypted token as base64 string (includes IV and auth tag)
 */
export function encryptToken(token: string): string {
  try {
    const key = getEncryptionKey()
    const iv = crypto.randomBytes(IV_LENGTH)
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    
    let encrypted = cipher.update(token, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    
    const authTag = cipher.getAuthTag()
    
    // Combine IV + encrypted data + auth tag
    const combined = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'hex'),
      authTag,
    ])
    
    return combined.toString('base64')
  } catch (error) {
    console.error('Token encryption error:', error)
    throw new Error('Failed to encrypt token')
  }
}

/**
 * Decrypt a token using AES-256-GCM
 * @param encryptedToken - The encrypted token as base64 string
 * @returns Decrypted plaintext token
 */
export function decryptToken(encryptedToken: string): string {
  try {
    const key = getEncryptionKey()
    const combined = Buffer.from(encryptedToken, 'base64')
    
    // Extract IV, encrypted data, and auth tag
    const iv = combined.subarray(0, IV_LENGTH)
    const authTag = combined.subarray(combined.length - AUTH_TAG_LENGTH)
    const encrypted = combined.subarray(IV_LENGTH, combined.length - AUTH_TAG_LENGTH)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Token decryption error:', error)
    throw new Error('Failed to decrypt token')
  }
}

/**
 * Generate a secure random encryption key
 * Use this to generate a key for ENCRYPTION_KEY environment variable
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token for comparison (one-way)
 * Useful for token validation without storing plaintext
 */
export function hashToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')
}

/**
 * Verify if a token matches a hash
 */
export function verifyTokenHash(token: string, hash: string): boolean {
  const tokenHash = hashToken(token)
  return crypto.timingSafeEqual(
    Buffer.from(tokenHash),
    Buffer.from(hash)
  )
}
