// Shared types for social media publishing

export type SocialPlatform = 'twitter' | 'facebook' | 'instagram' | 'threads'

export interface TokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  tokenType?: string
}

export interface PublishResult {
  success: boolean
  platform: SocialPlatform
  postId?: string
  postUrl?: string
  error?: string
}

export interface PublishOptions {
  content: string
  mediaUrls?: string[]
  scheduledFor?: Date
}

export interface SocialClient {
  authenticate(code: string): Promise<TokenResponse>
  refreshToken(refreshToken: string): Promise<TokenResponse>
  publish(content: string, accessToken: string): Promise<PublishResult>
  validateContent(content: string): boolean
  getCharacterLimit(): number
}
