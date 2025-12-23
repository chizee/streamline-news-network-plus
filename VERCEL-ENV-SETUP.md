# Vercel Environment Variables Setup

## Instructions

1. Go to your Vercel project: https://vercel.com/chizees-projects/streamline-news-network-plus
2. Navigate to **Settings → Environment Variables**
3. Add each variable below
4. Select **Production**, **Preview**, and **Development** for each variable
5. Click **Save** after adding all variables
6. Go to **Deployments** and click **Redeploy** on the latest deployment

## Required Environment Variables

### Supabase (CRITICAL - Required for build)
```
NEXT_PUBLIC_SUPABASE_URL=https://tucebjhxskjodugijicc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y2Viamh4c2tqb2R1Z2lqaWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwODAzNTEsImV4cCI6MjA3OTY1NjM1MX0._UKplr1-fsCfrIWvFgS0FKCQM-Muq2VgZwcMoeCTLbs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1Y2Viamh4c2tqb2R1Z2lqaWNjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDA4MDM1MSwiZXhwIjoyMDc5NjU2MzUxfQ.NuGH7QMTU4mFXN58Hy3TlXd-iAq5v88phFbXWjBe-4c
```

### AI APIs
```
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

### News APIs
```
SERPER_API_KEY=your_serper_api_key_here
NEWS_API_KEY=your_news_api_key_here
MEDIASTACK_API_KEY=your_mediastack_api_key_here
GNEWS_API_KEY=your_gnews_api_key_here
```

### Social Media OAuth
```
TWITTER_CLIENT_ID=your_twitter_client_id_here
TWITTER_CLIENT_SECRET=your_twitter_client_secret_here
TWITTER_CALLBACK_URL=https://snn-plus.vercel.app/api/auth/twitter/callback

FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_CALLBACK_URL=https://snn-plus.vercel.app/api/auth/facebook/callback

INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here

THREADS_APP_ID=your_threads_app_id_here
THREADS_APP_SECRET=your_threads_app_secret_here
```

### Security & App Config
```
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
NEXT_PUBLIC_APP_URL=https://snn-plus.vercel.app
NEXT_PUBLIC_OAUTH_DEV_MODE=false
```

## Important Notes

1. **Update Callback URLs**: After deployment, update all `*_CALLBACK_URL` variables with your actual Vercel URL
2. **OAuth Apps**: You'll need to update callback URLs in:
   - Twitter Developer Portal
   - Facebook Developer Console
   - Instagram/Threads settings

3. **Vercel URL**: Replace `streamline-news-network-plus.vercel.app` with your actual deployment URL

## After Adding Variables

1. Click **Redeploy** on your latest deployment
2. The build should now succeed
3. Your app will be live at your Vercel URL

## Troubleshooting

If the build still fails:
- Check that all variables are added correctly
- Ensure you selected all three environments (Production, Preview, Development)
- Check the build logs for specific errors
