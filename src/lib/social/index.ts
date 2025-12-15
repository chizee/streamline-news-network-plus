// Social Media Publishing Clients

import { TwitterClient } from './twitter-client'
import { FacebookClient } from './facebook-client'
import { InstagramClient } from './instagram-client'
import { ThreadsClient } from './threads-client'

export { TwitterClient, FacebookClient, InstagramClient, ThreadsClient }

export type {
  SocialPlatform,
  TokenResponse,
  PublishResult,
  PublishOptions,
  SocialClient,
} from './types'

// Factory function to get the appropriate client
export function getSocialClient(platform: string) {
  switch (platform) {
    case 'twitter':
      return new TwitterClient()
    case 'facebook':
      return new FacebookClient()
    case 'instagram':
      return new InstagramClient()
    case 'threads':
      return new ThreadsClient()
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
