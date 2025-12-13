# Quick Import Instructions for Vercel Environment Variables

## 🚀 Fast Method - Import All at Once

### Step 1: Copy the .env.vercel file contents
Open the file `snn-plus/.env.vercel` and copy ALL the contents (Ctrl+A, Ctrl+C)

### Step 2: Go to Vercel Environment Variables
🔗 **Direct Link**: https://vercel.com/chizees-projects/streamline-news-network-plus/settings/environment-variables

### Step 3: Click "Import .env" Button
Look for the **"Import .env"** button (see the screenshot you provided - it's circled in orange)

### Step 4: Paste the contents
Paste all the contents from `.env.vercel` into the text area

### Step 5: Select Environments
**IMPORTANT**: Make sure to select ALL THREE environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

You can use the dropdown at the top that says "All Environments" to select all at once.

### Step 6: Click "Save"
Click the Save button to import all 23 environment variables at once

---

## ✅ What Gets Imported

The import will add these 23 variables:

**Critical (4 variables)**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_APP_URL

**AI APIs (3 variables)**
- OPENAI_API_KEY
- ANTHROPIC_API_KEY
- GOOGLE_AI_API_KEY

**News APIs (4 variables)**
- SERPER_API_KEY
- NEWS_API_KEY
- MEDIASTACK_API_KEY
- GNEWS_API_KEY

**Twitter OAuth (3 variables)**
- TWITTER_CLIENT_ID
- TWITTER_CLIENT_SECRET
- TWITTER_CALLBACK_URL

**Facebook OAuth (3 variables)**
- FACEBOOK_APP_ID
- FACEBOOK_APP_SECRET
- FACEBOOK_CALLBACK_URL

**Instagram OAuth (2 variables)**
- INSTAGRAM_APP_ID
- INSTAGRAM_APP_SECRET

**Threads OAuth (2 variables)**
- THREADS_APP_ID
- THREADS_APP_SECRET

**Security & Config (2 variables)**
- ENCRYPTION_KEY
- NEXT_PUBLIC_OAUTH_DEV_MODE

---

## 🔄 After Import - Redeploy

1. Go to: https://vercel.com/chizees-projects/streamline-news-network-plus/deployments
2. Find the latest deployment (currently showing ERROR)
3. Click the three dots menu (⋯)
4. Click **"Redeploy"**
5. Wait for the build to complete

---

## 🎯 Expected Result

After redeployment:
- ✅ Build status changes from ERROR to READY
- ✅ Your app is live at: https://streamline-news-network-plus-chizees-projects.vercel.app
- ✅ All features work (news feed, AI generation, etc.)

---

## 📝 Post-Deployment Tasks

After successful deployment, update OAuth callback URLs in:

1. **Twitter Developer Portal** (https://developer.twitter.com/)
   - Update callback to: `https://streamline-news-network-plus-chizees-projects.vercel.app/api/auth/twitter/callback`

2. **Facebook Developer Console** (https://developers.facebook.com/)
   - Update callback to: `https://streamline-news-network-plus-chizees-projects.vercel.app/api/auth/facebook/callback`

3. **Instagram/Threads** (via Facebook Developer Console)
   - Same callback URL pattern

---

## ⚠️ Troubleshooting

**If import fails:**
- Make sure you copied the ENTIRE file contents
- Check that no extra spaces or characters were added
- Try importing in smaller batches if needed

**If build still fails:**
- Check the build logs for specific errors
- Verify all variables were imported correctly
- Ensure all three environments are selected

---

## 📁 File Location

The import file is located at:
```
snn-plus/.env.vercel
```

**Note**: This file is for Vercel import only. Your local `.env.local` file remains unchanged.

---

**Estimated Time**: 2-3 minutes to import + 3-5 minutes for redeployment = ~5-8 minutes total

Good luck! 🚀
