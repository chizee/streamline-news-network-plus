# Design Document: Social Media Publishing

## Overview

The Social Media Publishing feature enables users to connect their social media accounts via OAuth 2.0 and publish content directly to Twitter/X, Facebook, Instagram, and Threads. The system includes secure token storage, automated scheduled publishing via cron jobs, and comprehensive error handling.

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
┌────────▼────────┐                  ┌────────▼────────┐
│  OAuth Routes   │                  │ Publishing API  │
│  /api/auth/*    │                  │  /api/publish   │
└────────┬────────┘                  └────────┬────────┘
         │                                     │
         ├─────────────────────────────────────┤
         │                                     │
┌────────▼─────────────────────────────────────▼────────┐
│              Social Media Clients                     │
│  (Twitter, Facebook, Instagram, Threads)              │
└────────┬──────────────────────────────────────────────┘
         │
┌────────▼────────┐
│    Supabase     │
│   (Database)    │
└─────────────────┘

┌─────────────────┐
│   Cron Job      │
│  (Vercel/Edge)  │
└────────┬────────┘
         │
         └──────► Publishing API (for scheduled posts)
```

### Component Layers

1. **UI Layer**: React components for connection management and publishing
2. **API Layer**: Next.js API routes for OAuth and publishing
3. **Service Layer**: Platform-specific client libraries
4. **Data Layer**: Supabase for token and status storage
5. **Automation Layer**: Cron job for scheduled publishing

## Components and Interfaces

### 1. OAuth Management Components

#### `SocialConnectionsManager` Component
- Displays connected social media accounts
- Provides connect/disconnect buttons for each platform
- Shows connection status and last sync time

#### `OAuthButton` Component
- Initiates OAuth flow for a specific platform
- Handles loading and error states
- Redirects to platform authorization

### 2. Publishing Components

#### `PublishDialog` Component
- Modal for selecting platforms to publish to
- Shows character count for each platform
- Validates content against platform limits
- Triggers publishing API calls

#### `PublishButton` Component
- Integrated into ContentCard and ContentPreview
- Shows publishing status (idle, publishing, published, failed)
- Handles multi-platform publishing

### 3. API Routes

#### `/api/auth/[platform]/route.ts`
- Initiates OAuth flow
- Handles OAuth callback
- Stores access and refresh tokens
- Returns connection status

#### `/api/auth/[platform]/disconnect/route.ts`
- Revokes OAuth tokens
- Removes stored credentials
- Returns disconnection status

#### `/api/publish/route.ts`
- Accepts content and target platforms
- Validates content for each platform
- Publishes to selected platforms
- Returns publishing results

#### `/api/publish/scheduled/route.ts`
- Cron endpoint for automated publishing
- Queries scheduled posts
- Publishes due posts
- Updates post status

### 4. Social Media Client Libraries

#### `TwitterClient`
```typescript
class TwitterClient {
  async authenticate(code: string): Promise<TokenResponse>
  async refreshToken(refreshToken: string): Promise<TokenResponse>
  async publish(content: string, accessToken: string): Promise<PublishResult>
  async validateContent(content: string): boolean
}
```

#### `FacebookClient`
```typescript
class FacebookClient {
  async authenticate(code: string): Promise<TokenResponse>
  async refreshToken(refreshToken: string): Promise<TokenResponse>
  async publish(content: string, accessToken: string): Promise<PublishResult>
  async validateContent(content: string): boolean
}
```

#### `InstagramClient`
```typescript
class InstagramClient {
  async authenticate(code: string): Promise<TokenResponse>
  async refreshToken(refreshToken: string): Promise<TokenResponse>
  async publish(content: string, accessToken: string): Promise<PublishResult>
  async validateContent(content: string): boolean
}
```

#### `ThreadsClient`
```typescript
class ThreadsClient {
  async authenticate(code: string): Promise<TokenResponse>
  async refreshToken(refreshToken: string): Promise<TokenResponse>
  async publish(content: string, accessToken: string): Promise<PublishResult>
  async validateContent(content: string): boolean
}
```

## Data Models

### Database Schema

#### `social_connections` Table
```sql
CREATE TABLE social_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'instagram', 'threads')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  platform_user_id TEXT,
  platform_username TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ,
  UNIQUE(user_id, platform)
);
```

#### `published_posts` Table
```sql
CREATE TABLE published_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES generated_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  platform_post_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'published', 'failed')),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, platform)
);
```

### TypeScript Interfaces

```typescript
interface SocialConnection {
  id: string
  userId: string
  platform: 'twitter' | 'facebook' | 'instagram' | 'threads'
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: Date
  platformUserId?: string
  platformUsername?: string
  connectedAt: Date
  lastRefreshedAt?: Date
}

interface PublishResult {
  success: boolean
  platform: string
  postId?: string
  postUrl?: string
  error?: string
}

interface TokenResponse {
  accessToken: string
  refreshToken?: string
  expiresIn: number
}

interface PublishRequest {
  contentId: string
  platforms: string[]
  content: string
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: OAuth Token Storage Security
*For any* OAuth token stored in the database, the token should be encrypted and never exposed in client-side code or API responses.
**Validates: Requirements 3.1, 3.2, 3.4**

### Property 2: Token Refresh Idempotency
*For any* expired access token, refreshing it multiple times should result in the same valid token being stored.
**Validates: Requirements 1.5, 3.3**

### Property 3: Publishing Status Consistency
*For any* content published to a platform, the status in the database should accurately reflect the actual publishing state on the platform.
**Validates: Requirements 2.6, 5.1, 5.2**

### Property 4: Scheduled Post Processing
*For any* scheduled post where scheduled_for <= NOW(), the cron job should process it exactly once and update its status.
**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

### Property 5: Multi-Platform Publishing Atomicity
*For any* content published to multiple platforms, if one platform fails, the others should still succeed independently.
**Validates: Requirements 2.7**

### Property 6: Character Limit Validation
*For any* content being published, the system should validate it against the target platform's character limit before attempting to publish.
**Validates: Requirements 6.4, 7.1, 7.2, 7.3, 7.4**

### Property 7: OAuth Disconnection Cleanup
*For any* social connection being disconnected, all associated tokens should be removed from the database and revoked with the platform.
**Validates: Requirements 1.6**

### Property 8: Retry Logic Exponential Backoff
*For any* failed API request, the system should retry with exponentially increasing delays up to the maximum retry count.
**Validates: Requirements 6.3**

### Property 9: Error Message Propagation
*For any* publishing failure, the error message should be captured and made available to the user for debugging.
**Validates: Requirements 2.5, 5.3, 6.5**

## Error Handling

### OAuth Errors
- **Invalid Authorization Code**: Prompt user to retry OAuth flow
- **Token Expiration**: Automatically refresh using refresh token
- **Refresh Token Invalid**: Prompt user to reconnect account
- **Network Errors**: Retry with exponential backoff

### Publishing Errors
- **Rate Limit Exceeded**: Display rate limit info and retry time
- **Content Too Long**: Show validation error before publishing
- **Invalid Credentials**: Prompt user to reconnect account
- **Network Timeout**: Retry up to 3 times
- **Platform API Error**: Display platform-specific error message

### Scheduled Publishing Errors
- **Cron Job Failure**: Log error and continue with next scheduled post
- **Token Expired During Cron**: Skip post and mark as failed with error
- **Multiple Failures**: Send notification to user after 3 consecutive failures

## Testing Strategy

### Unit Tests
- OAuth token encryption/decryption
- Content validation for each platform
- Error message formatting
- Token refresh logic

### Property-Based Tests
- Property 1: Token encryption security
- Property 2: Token refresh idempotency
- Property 3: Publishing status consistency
- Property 4: Scheduled post processing
- Property 5: Multi-platform publishing atomicity
- Property 6: Character limit validation
- Property 7: OAuth disconnection cleanup
- Property 8: Retry logic exponential backoff
- Property 9: Error message propagation

### Integration Tests
- Complete OAuth flow for each platform
- End-to-end publishing to each platform
- Scheduled publishing cron job execution
- Token refresh during publishing
- Multi-platform publishing

### Testing Framework
- **Unit Tests**: Jest with React Testing Library
- **Property-Based Tests**: fast-check library
- **Integration Tests**: Playwright for E2E flows
- **API Tests**: Supertest for API route testing

### Test Configuration
- Each property-based test should run a minimum of 100 iterations
- Each property-based test must be tagged with: `**Feature: social-publishing, Property {number}: {property_text}**`
- Mock external API calls for unit tests
- Use test accounts for integration tests

## Security Considerations

1. **Token Encryption**: Use AES-256 encryption for storing OAuth tokens
2. **HTTPS Only**: All OAuth flows must use HTTPS
3. **CSRF Protection**: Implement state parameter in OAuth flows
4. **Token Rotation**: Refresh tokens before expiration
5. **Rate Limiting**: Implement rate limiting on publishing endpoints
6. **Input Validation**: Sanitize all user input before publishing
7. **Audit Logging**: Log all OAuth and publishing events

## Performance Considerations

1. **Token Caching**: Cache decrypted tokens in memory for request duration
2. **Parallel Publishing**: Publish to multiple platforms concurrently
3. **Batch Processing**: Process scheduled posts in batches
4. **Connection Pooling**: Reuse HTTP connections for API calls
5. **Timeout Configuration**: Set appropriate timeouts for each platform API

## Platform-Specific Implementation Notes

### Twitter/X API v2
- OAuth 2.0 with PKCE
- Character limit: 280
- Rate limit: 50 tweets/24h (Basic), 100 tweets/24h (Elevated)
- Endpoint: `POST /2/tweets`

### Facebook Graph API
- OAuth 2.0
- Character limit: 63,206
- Rate limit: 200 calls/hour
- Endpoint: `POST /{page-id}/feed`

### Instagram Graph API
- OAuth 2.0 via Facebook
- Character limit: 2,200 (caption)
- Requires Instagram Business account
- Endpoint: `POST /{ig-user-id}/media`

### Threads API
- OAuth 2.0
- Character limit: 500
- Rate limit: Similar to Instagram
- Endpoint: `POST /threads`
