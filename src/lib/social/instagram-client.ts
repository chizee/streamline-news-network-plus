// Instagram Graph API Client for OAuth and Publishing

import { SocialClient, TokenResponse, PublishResult } from './types'

export class InstagramClient implements SocialClient {
  private appId: string
  private appSecret: string
  private callbackUrl: string
  private readonly CHARACTER_LIMIT = 2200

  constructor() {
    this.appId = process.env.INSTAGRAM_APP_ID || process.env.FACEBOOK_APP_ID || ''
    this.appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.FACEBOOK_APP_SECRET || ''
    this.callbackUrl = process.env.FACEBOOK_CALLBACK_URL || ''

    if (!this.appId || !this.appSecret) {
      throw new Error('Instagram API credentials not configured')
    }
  }

  /**
   * Exchange authorization code for access token (uses Facebook OAuth)
   */
  async authenticate(code: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        client_secret: this.appSecret,
        redirect_uri: this.callbackUrl,
        code,
      })

      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Instagram OAuth failed: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
        tokenType: data.token_type || 'bearer',
      }
    } catch (error) {
      console.error('Instagram authentication error:', error)
      throw error
    }
  }

  /**
   * Refresh/extend an access token
   */
  async refreshToken(accessToken: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'ig_exchange_token',
        client_secret: this.appSecret,
        access_token: accessToken,
      })

      const response = await fetch(
        `https://graph.instagram.com/refresh_access_token?${params.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Instagram token refresh failed: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
        tokenType: 'bearer',
      }
    } catch (error) {
      console.error('Instagram token refresh error:', error)
      throw error
    }
  }

  /**
   * Publish a post to Instagram
   * Note: Instagram requires a two-step process: create container, then publish
   */
  async publish(content: string, accessToken: string): Promise<PublishResult> {
    try {
      // Validate content before publishing
      if (!this.validateContent(content)) {
        return {
          success: false,
          platform: 'instagram',
          error: `Caption exceeds ${this.CHARACTER_LIMIT} character limit`,
        }
      }

      // Get Instagram Business Account ID
      const accountResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
        {
          method: 'GET',
        }
      )

      if (!accountResponse.ok) {
        const error = await accountResponse.json()
        return {
          success: false,
          platform: 'instagram',
          error: error.error?.message || 'Failed to get Instagram account',
        }
      }

      const accountData = await accountResponse.json()
      const pageId = accountData.data?.[0]?.id

      if (!pageId) {
        return {
          success: false,
          platform: 'instagram',
          error: 'No Facebook page connected to Instagram Business account',
        }
      }

      // Get Instagram Business Account ID from the page
      const igAccountResponse = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${accessToken}`,
        {
          method: 'GET',
        }
      )

      if (!igAccountResponse.ok) {
        return {
          success: false,
          platform: 'instagram',
          error: 'Failed to get Instagram Business account ID',
        }
      }

      const igAccountData = await igAccountResponse.json()
      const igUserId = igAccountData.instagram_business_account?.id

      if (!igUserId) {
        return {
          success: false,
          platform: 'instagram',
          error: 'Instagram Business account not found. Please connect an Instagram Business account.',
        }
      }

      // Note: Instagram requires an image URL to create a post
      // For text-only posts, we would need to generate an image or use a default
      return {
        success: false,
        platform: 'instagram',
        error: 'Instagram requires an image to publish. Text-only posts are not supported.',
      }
    } catch (error) {
      console.error('Instagram publish error:', error)
      return {
        success: false,
        platform: 'instagram',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validate content against Instagram's character limit
   */
  validateContent(content: string): boolean {
    return content.length > 0 && content.length <= this.CHARACTER_LIMIT
  }

  /**
   * Get Instagram's character limit
   */
  getCharacterLimit(): number {
    return this.CHARACTER_LIMIT
  }

  /**
   * Generate OAuth authorization URL (uses Facebook OAuth)
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.callbackUrl,
      state,
      scope: 'instagram_basic,instagram_content_publish,pages_read_engagement',
      response_type: 'code',
    })

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  }
}
