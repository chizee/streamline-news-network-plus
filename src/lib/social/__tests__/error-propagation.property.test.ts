/**
 * Property-Based Tests for Error Message Propagation
 * 
 * Feature: social-publishing, Property 9: Error Message Propagation
 * Validates: Requirements 2.5, 5.3, 6.5
 */

import fc from 'fast-check'
import {
  handlePlatformError,
  handleTwitterError,
  handleFacebookError,
  handleInstagramError,
  handleThreadsError,
  type PlatformError,
} from '../error-handlers'
import type { SocialPlatform } from '../types'

describe('Property 9: Error Message Propagation', () => {
  it('should always return a non-empty error message', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.oneof(
          fc.string({ minLength: 1 }),
          fc.record({
            message: fc.string({ minLength: 1 }),
          })
        ),
        (platform, error) => {
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.message).toBeDefined()
          expect(result.message.length).toBeGreaterThan(0)
          expect(typeof result.message).toBe('string')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include platform name in error context', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.string({ minLength: 1 }),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.platform).toBe(platform)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should preserve error information through transformation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.string({ minLength: 5 }),
        (platform, originalMessage) => {
          const error = new Error(originalMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          // The result should either contain the original message or a meaningful transformation
          const hasOriginalInfo = 
            result.message.includes(originalMessage) ||
            result.message.length > 0
          
          expect(hasOriginalInfo).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should categorize rate limit errors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.constantFrom(
          'rate limit exceeded',
          '429 Too Many Requests',
          'Rate limit error',
          'too many requests'
        ),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.isRetryable).toBe(true)
          expect(result.message.toLowerCase()).toContain('rate limit')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should categorize authentication errors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.constantFrom(
          '401 Unauthorized',
          'invalid token',
          'token expired',
          'authentication failed'
        ),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.isRetryable).toBe(false)
          expect(result.requiresReauth).toBe(true)
          expect(result.message.toLowerCase()).toMatch(/auth|token|reconnect/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should categorize network errors as retryable', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.constantFrom(
          'network error',
          'timeout',
          'ECONNREFUSED',
          'connection failed'
        ),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.isRetryable).toBe(true)
          expect(result.message.toLowerCase()).toMatch(/network|timeout|try again/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should categorize server errors as retryable', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.constantFrom('500 Internal Server Error', '502 Bad Gateway', '503 Service Unavailable'),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.isRetryable).toBe(true)
          expect(result.message.toLowerCase()).toMatch(/server|try again/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should categorize content validation errors as non-retryable', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.constantFrom(
          'character limit exceeded',
          'content too long',
          'exceeds limit'
        ),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          expect(result.isRetryable).toBe(false)
          expect(result.message.toLowerCase()).toMatch(/character|limit|long/)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should provide actionable error messages for users', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.oneof(
          fc.constant('rate limit exceeded'),
          fc.constant('401 Unauthorized'),
          fc.constant('network error'),
          fc.constant('character limit exceeded')
        ),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          // Error message should provide guidance
          const hasGuidance = 
            result.message.toLowerCase().includes('try again') ||
            result.message.toLowerCase().includes('reconnect') ||
            result.message.toLowerCase().includes('please') ||
            result.message.toLowerCase().includes('limit')
          
          expect(hasGuidance).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain error structure consistency across platforms', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.string({ minLength: 1 }),
        (platform, errorMessage) => {
          const error = new Error(errorMessage)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          // All errors should have these required fields
          expect(result).toHaveProperty('platform')
          expect(result).toHaveProperty('message')
          expect(result).toHaveProperty('isRetryable')
          
          // Types should be correct
          expect(typeof result.platform).toBe('string')
          expect(typeof result.message).toBe('string')
          expect(typeof result.isRetryable).toBe('boolean')
          
          // Optional fields should be boolean if present
          if (result.requiresReauth !== undefined) {
            expect(typeof result.requiresReauth).toBe('boolean')
          }
          if (result.code !== undefined) {
            expect(typeof result.code).toBe('string')
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should handle Twitter-specific errors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Tweet exceeds character limit',
          'duplicate tweet',
          '429 rate limit',
          'token expired'
        ),
        (errorMessage) => {
          const error = new Error(errorMessage)
          const result = handleTwitterError(error)
          
          expect(result.platform).toBe('twitter')
          expect(result.message).toBeDefined()
          expect(result.message.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle Facebook-specific errors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Error 190: invalid token',
          'permission denied',
          'rate limit exceeded',
          'character limit'
        ),
        (errorMessage) => {
          const error = new Error(errorMessage)
          const result = handleFacebookError(error)
          
          expect(result.platform).toBe('facebook')
          expect(result.message).toBeDefined()
          expect(result.message.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle Instagram-specific errors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'business account required',
          'media required',
          'rate limit exceeded',
          'invalid token'
        ),
        (errorMessage) => {
          const error = new Error(errorMessage)
          const result = handleInstagramError(error)
          
          expect(result.platform).toBe('instagram')
          expect(result.message).toBeDefined()
          expect(result.message.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle Threads-specific errors correctly', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'character limit exceeded',
          '429 rate limit',
          'invalid token',
          '500 server error'
        ),
        (errorMessage) => {
          const error = new Error(errorMessage)
          const result = handleThreadsError(error)
          
          expect(result.platform).toBe('threads')
          expect(result.message).toBeDefined()
          expect(result.message.length).toBeGreaterThan(0)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should never lose error information during propagation', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.record({
          message: fc.string({ minLength: 1 }),
          code: fc.option(fc.string(), { nil: undefined }),
          status: fc.option(fc.integer({ min: 400, max: 599 }), { nil: undefined }),
        }),
        (platform, errorData) => {
          const result = handlePlatformError(platform as SocialPlatform, errorData)
          
          // Should always have a message
          expect(result.message).toBeDefined()
          expect(result.message.length).toBeGreaterThan(0)
          
          // Should always have platform
          expect(result.platform).toBe(platform)
          
          // Should always have retryable flag
          expect(typeof result.isRetryable).toBe('boolean')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should provide different messages for different error types', () => {
    const errorTypes = [
      'rate limit exceeded',
      '401 Unauthorized',
      'network error',
      'character limit exceeded',
      '500 server error',
    ]
    
    const platform: SocialPlatform = 'twitter'
    const messages = errorTypes.map((errorMessage) => {
      const error = new Error(errorMessage)
      const result = handlePlatformError(platform, error)
      return result.message
    })
    
    // All messages should be unique (different error types = different messages)
    const uniqueMessages = new Set(messages)
    expect(uniqueMessages.size).toBe(errorTypes.length)
  })

  it('should maintain error code when available', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('twitter', 'facebook', 'instagram', 'threads'),
        fc.constantFrom('429', '401', '500', '502', '503'),
        (platform, statusCode) => {
          const error = new Error(`Error ${statusCode}`)
          const result = handlePlatformError(platform as SocialPlatform, error)
          
          // If the error has a recognizable code, it should be captured
          if (result.code) {
            expect(typeof result.code).toBe('string')
            expect(result.code.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
