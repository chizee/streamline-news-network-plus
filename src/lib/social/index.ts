// Social Media Publishing Clients

export { TwitterClient } from './twitter-client'
export { FacebookClient } from './facebook-client'
export { InstagramClient } from './instagram-client'
export { ThreadsClient } from './threads-client'

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
      return new (require('./twitter-client').TwitterClient)()
    case 'facebook':
      return new (require('./facebook-client').FacebookClient)()
    case 'instagram':
      return new (require('./instagram-client').InstagramClient)()
    case 'threads':
      return new (require('./threads-client').ThreadsClient)()
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}
