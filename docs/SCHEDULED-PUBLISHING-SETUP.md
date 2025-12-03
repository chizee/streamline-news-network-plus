# Scheduled Publishing Setup Guide

This guide explains how to configure and deploy the automated scheduled publishing feature.

## Overview

The scheduled publishing system automatically publishes content at scheduled times using Vercel Cron Jobs. The cron job runs every 5 minutes and checks for posts that are due to be published.

## Architecture

```
Vercel Cron (every 5 min)
    ↓
GET /api/publish/scheduled
    ↓
Query content_schedule table
    ↓
Publish to social platforms
    ↓
Update status in database
```

## Configuration Steps

### 1. Environment Variables

Add the following environment variables to your Vercel project:

```bash
# Required for cron job authentication
CRON_SECRET=your_random_secret_key_here

# Required for token encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# Social media OAuth credentials
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
THREADS_APP_ID=your_threads_app_id
THREADS_APP_SECRET=your_threads_app_secret
```

**Generate CRON_SECRET:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

**Generate ENCRYPTION_KEY:**
```bash
# Must be exactly 32 characters
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

### 2. Vercel Cron Configuration

The `vercel.json` file is already configured with the cron schedule:

```json
{
  "crons": [
    {
      "path": "/api/publish/scheduled",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

This runs every 5 minutes. You can adjust the schedule using standard cron syntax:
- `*/5 * * * *` - Every 5 minutes
- `*/10 * * * *` - Every 10 minutes
- `0 * * * *` - Every hour at minute 0
- `0 */2 * * *` - Every 2 hours

### 3. Deploy to Vercel

1. Push your code to your Git repository
2. Deploy to Vercel (cron jobs only work in production)
3. Add environment variables in Vercel dashboard
4. Redeploy to apply environment variables

### 4. Verify Cron Job

After deployment, verify the cron job is configured:

1. Go to your Vercel project dashboard
2. Navigate to "Settings" → "Cron Jobs"
3. You should see the scheduled publishing cron job listed
4. Check the execution logs to verify it's running

## Testing

### Local Testing

You can test the cron endpoint locally:

```bash
# Without authentication (for local testing)
curl http://localhost:3000/api/publish/scheduled

# With authentication
curl -H "Authorization: Bearer your_cron_secret" \
  http://localhost:3000/api/publish/scheduled
```

### Production Testing

```bash
# Test the production endpoint
curl -H "Authorization: Bearer your_cron_secret" \
  https://your-app.vercel.app/api/publish/scheduled
```

## Monitoring

### Check Cron Execution Logs

1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments"
3. Select your deployment
4. Click on "Functions" tab
5. Find `/api/publish/scheduled` function
6. View execution logs

### Database Monitoring

Query the `content_schedule` table to check processing status:

```sql
-- Check pending posts
SELECT * FROM content_schedule 
WHERE is_published = false 
AND failed = false 
AND scheduled_for <= NOW();

-- Check recently published posts
SELECT * FROM content_schedule 
WHERE is_published = true 
ORDER BY published_at DESC 
LIMIT 10;

-- Check failed posts
SELECT * FROM content_schedule 
WHERE failed = true 
ORDER BY updated_at DESC 
LIMIT 10;
```

## Troubleshooting

### Cron Job Not Running

1. **Verify deployment**: Cron jobs only work in production, not in preview deployments
2. **Check environment variables**: Ensure CRON_SECRET is set in Vercel
3. **Check Vercel logs**: Look for errors in the function logs
4. **Verify vercel.json**: Ensure the file is in the project root

### Posts Not Publishing

1. **Check social connections**: Verify OAuth tokens are valid
2. **Check content validation**: Ensure content meets platform character limits
3. **Check error messages**: Look at `error_message` field in `content_schedule` table
4. **Verify encryption key**: Ensure ENCRYPTION_KEY is set correctly

### Authentication Errors

If you see "Unauthorized" errors:
1. Verify CRON_SECRET matches in both Vercel and your cron request
2. Check that the Authorization header is being sent correctly
3. For Vercel cron jobs, the secret is automatically included

## Security Considerations

1. **CRON_SECRET**: Keep this secret secure. It prevents unauthorized access to the cron endpoint
2. **ENCRYPTION_KEY**: Never commit this to version control. Store it securely in Vercel environment variables
3. **OAuth Tokens**: All tokens are encrypted at rest using AES-256 encryption
4. **Rate Limiting**: Consider implementing rate limiting if you have many scheduled posts

## Performance

- The cron job processes posts sequentially to avoid rate limits
- Each execution processes all due posts in a single run
- Failed posts are marked and can be retried manually
- Successful posts are recorded in the `published_posts` table

## Limitations

- **Vercel Hobby Plan**: Cron jobs run with a 10-second execution timeout
- **Vercel Pro Plan**: Cron jobs run with a 60-second execution timeout
- **Rate Limits**: Respect platform-specific rate limits (Twitter: 50 tweets/24h, etc.)
- **Concurrent Publishing**: Posts are published sequentially, not in parallel

## Next Steps

1. Set up monitoring alerts for failed posts
2. Implement retry logic for failed posts
3. Add user notifications for publishing status
4. Create dashboard for viewing scheduled posts
