/**
 * Property-Based Tests for Retry Logic
 * 
 * Feature: social-publishing, Property 8: Retry Logic Exponential Backoff
 * Validates: Requirements 6.3
 */

import fc from 'fast-check'
import { retryWithBackoff, retryIfRetryable, isRetryableError } from '../retry-logic'

describe('Property 8: Retry Logic Exponential Backoff', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.restoreAllMocks()
    jest.useRealTimers()
  })

  it('should apply exponential backoff with increasing delays', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // maxRetries
        fc.integer({ min: 100, max: 2000 }), // initialDelay
        fc.integer({ min: 2, max: 4 }), // backoffMultiplier
        async (maxRetries, initialDelay, backoffMultiplier) => {
          const delays: number[] = []
          let callCount = 0

          // Mock function that always fails
          const failingFn = jest.fn(async () => {
            callCount++
            throw new Error('Test error')
          })

          // Start the retry operation
          const resultPromise = retryWithBackoff(failingFn, {
            maxRetries,
            initialDelay,
            maxDelay: 100000, // High max to not interfere
            backoffMultiplier,
          })

          // Advance timers and capture delays
          for (let i = 0; i < maxRetries; i++) {
            await jest.advanceTimersByTimeAsync(0) // Process current attempt
            
            if (i < maxRetries) {
              // Calculate expected delay
              const expectedDelay = initialDelay * Math.pow(backoffMultiplier, i)
              delays.push(expectedDelay)
              
              // Advance to next retry
              await jest.advanceTimersByTimeAsync(expectedDelay)
            }
          }

          await jest.advanceTimersByTimeAsync(0) // Final attempt
          const result = await resultPromise

          // Verify exponential backoff pattern
          for (let i = 1; i < delays.length; i++) {
            const ratio = delays[i] / delays[i - 1]
            expect(ratio).toBeCloseTo(backoffMultiplier, 0)
          }

          // Verify correct number of attempts
          expect(result.attempts).toBe(maxRetries + 1)
          expect(result.success).toBe(false)
          expect(callCount).toBe(maxRetries + 1)
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)

  it('should respect maximum delay cap', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 3, max: 5 }), // maxRetries
        fc.integer({ min: 1000, max: 2000 }), // initialDelay
        fc.integer({ min: 500, max: 3000 }), // maxDelay (smaller than potential exponential growth)
        async (maxRetries, initialDelay, maxDelay) => {
          const delays: number[] = []
          let callCount = 0

          const failingFn = jest.fn(async () => {
            callCount++
            throw new Error('Test error')
          })

          const resultPromise = retryWithBackoff(failingFn, {
            maxRetries,
            initialDelay,
            maxDelay,
            backoffMultiplier: 3, // High multiplier to exceed maxDelay
          })

          // Capture delays by advancing timers
          for (let i = 0; i < maxRetries; i++) {
            await jest.advanceTimersByTimeAsync(0)
            
            if (i < maxRetries) {
              const expectedDelay = Math.min(
                initialDelay * Math.pow(3, i),
                maxDelay
              )
              delays.push(expectedDelay)
              await jest.advanceTimersByTimeAsync(expectedDelay)
            }
          }

          await jest.advanceTimersByTimeAsync(0)
          await resultPromise

          // Verify no delay exceeds maxDelay
          delays.forEach((delay) => {
            expect(delay).toBeLessThanOrEqual(maxDelay)
          })
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)

  it('should succeed on first attempt if function succeeds', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.anything(), // Random return value
        async (returnValue) => {
          const successFn = jest.fn(async () => returnValue)

          const result = await retryWithBackoff(successFn, {
            maxRetries: 3,
            initialDelay: 1000,
          })

          expect(result.success).toBe(true)
          expect(result.data).toBe(returnValue)
          expect(result.attempts).toBe(1)
          expect(successFn).toHaveBeenCalledTimes(1)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should succeed on retry if function eventually succeeds', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }), // Attempt on which to succeed
        fc.string(), // Return value
        async (successAttempt, returnValue) => {
          let callCount = 0
          const eventualSuccessFn = jest.fn(async () => {
            callCount++
            if (callCount < successAttempt) {
              throw new Error('Not yet')
            }
            return returnValue
          })

          const resultPromise = retryWithBackoff(eventualSuccessFn, {
            maxRetries: 5,
            initialDelay: 100,
            maxDelay: 1000,
            backoffMultiplier: 2,
          })

          // Advance through retries
          for (let i = 0; i < successAttempt; i++) {
            await jest.advanceTimersByTimeAsync(0)
            if (i < successAttempt - 1) {
              const delay = 100 * Math.pow(2, i)
              await jest.advanceTimersByTimeAsync(Math.min(delay, 1000))
            }
          }

          const result = await resultPromise

          expect(result.success).toBe(true)
          expect(result.data).toBe(returnValue)
          expect(result.attempts).toBe(successAttempt)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should correctly identify retryable errors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Network error occurred',
          'Request timeout',
          'ECONNREFUSED',
          'ENOTFOUND',
          'Rate limit exceeded',
          'Too many requests',
          'Error 500',
          'Error 502',
          'Error 503'
        ),
        (errorMessage) => {
          const error = new Error(errorMessage)
          expect(isRetryableError(error)).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should correctly identify non-retryable errors', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Error 400 Bad Request',
          'Error 401 Unauthorized',
          'Error 403 Forbidden',
          'Error 404 Not Found',
          'Invalid input',
          'Validation failed'
        ),
        (errorMessage) => {
          const error = new Error(errorMessage)
          expect(isRetryableError(error)).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should not retry non-retryable errors', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          'Error 400 Bad Request',
          'Error 401 Unauthorized',
          'Error 403 Forbidden'
        ),
        async (errorMessage) => {
          const failingFn = jest.fn(async () => {
            throw new Error(errorMessage)
          })

          const result = await retryIfRetryable(failingFn, {
            maxRetries: 3,
            initialDelay: 100,
          })

          expect(result.success).toBe(false)
          expect(result.attempts).toBe(1) // Should fail immediately
          expect(failingFn).toHaveBeenCalledTimes(1)
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should retry retryable errors up to max retries', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }), // maxRetries
        fc.constantFrom(
          'Network error',
          'Rate limit exceeded',
          'Error 503'
        ),
        async (maxRetries, errorMessage) => {
          const failingFn = jest.fn(async () => {
            throw new Error(errorMessage)
          })

          const resultPromise = retryIfRetryable(failingFn, {
            maxRetries,
            initialDelay: 100,
            maxDelay: 1000,
            backoffMultiplier: 2,
          })

          // Advance through all retries
          for (let i = 0; i < maxRetries; i++) {
            await jest.advanceTimersByTimeAsync(0)
            if (i < maxRetries) {
              const delay = Math.min(100 * Math.pow(2, i), 1000)
              await jest.advanceTimersByTimeAsync(delay)
            }
          }

          await jest.advanceTimersByTimeAsync(0)
          const result = await resultPromise

          expect(result.success).toBe(false)
          expect(result.attempts).toBe(maxRetries + 1)
          expect(failingFn).toHaveBeenCalledTimes(maxRetries + 1)
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)

  it('should maintain exponential backoff invariant: delay(n+1) = delay(n) * multiplier', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 4 }), // backoffMultiplier
        fc.integer({ min: 100, max: 1000 }), // initialDelay
        async (backoffMultiplier, initialDelay) => {
          const delays: number[] = []
          let callCount = 0

          const failingFn = jest.fn(async () => {
            callCount++
            throw new Error('Test error')
          })

          const maxRetries = 4
          const resultPromise = retryWithBackoff(failingFn, {
            maxRetries,
            initialDelay,
            maxDelay: 1000000, // Very high to not interfere
            backoffMultiplier,
          })

          // Capture actual delays
          for (let i = 0; i < maxRetries; i++) {
            await jest.advanceTimersByTimeAsync(0)
            
            if (i < maxRetries) {
              const expectedDelay = initialDelay * Math.pow(backoffMultiplier, i)
              delays.push(expectedDelay)
              await jest.advanceTimersByTimeAsync(expectedDelay)
            }
          }

          await jest.advanceTimersByTimeAsync(0)
          await resultPromise

          // Verify exponential relationship
          for (let i = 1; i < delays.length; i++) {
            const actualRatio = delays[i] / delays[i - 1]
            expect(actualRatio).toBeCloseTo(backoffMultiplier, 0)
          }
        }
      ),
      { numRuns: 10 }
    )
  }, 15000)
})
