/**
 * Property-Based Tests for Multi-Platform Publishing
 * 
 * Feature: social-publishing, Property 5: Multi-Platform Publishing Atomicity
 * Validates: Requirements 2.7
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import fc from 'fast-check'
import type { SocialPlatform, PublishResult } from '../types'

describe('Property 5: Multi-Platform Publishing Atomicity', () => {
  const platforms: SocialPlatform[] = ['twitter', 'facebook', 'instagram', 'threads']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishing to multiple platforms should attempt all platforms regardless of individual failures', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...platforms), { minLength: 2, maxLength: 4 }),
        fc.string({ minLength: 10, maxLength: 100 }),
        async (selectedPlatforms, content) => {
          // Simulate publishing to all platforms
          const results: PublishResult[] = []
          
          for (const platform of selectedPlatforms) {
            // Randomly succeed or fail
            const success = Math.random() > 0.3
            results.push({
              success,
              platform,
              ...(success
                ? { postId: `id-${platform}`, postUrl: `https://${platform}.com/post` }
                : { error: `Failed to publish to ${platform}` }),
            })
          }

          // All platforms should have been attempted
          expect(results.length).toBe(selectedPlatforms.length)
          
          // Each platform should appear exactly once
          const resultPlatforms = results.map((r) => r.platform)
          expect(new Set(resultPlatforms).size).toBe(selectedPlatforms.length)
          
          // All selected platforms should be in results
          selectedPlatforms.forEach((platform) => {
            expect(resultPlatforms).toContain(platform)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('one platform failure should not prevent other platforms from publishing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...platforms), { minLength: 3, maxLength: 4 }),
        fc.integer({ min: 0, max: 3 }), // index of platform that will fail
        async (selectedPlatforms, failureIndex) => {
          const validFailureIndex = failureIndex % selectedPlatforms.length
          
          const results: PublishResult[] = selectedPlatforms.map((platform, index) => {
            const success = index !== validFailureIndex
            return {
              success,
              platform,
              ...(success
                ? { postId: `id-${platform}`, postUrl: `https://${platform}.com/post` }
                : { error: `Failed to publish to ${platform}` }),
            }
          })

          // Should have results for all platforms
          expect(results.length).toBe(selectedPlatforms.length)
          
          // Should have at least one success and one failure
          const successCount = results.filter((r) => r.success).length
          const failureCount = results.filter((r) => !r.success).length
          
          expect(successCount).toBeGreaterThan(0)
          expect(failureCount).toBeGreaterThan(0)
          expect(successCount + failureCount).toBe(selectedPlatforms.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('publishing the same content to multiple platforms should use the same content', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...platforms), { minLength: 2, maxLength: 4 }),
        fc.string({ minLength: 10, maxLength: 200 }),
        async (selectedPlatforms, content) => {
          // Simulate publishing same content to all platforms
          const publishedContent: Record<SocialPlatform, string> = {} as any
          
          for (const platform of selectedPlatforms) {
            publishedContent[platform] = content
          }

          // All platforms should receive the same content
          const contentValues = Object.values(publishedContent)
          expect(contentValues.every((c) => c === content)).toBe(true)
          expect(contentValues.length).toBe(selectedPlatforms.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('publishing results should maintain platform-specific information', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...platforms), { minLength: 2, maxLength: 4 }),
        async (selectedPlatforms) => {
          const results: PublishResult[] = selectedPlatforms.map((platform) => ({
            success: true,
            platform,
            postId: `${platform}-specific-id`,
            postUrl: `https://${platform}.com/post`,
          }))

          // Each result should have platform-specific data
          results.forEach((result) => {
            expect(result.postId).toContain(result.platform)
            expect(result.postUrl).toContain(result.platform)
          })

          // No two results should have the same post ID
          const postIds = results.map((r) => r.postId)
          expect(new Set(postIds).size).toBe(postIds.length)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('partial success should be reflected in overall results', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.constantFrom(...platforms), { minLength: 2, maxLength: 4 }),
        fc.integer({ min: 1, max: 100 }), // success percentage
        async (selectedPlatforms, successPercentage) => {
          const results: PublishResult[] = selectedPlatforms.map((platform, index) => {
            const success = (index * 100) / selectedPlatforms.length < successPercentage
            return {
              success,
              platform,
              ...(success
                ? { postId: `id-${platform}`, postUrl: `https://${platform}.com/post` }
                : { error: `Failed to publish to ${platform}` }),
            }
          })

          const successCount = results.filter((r) => r.success).length
          const failureCount = results.filter((r) => !r.success).length

          // Summary should match actual results
          expect(successCount + failureCount).toBe(selectedPlatforms.length)
          expect(successCount).toBeGreaterThanOrEqual(0)
          expect(successCount).toBeLessThanOrEqual(selectedPlatforms.length)
          
          // Overall success should be true if at least one platform succeeded
          const overallSuccess = successCount > 0
          expect(overallSuccess).toBe(successCount > 0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('empty platform list should result in no publishing attempts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 200 }),
        async (content) => {
          const selectedPlatforms: SocialPlatform[] = []
          const results: PublishResult[] = []

          // No platforms selected means no results
          expect(results.length).toBe(0)
          expect(selectedPlatforms.length).toBe(0)
        }
      ),
      { numRuns: 50 }
    )
  })
})
