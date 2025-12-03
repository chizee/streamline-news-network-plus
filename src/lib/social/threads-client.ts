// Threads API Client for OAuth and Publishing

import { SocialClient, TokenResponse, PublishResult } from './types'

export class ThreadsClient implements SocialClient {
  private appId: string
  private appSecret: string
  private callbackUrl: string
  private readonly CHARACTER_LIMIT = 500

  constructor() {
    this.appId = process.env.THREADS_APP_ID || ''
    this.appSecret = process.env.THREADS_APP_SECRET || ''
    this.callbackUrl = process.env.FACEBOOK_CALLBACK_URL || ''

    if (!this.appId || !this.appSecret) {
      throw new Error('Threads API credentials not configured')
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
        `https://graph.threads.net/oauth/access_token?${params.toString()}`,
        {
          method: 'POST',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Threads OAuth failed: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
        tokenType: data.token_type || 'bearer',
      }
    } catch (error) {
      console.error('Threads authentication error:', error)
      throw error
    }
  }

  /**
   * Refresh/extend an access token
   */
  async refreshToken(accessToken: string): Promise<TokenResponse> {
    try {
      const params = new URLSearchParams({
        grant_type: 'th_exchange_token',
        client_secret: this.appSecret,
        access_token: accessToken,
      })

      const response = await fetch(
        `https://graph.threads.net/refresh_access_token?${params.toString()}`,
        {
          method: 'GET',
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Threads token refresh failed: ${error.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()

      return {
        accessToken: data.access_token,
        expiresIn: data.expires_in || 5184000,
        tokenType: 'bearer',
      }
    } catch (error) {
      console.error('Threads token refresh error:', error)
      throw error
    }
  }

  /**
   * Publish a thread
   */
  async publish(content: string, accessToken: string): Promise<PublishResult> {
    try {
      // Validate content before publishing
      if (!this.validateContent(content)) {
        return {
          success: false,
          platform: 'threads',
          error: `Content exceeds ${this.CHARACTER_LIMIT} character limit`,
        }
      }

      // Get Threads user ID
      const meResponse = await fetch(
        `https://graph.threads.net/v1.0/me?fields=id,username&access_token=${accessToken}`,
        {
          method: 'GET',
        }
      )

      if (!meResponse.ok) {
        const error = await meResponse.json()
        return {
          success: false,
          platform: 'threads',
          error: error.error?.message || 'Failed to get Threads user info',
        }
      }

      const meData = await meResponse.json()
      const threadsUserId = meData.id

      // Create a thread container
      const containerResponse = await fetch(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            media_type: 'TEXT',
            text: content,
            access_token: accessToken,
          }),
        }
      )

      if (!containerResponse.ok) {
        const error = await containerResponse.json()
        return {
          success: false,
          platform: 'threads',
          error: error.error?.message || 'Failed to create thread container',
        }
      }

      const containerData = await containerResponse.json()
      const containerId = containerData.id

      // Publish the container
      const publishResponse = await fetch(
        `https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creation_id: containerId,
            access_token: accessToken,
          }),
        }
      )

      if (!publishResponse.ok) {
        const error = await publishResponse.json()
        return {
          success: false,
          platform: 'threads',
          error: error.error?.message || 'Failed to publish thread',
        }
      }

      const publishData = await publishResponse.json()
      const threadId = publishData.id

      return {
        success: true,
        platform: 'threads',
        postId: threadId,
        postUrl: `https://www.threads.net/@${meData.username}/post/${threadId}`,
      }
    } catch (error) {
      console.error('Threads publish error:', error)
      return {
        success: false,
        platform: 'threads',
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Validate content against Threads' character limit
   */
  validateContent(content: string): boolean {
    return content.length > 0 && content.length <= this.CHARACTER_LIMIT
  }

  /**
   * Get Threads' character limit
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
      scope: 'threads_basic,threads_content_publish',
      response_type: 'code',
    })

    return `https://threads.net/oauth/authorize?${params.toString()}`
  }
}
