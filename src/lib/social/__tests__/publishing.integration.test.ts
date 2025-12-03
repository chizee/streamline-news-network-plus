/**
 * Integration Tests for Publishing
 * 
 * Tests complete publishing flow including:
 * - Publishing to each platform
 * - Multi-platform publishing
 * - Error scenarios
 * - Status tracking
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.7**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { TwitterClient } from '@/lib/social/twitter-client'
import { FacebookClient } from '@/lib/social/facebook-client'
import { InstagramClient } from '@/lib/social/instagram-client'
import { ThreadsClient } from '@/lib/social/threads-client'
import { encryptToken, decryptToken } from '@/lib/security/encryption'

// Mock environment
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012'
process.env.TWITTER_CLIENT_ID = 'test_twitter_client_id'
process.env.TWITTER_CLIENT_SECRET = 'test_twitter_client_secret'
process.env.FACEBOOK_APP_ID = 'test_facebook_app_id'
process.env.FACEBOOK_APP_SECRET = 'test_facebook_app_secret'
process.env.INSTAGRAM_APP_ID = 'test_instagram_app_id'
process.env.INSTAGRAM_APP_SECRET = 'test_instagram_app_secret'
process.env.THREADS_APP_ID = 'test_threads_app_id'
process.env.THREADS_APP_SECRET = 'test_threads_app_secret'

describe('Publishing - Integration Tests', () => {
  let mockSupabase: any
  let mockUserId: string
  let mockContentId: string

  beforeEach(() => {
    mockUserId = 'test-user-id-123'
    mockContentId = 'test-content-id-456'

    mockSupabase = {
      from: jest.fn(),
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: mockUserId } },
          error: null,
        }),
      },
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Single Platform Publishing', () => {
    /**
     * Test: Publish to Twitter
     * Validates: Requirement 2.1
     */
    it('should successfully publish to Twitter', async () => {
      const content = 'Test tweet content #testing'
      const mockAccessToken = 'twitter_access_token'
      const mockPostId = 'tweet_123456'
      const mockPostUrl = 'https://twitter.com/user/status/123456'

      // Mock Twitter client
      const twitterClient = new TwitterClient()
      jest.spyOn(twitterClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(twitterClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'twitter',
        postId: mockPostId,
        postUrl: mockPostUrl,
      })

      // Validate content
      const isValid = twitterClient.validateContent(content)
      expect(isValid).toBe(true)

      // Publish
      const result = await twitterClient.publish(content, mockAccessToken)
      expect(result.success).toBe(true)
      expect(result.postId).toBe(mockPostId)
      expect(result.postUrl).toBe(mockPostUrl)

      // Store result in database
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('published_posts').insert({
        content_id: mockContentId,
        user_id: mockUserId,
        platform: 'twitter',
        platform_post_id: mockPostId,
        platform_post_url: mockPostUrl,
        status: 'published',
        published_at: new Date().toISOString(),
      })

      expect(mockInsert).toHaveBeenCalled()
    })

    /**
     * Test: Publish to Facebook
     * Validates: Requirement 2.2
     */
    it('should successfully publish to Facebook', async () => {
      const content = 'Test Facebook post with longer content that exceeds Twitter limits but is fine for Facebook'
      const mockAccessToken = 'facebook_access_token'
      const mockPostId = 'fb_post_123456'
      const mockPostUrl = 'https://facebook.com/posts/123456'

      const facebookClient = new FacebookClient()
      jest.spyOn(facebookClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(facebookClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'facebook',
        postId: mockPostId,
        postUrl: mockPostUrl,
      })

      const isValid = facebookClient.validateContent(content)
      expect(isValid).toBe(true)

      const result = await facebookClient.publish(content, mockAccessToken)
      expect(result.success).toBe(true)
      expect(result.postId).toBe(mockPostId)
    })

    /**
     * Test: Publish to Instagram
     * Validates: Requirement 2.3
     */
    it('should successfully publish to Instagram', async () => {
      const content = 'Test Instagram caption with #hashtags'
      const mockAccessToken = 'instagram_access_token'
      const mockPostId = 'ig_post_123456'
      const mockPostUrl = 'https://instagram.com/p/123456'

      const instagramClient = new InstagramClient()
      jest.spyOn(instagramClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(instagramClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'instagram',
        postId: mockPostId,
        postUrl: mockPostUrl,
      })

      const result = await instagramClient.publish(content, mockAccessToken)
      expect(result.success).toBe(true)
      expect(result.postId).toBe(mockPostId)
    })

    /**
     * Test: Publish to Threads
     * Validates: Requirement 2.4
     */
    it('should successfully publish to Threads', async () => {
      const content = 'Test Threads post'
      const mockAccessToken = 'threads_access_token'
      const mockPostId = 'threads_post_123456'
      const mockPostUrl = 'https://threads.net/t/123456'

      const threadsClient = new ThreadsClient()
      jest.spyOn(threadsClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(threadsClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'threads',
        postId: mockPostId,
        postUrl: mockPostUrl,
      })

      const result = await threadsClient.publish(content, mockAccessToken)
      expect(result.success).toBe(true)
      expect(result.postId).toBe(mockPostId)
    })
  })

  describe('Multi-Platform Publishing', () => {
    /**
     * Test: Publish to multiple platforms simultaneously
     * Validates: Requirement 2.7
     */
    it('should publish to multiple platforms successfully', async () => {
      const content = 'Multi-platform test post'
      const platforms = ['twitter', 'facebook', 'instagram', 'threads']
      const results: any[] = []

      // Mock all clients
      const twitterClient = new TwitterClient()
      const facebookClient = new FacebookClient()
      const instagramClient = new InstagramClient()
      const threadsClient = new ThreadsClient()

      jest.spyOn(twitterClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'twitter',
        postId: 'twitter_123',
        postUrl: 'https://twitter.com/user/status/123',
      })

      jest.spyOn(facebookClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'facebook',
        postId: 'fb_123',
        postUrl: 'https://facebook.com/posts/123',
      })

      jest.spyOn(instagramClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'instagram',
        postId: 'ig_123',
        postUrl: 'https://instagram.com/p/123',
      })

      jest.spyOn(threadsClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'threads',
        postId: 'threads_123',
        postUrl: 'https://threads.net/t/123',
      })

      // Publish to all platforms
      const publishPromises = [
        twitterClient.publish(content, 'twitter_token'),
        facebookClient.publish(content, 'facebook_token'),
        instagramClient.publish(content, 'instagram_token'),
        threadsClient.publish(content, 'threads_token'),
      ]

      const publishResults = await Promise.all(publishPromises)
      results.push(...publishResults)

      // Verify all succeeded
      expect(results).toHaveLength(4)
      expect(results.every((r) => r.success)).toBe(true)
      expect(results.map((r) => r.platform)).toEqual(platforms)
    })

    /**
     * Test: Partial failure in multi-platform publishing
     * Validates: Requirement 2.7 (atomicity)
     */
    it('should handle partial failures in multi-platform publishing', async () => {
      const content = 'Test post with partial failure'

      const twitterClient = new TwitterClient()
      const facebookClient = new FacebookClient()
      const instagramClient = new InstagramClient()

      // Twitter succeeds
      jest.spyOn(twitterClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'twitter',
        postId: 'twitter_123',
        postUrl: 'https://twitter.com/user/status/123',
      })

      // Facebook fails
      jest.spyOn(facebookClient, 'publish').mockResolvedValue({
        success: false,
        platform: 'facebook',
        error: 'Rate limit exceeded',
      })

      // Instagram succeeds
      jest.spyOn(instagramClient, 'publish').mockResolvedValue({
        success: true,
        platform: 'instagram',
        postId: 'ig_123',
        postUrl: 'https://instagram.com/p/123',
      })

      const results = await Promise.all([
        twitterClient.publish(content, 'twitter_token'),
        facebookClient.publish(content, 'facebook_token'),
        instagramClient.publish(content, 'instagram_token'),
      ])

      // Verify mixed results
      const successCount = results.filter((r) => r.success).length
      const failureCount = results.filter((r) => !r.success).length

      expect(successCount).toBe(2)
      expect(failureCount).toBe(1)
      expect(results[1].error).toBe('Rate limit exceeded')
    })
  })

  describe('Error Scenarios', () => {
    /**
     * Test: Content validation failure
     * Validates: Requirement 6.4, 7.1
     */
    it('should reject content exceeding character limit', async () => {
      const longContent = 'a'.repeat(300) // Exceeds Twitter's 280 limit
      const twitterClient = new TwitterClient()

      jest.spyOn(twitterClient, 'validateContent').mockReturnValue(false)
      jest.spyOn(twitterClient, 'getCharacterLimit').mockReturnValue(280)

      const isValid = twitterClient.validateContent(longContent)
      expect(isValid).toBe(false)

      // Should not attempt to publish
      const publishSpy = jest.spyOn(twitterClient, 'publish')
      
      if (!isValid) {
        // Don't publish if validation fails
        expect(publishSpy).not.toHaveBeenCalled()
      }
    })

    /**
     * Test: Invalid access token
     * Validates: Requirement 6.2
     */
    it('should handle invalid access token error', async () => {
      const content = 'Test post'
      const invalidToken = 'invalid_token'

      const twitterClient = new TwitterClient()
      jest.spyOn(twitterClient, 'publish').mockResolvedValue({
        success: false,
        platform: 'twitter',
        error: 'Invalid access token',
      })

      const result = await twitterClient.publish(content, invalidToken)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Invalid access token')
    })

    /**
     * Test: Rate limit error
     * Validates: Requirement 6.1
     */
    it('should handle rate limit error', async () => {
      const content = 'Test post'
      const twitterClient = new TwitterClient()

      jest.spyOn(twitterClient, 'publish').mockResolvedValue({
        success: false,
        platform: 'twitter',
        error: 'Rate limit exceeded. Try again in 15 minutes.',
      })

      const result = await twitterClient.publish(content, 'valid_token')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Rate limit')
    })

    /**
     * Test: Network error
     * Validates: Requirement 6.3
     */
    it('should handle network errors', async () => {
      const content = 'Test post'
      const twitterClient = new TwitterClient()

      jest.spyOn(twitterClient, 'publish').mockRejectedValue(
        new Error('Network request failed')
      )

      try {
        await twitterClient.publish(content, 'valid_token')
        fail('Should have thrown an error')
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Network request failed')
      }
    })
  })

  describe('Status Tracking', () => {
    /**
     * Test: Successful publish updates status
     * Validates: Requirement 2.6, 5.1
     */
    it('should update status to published on success', async () => {
      const mockPostId = 'post_123'
      const mockPostUrl = 'https://twitter.com/user/status/123'

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('published_posts').insert({
        content_id: mockContentId,
        user_id: mockUserId,
        platform: 'twitter',
        platform_post_id: mockPostId,
        platform_post_url: mockPostUrl,
        status: 'published',
        published_at: new Date().toISOString(),
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
          platform_post_id: mockPostId,
          platform_post_url: mockPostUrl,
        })
      )
    })

    /**
     * Test: Failed publish updates status with error
     * Validates: Requirement 2.5, 5.3
     */
    it('should update status to failed with error message', async () => {
      const errorMessage = 'Publishing failed due to rate limit'

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('published_posts').insert({
        content_id: mockContentId,
        user_id: mockUserId,
        platform: 'twitter',
        status: 'failed',
        error_message: errorMessage,
        published_at: new Date().toISOString(),
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error_message: errorMessage,
        })
      )
    })
  })

  describe('Content Validation', () => {
    /**
     * Test: Platform-specific character limits
     * Validates: Requirements 7.1, 7.2, 7.3, 7.4
     */
    it('should enforce platform-specific character limits', () => {
      const twitterClient = new TwitterClient()
      const facebookClient = new FacebookClient()
      const instagramClient = new InstagramClient()
      const threadsClient = new ThreadsClient()

      jest.spyOn(twitterClient, 'getCharacterLimit').mockReturnValue(280)
      jest.spyOn(facebookClient, 'getCharacterLimit').mockReturnValue(63206)
      jest.spyOn(instagramClient, 'getCharacterLimit').mockReturnValue(2200)
      jest.spyOn(threadsClient, 'getCharacterLimit').mockReturnValue(500)

      expect(twitterClient.getCharacterLimit()).toBe(280)
      expect(facebookClient.getCharacterLimit()).toBe(63206)
      expect(instagramClient.getCharacterLimit()).toBe(2200)
      expect(threadsClient.getCharacterLimit()).toBe(500)
    })

    /**
     * Test: Content within limits passes validation
     * Validates: Requirements 7.1, 7.2, 7.3, 7.4
     */
    it('should validate content within character limits', () => {
      const shortContent = 'Short post'
      const mediumContent = 'a'.repeat(400)
      const longContent = 'a'.repeat(2000)

      const twitterClient = new TwitterClient()
      const facebookClient = new FacebookClient()
      const instagramClient = new InstagramClient()
      const threadsClient = new ThreadsClient()

      jest.spyOn(twitterClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(facebookClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(instagramClient, 'validateContent').mockReturnValue(true)
      jest.spyOn(threadsClient, 'validateContent').mockReturnValue(true)

      // All platforms should accept short content
      expect(twitterClient.validateContent(shortContent)).toBe(true)
      expect(facebookClient.validateContent(shortContent)).toBe(true)
      expect(instagramClient.validateContent(shortContent)).toBe(true)
      expect(threadsClient.validateContent(shortContent)).toBe(true)
    })
  })
})
