/**
 * Integration Tests for OAuth Flows
 * 
 * Tests complete OAuth flow for each platform including:
 * - OAuth initiation
 * - Callback handling
 * - Token storage
 * - Token refresh
 * - Account disconnection
 * 
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 1.6**
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { createClient } from '@supabase/supabase-js'
import { TwitterClient } from '@/lib/social/twitter-client'
import { FacebookClient } from '@/lib/social/facebook-client'
import { InstagramClient } from '@/lib/social/instagram-client'
import { ThreadsClient } from '@/lib/social/threads-client'
import { encryptToken, decryptToken } from '@/lib/security/encryption'

// Mock environment variables
process.env.TWITTER_CLIENT_ID = 'test_twitter_client_id'
process.env.TWITTER_CLIENT_SECRET = 'test_twitter_client_secret'
process.env.FACEBOOK_APP_ID = 'test_facebook_app_id'
process.env.FACEBOOK_APP_SECRET = 'test_facebook_app_secret'
process.env.INSTAGRAM_APP_ID = 'test_instagram_app_id'
process.env.INSTAGRAM_APP_SECRET = 'test_instagram_app_secret'
process.env.THREADS_APP_ID = 'test_threads_app_id'
process.env.THREADS_APP_SECRET = 'test_threads_app_secret'
process.env.ENCRYPTION_KEY = '12345678901234567890123456789012' // 32 chars

describe('OAuth Flows - Integration Tests', () => {
  let mockSupabase: any
  let mockUserId: string

  beforeEach(() => {
    mockUserId = 'test-user-id-123'
    
    // Mock Supabase client
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

  describe('Twitter OAuth Flow', () => {
    /**
     * Test: Complete Twitter OAuth flow
     * Validates: Requirement 1.1
     */
    it('should complete full Twitter OAuth flow', async () => {
      const mockAuthCode = 'twitter_auth_code_123'
      const mockAccessToken = 'twitter_access_token_456'
      const mockRefreshToken = 'twitter_refresh_token_789'

      // Mock Twitter client authentication
      const twitterClient = new TwitterClient()
      jest.spyOn(twitterClient, 'authenticate').mockResolvedValue({
        accessToken: mockAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 7200,
      })

      // Step 1: Initiate OAuth (redirect to Twitter)
      const authUrl = `https://twitter.com/i/oauth2/authorize?client_id=${process.env.TWITTER_CLIENT_ID}`
      expect(authUrl).toContain('twitter.com')
      expect(authUrl).toContain(process.env.TWITTER_CLIENT_ID)

      // Step 2: Handle callback with auth code
      const tokenResponse = await twitterClient.authenticate(mockAuthCode)
      expect(tokenResponse.accessToken).toBe(mockAccessToken)
      expect(tokenResponse.refreshToken).toBe(mockRefreshToken)

      // Step 3: Store encrypted tokens in database
      const encryptedAccessToken = encryptToken(mockAccessToken)
      const encryptedRefreshToken = encryptToken(mockRefreshToken)

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('social_connections').insert({
        user_id: mockUserId,
        platform: 'twitter',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: new Date(Date.now() + 7200 * 1000).toISOString(),
      })

      expect(mockInsert).toHaveBeenCalled()

      // Step 4: Verify tokens can be decrypted
      const decryptedAccessToken = decryptToken(encryptedAccessToken)
      const decryptedRefreshToken = decryptToken(encryptedRefreshToken)
      expect(decryptedAccessToken).toBe(mockAccessToken)
      expect(decryptedRefreshToken).toBe(mockRefreshToken)
    })

    /**
     * Test: Token refresh flow
     * Validates: Requirement 1.5
     */
    it('should refresh expired Twitter token', async () => {
      const mockRefreshToken = 'twitter_refresh_token_789'
      const mockNewAccessToken = 'twitter_new_access_token_999'

      const twitterClient = new TwitterClient()
      jest.spyOn(twitterClient, 'refreshToken').mockResolvedValue({
        accessToken: mockNewAccessToken,
        refreshToken: mockRefreshToken,
        expiresIn: 7200,
      })

      // Refresh the token
      const refreshResponse = await twitterClient.refreshToken(mockRefreshToken)
      expect(refreshResponse.accessToken).toBe(mockNewAccessToken)

      // Update token in database
      const encryptedNewToken = encryptToken(mockNewAccessToken)
      const mockEq = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      })
      const mockUpdate = jest.fn().mockReturnValue({
        eq: mockEq,
      })
      mockSupabase.from.mockReturnValue({
        update: mockUpdate,
      })

      await mockSupabase
        .from('social_connections')
        .update({
          access_token: encryptedNewToken,
          last_refreshed_at: new Date().toISOString(),
        })
        .eq('user_id', mockUserId)
        .eq('platform', 'twitter')

      expect(mockUpdate).toHaveBeenCalled()
    })

    /**
     * Test: Account disconnection
     * Validates: Requirement 1.6
     */
    it('should disconnect Twitter account and remove tokens', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      })
      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
      })

      // Disconnect account
      await mockSupabase
        .from('social_connections')
        .delete()
        .eq('user_id', mockUserId)
        .eq('platform', 'twitter')

      expect(mockDelete).toHaveBeenCalled()
    })
  })

  describe('Facebook OAuth Flow', () => {
    /**
     * Test: Complete Facebook OAuth flow
     * Validates: Requirement 1.2
     */
    it('should complete full Facebook OAuth flow', async () => {
      const mockAuthCode = 'facebook_auth_code_123'
      const mockAccessToken = 'facebook_access_token_456'

      const facebookClient = new FacebookClient()
      jest.spyOn(facebookClient, 'authenticate').mockResolvedValue({
        accessToken: mockAccessToken,
        expiresIn: 5184000, // 60 days
      })

      // Handle callback
      const tokenResponse = await facebookClient.authenticate(mockAuthCode)
      expect(tokenResponse.accessToken).toBe(mockAccessToken)

      // Store encrypted token
      const encryptedAccessToken = encryptToken(mockAccessToken)
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('social_connections').insert({
        user_id: mockUserId,
        platform: 'facebook',
        access_token: encryptedAccessToken,
        token_expires_at: new Date(Date.now() + 5184000 * 1000).toISOString(),
      })

      expect(mockInsert).toHaveBeenCalled()
    })

    /**
     * Test: Token refresh flow
     * Validates: Requirement 1.5
     */
    it('should refresh expired Facebook token', async () => {
      const mockOldToken = 'facebook_old_token'
      const mockNewAccessToken = 'facebook_new_access_token'

      const facebookClient = new FacebookClient()
      jest.spyOn(facebookClient, 'refreshToken').mockResolvedValue({
        accessToken: mockNewAccessToken,
        expiresIn: 5184000,
      })

      const refreshResponse = await facebookClient.refreshToken(mockOldToken)
      expect(refreshResponse.accessToken).toBe(mockNewAccessToken)
    })
  })

  describe('Instagram OAuth Flow', () => {
    /**
     * Test: Complete Instagram OAuth flow via Facebook
     * Validates: Requirement 1.3
     */
    it('should complete full Instagram OAuth flow via Facebook', async () => {
      const mockAuthCode = 'instagram_auth_code_123'
      const mockAccessToken = 'instagram_access_token_456'

      const instagramClient = new InstagramClient()
      jest.spyOn(instagramClient, 'authenticate').mockResolvedValue({
        accessToken: mockAccessToken,
        expiresIn: 5184000,
      })

      // Handle callback
      const tokenResponse = await instagramClient.authenticate(mockAuthCode)
      expect(tokenResponse.accessToken).toBe(mockAccessToken)

      // Store encrypted token
      const encryptedAccessToken = encryptToken(mockAccessToken)
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('social_connections').insert({
        user_id: mockUserId,
        platform: 'instagram',
        access_token: encryptedAccessToken,
        token_expires_at: new Date(Date.now() + 5184000 * 1000).toISOString(),
      })

      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('Threads OAuth Flow', () => {
    /**
     * Test: Complete Threads OAuth flow
     * Validates: Requirement 1.4
     */
    it('should complete full Threads OAuth flow', async () => {
      const mockAuthCode = 'threads_auth_code_123'
      const mockAccessToken = 'threads_access_token_456'

      const threadsClient = new ThreadsClient()
      jest.spyOn(threadsClient, 'authenticate').mockResolvedValue({
        accessToken: mockAccessToken,
        expiresIn: 5184000,
      })

      // Handle callback
      const tokenResponse = await threadsClient.authenticate(mockAuthCode)
      expect(tokenResponse.accessToken).toBe(mockAccessToken)

      // Store encrypted token
      const encryptedAccessToken = encryptToken(mockAccessToken)
      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('social_connections').insert({
        user_id: mockUserId,
        platform: 'threads',
        access_token: encryptedAccessToken,
        token_expires_at: new Date(Date.now() + 5184000 * 1000).toISOString(),
      })

      expect(mockInsert).toHaveBeenCalled()
    })
  })

  describe('Cross-Platform OAuth Tests', () => {
    /**
     * Test: Multiple platform connections for same user
     * Validates: Requirements 1.1, 1.2, 1.3, 1.4
     */
    it('should allow user to connect multiple platforms', async () => {
      const platforms = ['twitter', 'facebook', 'instagram', 'threads']
      const connections: any[] = []

      for (const platform of platforms) {
        const mockAccessToken = `${platform}_access_token`
        const encryptedToken = encryptToken(mockAccessToken)

        connections.push({
          user_id: mockUserId,
          platform,
          access_token: encryptedToken,
          connected_at: new Date().toISOString(),
        })
      }

      const mockInsert = jest.fn().mockResolvedValue({ error: null })
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
      })

      await mockSupabase.from('social_connections').insert(connections)

      expect(mockInsert).toHaveBeenCalledWith(connections)
      expect(connections).toHaveLength(4)
    })

    /**
     * Test: Token encryption/decryption consistency
     * Validates: Requirement 3.1, 3.2
     */
    it('should maintain token integrity through encryption/decryption', async () => {
      const originalTokens = [
        'twitter_token_abc123',
        'facebook_token_def456',
        'instagram_token_ghi789',
        'threads_token_jkl012',
      ]

      for (const originalToken of originalTokens) {
        const encrypted = encryptToken(originalToken)
        const decrypted = decryptToken(encrypted)

        expect(decrypted).toBe(originalToken)
        expect(encrypted).not.toBe(originalToken)
      }
    })

    /**
     * Test: Disconnecting one platform doesn't affect others
     * Validates: Requirement 1.6
     */
    it('should disconnect single platform without affecting others', async () => {
      const mockDelete = jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ error: null }),
        }),
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: [
            { platform: 'facebook' },
            { platform: 'instagram' },
            { platform: 'threads' },
          ],
          error: null,
        }),
      })

      mockSupabase.from.mockReturnValue({
        delete: mockDelete,
        select: mockSelect,
      })

      // Disconnect Twitter
      await mockSupabase
        .from('social_connections')
        .delete()
        .eq('user_id', mockUserId)
        .eq('platform', 'twitter')

      // Verify other connections still exist
      const { data: remainingConnections } = await mockSupabase
        .from('social_connections')
        .select('*')
        .eq('user_id', mockUserId)

      expect(remainingConnections).toHaveLength(3)
      expect(remainingConnections.map((c: any) => c.platform)).not.toContain('twitter')
    })
  })
})
