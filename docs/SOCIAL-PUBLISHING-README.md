# Social Media Publishing Feature

Complete documentation for the Social Media Publishing feature in SNN+.

## Overview

The Social Media Publishing feature enables users to:
- Connect social media accounts via OAuth 2.0
- Publish content directly to Twitter, Facebook, Instagram, and Threads
- Schedule posts for automatic publishing
- Track publishing status and analytics
- Manage multiple platform connections

## Table of Contents

1. [Setup](#setup)
2. [OAuth Configuration](#oauth-configuration)
3. [Usage](#usage)
4. [API Endpoints](#api-endpoints)
5. [Database Schema](#database-schema)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Setup

### Prerequisites

- Node.js 18+ and npm
- Supabase project with database access
- Social media developer accounts for OAuth apps

### Environment Variables

Add the following to your `.env.local`:

```bash
# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Cron Job Security
CRON_SECRET=your_random_secret_key

# Twitter/X OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Facebook OAuth
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Instagram OAuth (via Facebook)
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret

# Threads OAuth
THREADS_APP_ID=your_threads_app_id
THREADS_APP_SECRET=your_threads_app_secret
```

### Database Migrations

Run the social publishing migration:

```bash
# Apply migration 004
npx supabase db push
```

This creates:
- `social_connections` table
- `published_posts` table
- RLS policies
- Indexes

## OAuth Configuration

### Twitter/X Setup

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Enable OAuth 2.0
4. Add callback URL: `https://your-domain.com/api/auth/twitter/callback`
5. Copy Client ID and Client Secret

### Facebook Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Add callback URL: `https://your-domain.com/api/auth/facebook/callback`
5. Request `pages_manage_posts` permission
6. Copy App ID and App Secret

### Instagram Setup

1. Use same Facebook app
2. Add Instagram Basic Display product
3. Add callback URL: `https://your-domain.com/api/auth/instagram/callback`
4. Request `instagram_content_publish` permission
5. Copy App ID and App Secret

### Threads Setup

1. Go to [Threads API](https://developers.facebook.com/docs/threads)
2. Use Facebook app or create new one
3. Add callback URL: `https://your-domain.com/api/auth/threads/callback`
4. Request `threads_content_publish` permission
5. Copy App ID and App Secret

## Usage

### Connecting Accounts

1. Navigate to Settings → Social Connections
2. Click "Connect" for desired platform
3. Authorize the app on the platform
4. You'll be redirected back with connection confirmed

### Publishing Content

#### Manual Publishing

```typescript
// From Content Library or Content Preview
<PublishButton contentId={contentId} content={content} />
```

The PublishDialog allows:
- Select target platforms
- View character counts per platform
- See real-time validation
- Track publishing status

#### Scheduled Publishing

```typescript
// Schedule a post
await fetch('/api/schedule', {
  method: 'POST',
  body: JSON.stringify({
    contentId,
    scheduledFor: '2025-12-10T14:00:00Z',
  }),
})
```

Posts are automatically published by the cron job at the scheduled time.

### Viewing Published Posts

Navigate to Content Library to see:
- Publishing status badges
- Platform-specific post URLs
- Error messages (if any)
- Publishing timestamps

## API Endpoints

### OAuth Endpoints

#### Initiate OAuth
```
GET /api/auth/{platform}/route
```

Redirects to platform authorization page.

#### OAuth Callback
```
GET /api/auth/{platform}/callback
```

Handles OAuth callback and stores tokens.

#### Disconnect Account
```
POST /api/auth/{platform}/disconnect
```

Revokes tokens and removes connection.

### Publishing Endpoints

#### Publish Content
```
POST /api/publish
```

**Request Body:**
```json
{
  "contentId": "uuid",
  "content": "Post content here",
  "platforms": ["twitter", "facebook"]
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "success": true,
      "platform": "twitter",
      "postId": "123456",
      "postUrl": "https://twitter.com/user/status/123456"
    }
  ],
  "summary": {
    "total": 2,
    "successful": 2,
    "failed": 0
  }
}
```

#### Scheduled Publishing (Cron)
```
GET /api/publish/scheduled
```

Called by Vercel Cron every 5 minutes. Requires `CRON_SECRET` in Authorization header.

### Schedule Endpoints

#### Create Schedule
```
POST /api/schedule
```

**Request Body:**
```json
{
  "contentId": "uuid",
  "scheduledFor": "2025-12-10T14:00:00Z"
}
```

#### Get Scheduled Posts
```
GET /api/schedule
```

Returns all scheduled posts for the authenticated user.

#### Update Schedule
```
PATCH /api/schedule/{id}
```

#### Delete Schedule
```
DELETE /api/schedule/{id}
```

## Database Schema

### social_connections

Stores OAuth tokens for connected accounts.

```sql
CREATE TABLE social_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  platform TEXT CHECK (platform IN ('twitter', 'facebook', 'instagram', 'threads')),
  access_token TEXT NOT NULL,  -- Encrypted
  refresh_token TEXT,           -- Encrypted
  token_expires_at TIMESTAMPTZ,
  platform_user_id TEXT,
  platform_username TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_refreshed_at TIMESTAMPTZ,
  UNIQUE(user_id, platform)
);
```

### published_posts

Tracks publishing history and status.

```sql
CREATE TABLE published_posts (
  id UUID PRIMARY KEY,
  content_id UUID REFERENCES generated_content(id),
  user_id UUID REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  platform_post_id TEXT,
  platform_post_url TEXT,
  status TEXT CHECK (status IN ('pending', 'published', 'failed')),
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, platform)
);
```

### content_schedule

Stores scheduled posts (from migration 003).

```sql
CREATE TABLE content_schedule (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  content_id UUID REFERENCES generated_content(id),
  scheduled_for TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  failed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Testing

### Run All Tests

```bash
# All social publishing tests
npm test -- src/lib/social/__tests__/

# Specific test suites
npm test -- oauth-flows.integration.test.ts
npm test -- publishing.integration.test.ts
npm test -- scheduled-post-processing.property.test.ts
```

### Test Coverage

- **OAuth Flows**: 10 integration tests
- **Publishing**: 14 integration tests
- **Scheduled Publishing**: 4 property tests
- **Security**: Token encryption tests
- **Error Handling**: Retry logic tests
- **Total**: 54 tests, all passing ✅

### Property-Based Testing

Uses `fast-check` library with 100+ iterations per property:
- Token encryption security
- Token refresh idempotency
- Publishing status consistency
- Scheduled post processing
- Multi-platform atomicity
- Character limit validation
- OAuth disconnection cleanup
- Retry logic exponential backoff
- Error message propagation

## Deployment

### Vercel Deployment

1. **Push Code to Git**
   ```bash
   git add .
   git commit -m "Add social publishing feature"
   git push origin main
   ```

2. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all required variables from `.env.local.example`
   - Redeploy to apply changes

3. **Verify Cron Job**
   - Go to Project → Settings → Cron Jobs
   - Verify `/api/publish/scheduled` is listed
   - Check execution logs in Functions tab

4. **Apply Database Migrations**
   ```bash
   npx supabase db push --project-ref your-project-ref
   ```

### Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database migrations applied
- [ ] OAuth apps configured with production URLs
- [ ] Cron job verified in Vercel dashboard
- [ ] RLS policies tested
- [ ] Token encryption key is secure (32 characters)
- [ ] CRON_SECRET is secure and matches Vercel config
- [ ] All tests passing
- [ ] Error logging configured
- [ ] Rate limits understood for each platform

## Troubleshooting

### OAuth Issues

**Problem**: "OAuth callback failed"
- **Solution**: Verify callback URLs match exactly in platform settings
- Check that OAuth credentials are correct
- Ensure HTTPS is used in production

**Problem**: "Token expired"
- **Solution**: Token refresh should happen automatically
- Check `last_refreshed_at` in `social_connections` table
- Verify refresh token is valid

### Publishing Issues

**Problem**: "Content exceeds character limit"
- **Solution**: Content is validated before publishing
- Twitter: 280 chars
- Facebook: 63,206 chars
- Instagram: 2,200 chars
- Threads: 500 chars

**Problem**: "Rate limit exceeded"
- **Solution**: Respect platform rate limits
- Twitter: 50-100 tweets/24h depending on tier
- Facebook: 200 calls/hour
- Implement exponential backoff (already included)

### Scheduled Publishing Issues

**Problem**: "Scheduled posts not publishing"
- **Solution**: 
  - Verify cron job is running in Vercel
  - Check `CRON_SECRET` matches
  - Review cron execution logs
  - Ensure posts have `status='pending'` and `scheduled_for <= NOW()`

**Problem**: "Cron job timing out"
- **Solution**:
  - Vercel Hobby: 10s timeout
  - Vercel Pro: 60s timeout
  - Reduce batch size if processing too many posts

### Database Issues

**Problem**: "RLS policy blocking access"
- **Solution**: Verify user is authenticated
- Check `auth.uid()` matches `user_id` in queries
- Review RLS policies in Supabase dashboard

**Problem**: "Encryption/decryption errors"
- **Solution**: Verify `ENCRYPTION_KEY` is exactly 32 characters
- Ensure key hasn't changed (would invalidate existing tokens)
- Check encryption library is installed

## Platform-Specific Notes

### Twitter/X
- Requires OAuth 2.0 with PKCE
- Rate limits vary by API tier (Basic/Elevated)
- Character limit includes URLs (shortened to t.co links)

### Facebook
- Requires Page access token (not user token)
- Need `pages_manage_posts` permission
- Long-lived tokens valid for 60 days

### Instagram
- Requires Instagram Business account
- Must be linked to Facebook Page
- Media posts require image URL

### Threads
- New API, similar to Instagram
- Requires Threads account linked to Instagram
- Text-only posts supported

## Security Best Practices

1. **Token Storage**
   - All tokens encrypted with AES-256
   - Never expose tokens in client-side code
   - Tokens only decrypted when needed for API calls

2. **HTTPS Only**
   - All OAuth flows use HTTPS
   - Callback URLs must be HTTPS in production

3. **CSRF Protection**
   - State parameter used in OAuth flows
   - Verify state matches on callback

4. **Rate Limiting**
   - Implement rate limiting on publishing endpoints
   - Respect platform rate limits

5. **Input Validation**
   - Sanitize all user input
   - Validate content before publishing
   - Check character limits

6. **Audit Logging**
   - Log all OAuth events
   - Log all publishing attempts
   - Monitor for suspicious activity

## Support

For issues or questions:
1. Check this documentation
2. Review test files for examples
3. Check Supabase logs for database errors
4. Check Vercel logs for API errors
5. Review platform-specific documentation

## License

This feature is part of the SNN+ application.

---

*Last Updated: December 3, 2025*
