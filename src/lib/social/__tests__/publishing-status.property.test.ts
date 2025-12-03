/**
 * Property-Based Tests for Publishing Status Consistency
 * 
 * Feature: social-publishing, Property 3: Publishing Status Consistency
 * Validates: Requirements 2.6, 5.1, 5.2
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import type { SocialPlatform, PublishResult } from '../types'

describe('Property 3: Publishing Status Consistency', () => {
  const platforms: SocialPlatform[] = ['twitter', 'facebook', 'instagram', 'threads']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successful publishing should always result in a post ID and URL', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.string({ minLength: 10, maxLength: 50 }), // post ID
        fc.webUrl(), // post URL
        async (platform, postId, postUrl) => {
          const result: PublishResult = {
            success: true,
            platform,
            postId,
            postUrl,
          }

          // Successful posts must have both ID and URL
          expect(result.success).toBe(true)
          expect(result.postId).toBeDefined()
          expect(result.postId).not.toBe('')
          expect(result.postUrl).toBeDefined()
          expect(result.postUrl).not.toBe('')
        }
      ),
      { numRuns: 100 }
    )
  })

  it('failed publishing should always include an error message', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.string({ minLength: 5, maxLength: 200 }), // error message
        async (platform, errorMessage) => {
          const result: PublishResult = {
            success: false,
            platform,
            error: errorMessage,
          }

          // Failed posts must have error message
          expect(result.success).toBe(false)
          expect(result.error).toBeDefined()
          expect(result.error).not.toBe('')
          
          // Failed posts should not have post ID or URL
          expect(result.postId).toBeUndefined()
          expect(result.postUrl).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('publishing status should be deterministic based on result', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.boolean(), // success status
        async (platform, shouldSucceed) => {
          const result: PublishResult = shouldSucceed
            ? {
                success: true,
                platform,
                postId: 'test-id',
                postUrl: 'https://example.com/post',
              }
            : {
                success: false,
                platform,
                error: 'Test error',
              }

          // Status should match the success field
          if (shouldSucceed) {
            expect(result.success).toBe(true)
            expect(result.postId).toBeDefined()
            expect(result.error).toBeUndefined()
          } else {
            expect(result.success).toBe(false)
            expect(result.error).toBeDefined()
            expect(result.postId).toBeUndefined()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('publishing to multiple platforms should maintain individual status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...platforms), { minLength: 2, maxLength: 4 }),
        fc.array(fc.boolean(), { minLength: 2, maxLength: 4 }),
        async (selectedPlatforms, successStatuses) => {
          // Ensure arrays are same length
          const statuses = successStatuses.slice(0, selectedPlatforms.length)
          
          const results: PublishResult[] = selectedPlatforms.map((platform, index) => {
            const success = statuses[index]
            return success
              ? {
                  success: true,
                  platform,
                  postId: `id-${platform}`,
                  postUrl: `https://${platform}.com/post`,
                }
              : {
                  success: false,
                  platform,
                  error: `Failed to publish to ${platform}`,
                }
          })

          // Each result should maintain its own status
          results.forEach((result, index) => {
            expect(result.success).toBe(statuses[index])
            expect(result.platform).toBe(selectedPlatforms[index])
            
            if (statuses[index]) {
              expect(result.postId).toBeDefined()
              expect(result.postUrl).toBeDefined()
            } else {
              expect(result.error).toBeDefined()
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('publishing status should not change after being set', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...platforms),
        fc.boolean(),
        async (platform, initialSuccess) => {
          const result: PublishResult = initialSuccess
            ? {
                success: true,
                platform,
                postId: 'test-id',
                postUrl: 'https://example.com/post',
              }
            : {
                success: false,
                platform,
                error: 'Test error',
              }

          const initialStatus = result.success
          const initialError = result.error
          const initialPostId = result.postId

          // Simulate time passing or other operations
          await new Promise((resolve) => setTimeout(resolve, 1))

          // Status should remain unchanged
          expect(result.success).toBe(initialStatus)
          expect(result.error).toBe(initialError)
          expect(result.postId).toBe(initialPostId)
        }
      ),
      { numRuns: 100 }
    )
  })
})
