// OAuth utilities for PKCE and state management

import crypto from 'crypto'

/**
 * Generate a cryptographically secure random string
 */
export function generateRandomString(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url')
}

/**
 * Generate PKCE code verifier and challenge
 */
export function generatePKCE() {
  const codeVerifier = generateRandomString(32)
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url')
  
  return {
    codeVerifier,
    codeChallenge,
  }
}

/**
 * Generate OAuth state parameter
 */
export function generateState(): string {
  return generateRandomString(16)
}

/**
 * Verify OAuth state parameter
 */
export function verifyState(receivedState: string, expectedState: string): boolean {
  return crypto.timingSafeEqual(
    Buffer.from(receivedState),
    Buffer.from(expectedState)
  )
}
