// Facebook Graph API Client for OAuth and Publishing

import { SocialClient, TokenResponse, PublishResult } from './types'

export class FacebookClient implements SocialClient {
  private appId: string
  private appSecret: string
  private callbackUrl: string
  private readonly CHARACTER_LIMIT = 63206

  constructor() {
    this.appId = process.env.FACEBOOK_APP_ID || ''
    this.appSecret = process.env.FACEBOOK_APP_SECRET || ''
    this.callbackUrl = process.env.FACEBOOK_CALLBACK_URL || ''

    if (!this.appId || !this.appSecret) {
      throw new Error('Facebook API credentials not configured')
    }
  }

  /**
   * Exchange authorization code for access token
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
        throw new Error(`Facebook OAuth failed: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000, // Default 60 days
        tokenType: data.token_type || 'bearer',
      }
    } catch (error) {
      console.error('Facebook authentication error:', error)
      throw error
    }
  }

  /**
   * Refresh/extend an access token
   */
  async refreshToken(accessToken: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: accessToken,
      })

      const response = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?${params.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Facebook token refresh failed: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
        tokenType: data.token_type || 'bearer',
      }
    } catch (error) {
      console.error('Facebook token refresh error:', error)
      throw error
    }
  }

  /**
   * Publish a post to Facebook
   */
  async publish(content: string, accessToken: string): Promise<PublishResult> {
    try {
      // Validate content before publishing
      if (!this.validateContent(content)) {
        return {
          success: false,
          platform: 'facebook',
          error: `Content exceeds ${this.CHARACTER_LIMIT} character limit`,
        }
      }

      // First, get the user's pages
      const pagesResponse = await fetch(
        `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`,
        {
          method: 'GET',
        }
      )

      if (!pagesResponse.ok) {
        const error = await pagesResponse.json()
        return {
          success: false,
          platform: 'facebook',
          error: error.error?.message || 'Failed to get Facebook pages',
        }
      }

      const pagesData = await pagesResponse.json()
      
      // Use the first page or user's feed if no pages
      const pageId = pagesData.data?.[0]?.id || 'me'
      const pageAccessToken = pagesData.data?.[0]?.access_token || accessToken

      // Publish to the page/feed
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${pageId}/feed`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: content,
            access_token: pageAccessToken,
          }),
        }
      )

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          platform: 'facebook',
          error: error.error?.message || 'Failed to publish post',
        }
      }

      const data = await response.json()
      const postId = data.id

      return {
        success: true,
        platform: 'facebook',
        postId,
        postUrl: `https://www.facebook.com/${postId}`,
      }
    } catch (error) {
      console.error('Facebook publish error:', error)
      return {
        success: false,
        platform: 'facebook',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validate content against Facebook's character limit
   */
  validateContent(content: string): boolean {
    return content.length > 0 && content.length <= this.CHARACTER_LIMIT
  }

  /**
   * Get Facebook's character limit
   */
  getCharacterLimit(): number {
    return this.CHARACTER_LIMIT
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.callbackUrl,
      state,
      scope: 'pages_manage_posts,pages_read_engagement,public_profile',
      response_type: 'code',
    })

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`
  }
}
