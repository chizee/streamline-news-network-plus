// Twitter/X API v2 Client for OAuth and Publishing

import { SocialClient, TokenResponse, PublishResult } from './types'

export class TwitterClient implements SocialClient {
  private clientId: string
  private clientSecret: string
  private callbackUrl: string
  private readonly CHARACTER_LIMIT = 280

  constructor() {
    this.clientId = process.env.TWITTER_CLIENT_ID || ''
    this.clientSecret = process.env.TWITTER_CLIENT_SECRET || ''
    this.callbackUrl = process.env.TWITTER_CALLBACK_URL || ''

    if (!this.clientId || !this.clientSecret) {
      throw new Error('Twitter API credentials not configured')
    }
  }

  /**
   * Exchange authorization code for access token
   */
  async authenticate(code: string, codeVerifier?: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        redirect_uri: this.callbackUrl,
        code_verifier: codeVerifier || 'challenge',
      })

      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: params.toString(),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Twitter OAuth failed: ${error}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      }
    } catch (error) {
      console.error('Twitter authentication error:', error)
      throw error
    }
  }

  /**
   * Refresh an expired access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
        client_id: this.clientId,
      })

      const response = await fetch('https://api.twitter.com/2/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        },
        body: params.toString(),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Twitter token refresh failed: ${error}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
      }
    } catch (error) {
      console.error('Twitter token refresh error:', error)
      throw error
    }
  }

  /**
   * Publish a tweet
   */
  async publish(content: string, accessToken: string): Promise<PublishResult> {
    try {
      // Validate content before publishing
      if (!this.validateContent(content)) {
        return {
          success: false,
          platform: 'twitter',
          error: `Content exceeds ${this.CHARACTER_LIMIT} character limit`,
        }
      }

      const response = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          text: content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        return {
          success: false,
          platform: 'twitter',
          error: error.detail || error.title || 'Failed to publish tweet',
        }
      }

      const data = await response.json()
      const tweetId = data.data.id

      return {
        success: true,
        platform: 'twitter',
        postId: tweetId,
        postUrl: `https://twitter.com/i/web/status/${tweetId}`,
      }
    } catch (error) {
      console.error('Twitter publish error:', error)
      return {
        success: false,
        platform: 'twitter',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validate content against Twitter's character limit
   */
  validateContent(content: string): boolean {
    return content.length > 0 && content.length <= this.CHARACTER_LIMIT
  }

  /**
   * Get Twitter's character limit
   */
  getCharacterLimit(): number {
    return this.CHARACTER_LIMIT
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string, codeChallenge: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.callbackUrl,
      scope: 'tweet.read tweet.write users.read offline.access',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return `https://twitter.com/i/oauth2/authorize?${params.toString()}`
  }
}
