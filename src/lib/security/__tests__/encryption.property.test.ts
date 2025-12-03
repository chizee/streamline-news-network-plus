/**
 * Property-Based Tests for Token Encryption
 * Feature: social-publishing, Property 1: OAuth Token Storage Security
 * Validates: Requirements 3.1, 3.2, 3.4
 */

import fc from 'fast-check'
import { encryptToken, decryptToken, hashToken, verifyTokenHash } from '../encryption'

describe('Token Encryption Property Tests', () => {
  // Set encryption key for tests
  beforeAll(() => {
    process.env.ENCRYPTION_KEY = 'test-encryption-key-for-property-tests-12345'
  })

  describe('Property 1: Encryption Round Trip', () => {
    it('for any token, encrypting then decrypting should return the original token', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (token) => {
            const encrypted = encryptToken(token)
            const decrypted = decryptToken(encrypted)
            expect(decrypted).toBe(token)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 2: Encryption Produces Different Output', () => {
    it('for any token, encrypting it twice should produce different ciphertexts (due to random IV)', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (token) => {
            const encrypted1 = encryptToken(token)
            const encrypted2 = encryptToken(token)
            // Different IVs mean different ciphertexts
            expect(encrypted1).not.toBe(encrypted2)
            // But both should decrypt to the same value
            expect(decryptToken(encrypted1)).toBe(token)
            expect(decryptToken(encrypted2)).toBe(token)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 3: Encrypted Tokens Are Not Plaintext', () => {
    it('for any token, the encrypted version should not contain the plaintext', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 500 }),
          (token) => {
            const encrypted = encryptToken(token)
            // Encrypted token should not contain the original token
            expect(encrypted).not.toContain(token)
            // Encrypted token should be base64 encoded
            expect(() => Buffer.from(encrypted, 'base64')).not.toThrow()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 4: Hash Consistency', () => {
    it('for any token, hashing it multiple times should produce the same hash', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (token) => {
            const hash1 = hashToken(token)
            const hash2 = hashToken(token)
            expect(hash1).toBe(hash2)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 5: Hash Verification', () => {
    it('for any token, verifying its hash should return true', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          (token) => {
            const hash = hashToken(token)
            expect(verifyTokenHash(token, hash)).toBe(true)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 6: Different Tokens Produce Different Hashes', () => {
    it('for any two different tokens, their hashes should be different', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.string({ minLength: 1, maxLength: 500 }),
          (token1, token2) => {
            fc.pre(token1 !== token2) // Only test when tokens are different
            const hash1 = hashToken(token1)
            const hash2 = hashToken(token2)
            expect(hash1).not.toBe(hash2)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 7: Encryption Handles Special Characters', () => {
    it('for any token with special characters, encryption should work correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.constantFrom('!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '\n', '\t', '\\', '"', "'"),
          (token, specialChar) => {
            const tokenWithSpecial = token + specialChar
            const encrypted = encryptToken(tokenWithSpecial)
            const decrypted = decryptToken(encrypted)
            expect(decrypted).toBe(tokenWithSpecial)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 8: Encryption Handles Unicode', () => {
    it('for any token with unicode characters, encryption should work correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 500 }),
          fc.constantFrom('😀', '你好', 'مرحبا', '🚀', '€', '™'),
          (token, unicodeChar) => {
            const tokenWithUnicode = token + unicodeChar
            const encrypted = encryptToken(tokenWithUnicode)
            const decrypted = decryptToken(encrypted)
            expect(decrypted).toBe(tokenWithUnicode)
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  describe('Property 9: Tampered Ciphertext Fails Decryption', () => {
    it('for any token, modifying the encrypted data should cause decryption to fail', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 500 }),
          (token) => {
            const encrypted = encryptToken(token)
            const buffer = Buffer.from(encrypted, 'base64')
            
            // Tamper with a byte in the middle
            if (buffer.length > 20) {
              buffer[buffer.length / 2 | 0] ^= 0xFF
              const tampered = buffer.toString('base64')
              
              // Decryption should fail
              expect(() => decryptToken(tampered)).toThrow()
            }
          }
        ),
        { numRuns: 50 }
      )
    })
  })
})
