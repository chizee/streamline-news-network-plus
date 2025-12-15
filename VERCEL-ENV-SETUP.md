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
GOOGLE_AI_API_KEY=AIzaSyDITTCvFGpOnthkZMVMCOn6GR5Ze7WrGsw
```

### News APIs
```
SERPER_API_KEY=aae9c6a69cf077682353213918722b4644280a88
NEWS_API_KEY=42b1d8bc08bb48ca99b1ae63acaf7f7c
MEDIASTACK_API_KEY=b8119acf0b9430de2c36035adfa5e850
GNEWS_API_KEY=a25de0bd9bf5bd98f3cd4d016594bb92
```

### Social Media OAuth
```
TWITTER_CLIENT_ID=NXMyY2RNellYNmctd3QxMHM0VVQ6MTpjaQ
TWITTER_CLIENT_SECRET=5HuMMdKlYW4Px39nvNzOOT2z_FMDwHiPMoy5D3W3OlUgMNNnD1
TWITTER_CALLBACK_URL=https://snn-plus.vercel.app/api/auth/twitter/callback

FACEBOOK_APP_ID=706825715832098
FACEBOOK_APP_SECRET=26732858dd0e5cba0f06c575cbce5624
FACEBOOK_CALLBACK_URL=https://snn-plus.vercel.app/api/auth/facebook/callback

INSTAGRAM_APP_ID=4299676923608884
INSTAGRAM_APP_SECRET=ea9e03566bc1821caac931689a7d8de4

THREADS_APP_ID=1619429509417745
THREADS_APP_SECRET=c84cadda1a934b0e730b631e5a2b93cb
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
