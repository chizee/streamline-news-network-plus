# Fix OAuth Redirect to Localhost Issue

## 🔴 Problem
After logging in with Gmail (or any OAuth provider), the app redirects to `localhost` instead of your production URL.

## ✅ Solution
You need to update redirect URLs in **Supabase** and all **OAuth providers**.

---

## 1. Update Supabase Auth Settings (CRITICAL)

### Step 1: Go to Supabase Dashboard
🔗 https://supabase.com/dashboard/project/tucebjhxskjodugijicc/auth/url-configuration

### Step 2: Update Site URL
- **Site URL**: `https://streamline-news-network-plus.vercel.app`

### Step 3: Update Redirect URLs
Add these URLs to **Redirect URLs** section:

```
https://streamline-news-network-plus.vercel.app
https://streamline-news-network-plus.vercel.app/auth/callback
https://streamline-news-network-plus.vercel.app/dashboard
https://streamline-news-network-plus-chizees-projects.vercel.app
https://streamline-news-network-plus-chizees-projects.vercel.app/auth/callback
https://streamline-news-network-plus-chizees-projects.vercel.app/dashboard
```

**Optional (for local development):**
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
```

### Step 4: Save Changes
Click **Save** at the bottom of the page.

---

## 2. Update Vercel Environment Variables

The `.env.vercel` file has been updated with the correct production URL:
- ✅ `NEXT_PUBLIC_APP_URL=https://streamline-news-network-plus.vercel.app`
- ✅ All callback URLs updated

**Action Required:**
1. Re-import the updated `.env.vercel` file to Vercel
2. OR manually update these variables in Vercel dashboard:
   - `NEXT_PUBLIC_APP_URL` → `https://streamline-news-network-plus.vercel.app`
   - `TWITTER_CALLBACK_URL` → `https://streamline-news-network-plus.vercel.app/api/auth/twitter/callback`
   - `FACEBOOK_CALLBACK_URL` → `https://streamline-news-network-plus.vercel.app/api/auth/facebook/callback`

---

## 3. Update Twitter/X Developer Portal

### Step 1: Go to Twitter Developer Portal
🔗 https://developer.twitter.com/en/portal/dashboard

### Step 2: Select Your App
Find your app with Client ID: `NXMyY2RNellYNmctd3QxMHM0VVQ6MTpjaQ`

### Step 3: Update OAuth 2.0 Settings
Go to **App Settings → User authentication settings**

Update these fields:
- **Callback URI / Redirect URL**:
  ```
  https://streamline-news-network-plus.vercel.app/api/auth/twitter/callback
  ```
- **Website URL**:
  ```
  https://streamline-news-network-plus.vercel.app
  ```

### Step 4: Save Changes

---

## 4. Update Facebook Developer Console

### Step 1: Go to Facebook Developers
🔗 https://developers.facebook.com/apps/706825715832098

### Step 2: Update OAuth Redirect URIs
Go to **Settings → Basic** or **Facebook Login → Settings**

Add these **Valid OAuth Redirect URIs**:
```
https://streamline-news-network-plus.vercel.app/api/auth/facebook/callback
https://tucebjhxskjodugijicc.supabase.co/auth/v1/callback
```

### Step 3: Update App Domains
Add to **App Domains**:
```
streamline-news-network-plus.vercel.app
tucebjhxskjodugijicc.supabase.co
```

### Step 4: Update Site URL
```
https://streamline-news-network-plus.vercel.app
```

### Step 5: Save Changes

---

## 5. Update Instagram OAuth (via Facebook)

Instagram OAuth is managed through Facebook Developer Console.

### Step 1: Go to Instagram Basic Display
🔗 https://developers.facebook.com/apps/4299676923608884

### Step 2: Update Redirect URIs
Add these **Valid OAuth Redirect URIs**:
```
https://streamline-news-network-plus.vercel.app/api/auth/instagram/callback
https://tucebjhxskjodugijicc.supabase.co/auth/v1/callback
```

### Step 3: Save Changes

---

## 6. Update Threads OAuth (via Facebook)

Threads OAuth is also managed through Facebook Developer Console.

### Step 1: Go to Threads Settings
🔗 https://developers.facebook.com/apps/1619429509417745

### Step 2: Update Redirect URIs
Add these **Valid OAuth Redirect URIs**:
```
https://streamline-news-network-plus.vercel.app/api/auth/threads/callback
https://tucebjhxskjodugijicc.supabase.co/auth/v1/callback
```

### Step 3: Save Changes

---

## 7. Redeploy Your Vercel Application

After updating all the above:

1. Go to: https://vercel.com/chizees-projects/streamline-news-network-plus/deployments
2. Click the three dots (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

---

## 8. Test OAuth Login

After redeployment:

1. Go to: https://streamline-news-network-plus.vercel.app
2. Click **Login** or **Sign Up**
3. Try logging in with Gmail
4. You should now be redirected to the dashboard instead of localhost

---

## 🎯 Quick Checklist

- [ ] Update Supabase Site URL and Redirect URLs
- [ ] Update Vercel environment variables (re-import `.env.vercel`)
- [ ] Update Twitter Developer Portal callback URLs
- [ ] Update Facebook Developer Console redirect URIs
- [ ] Update Instagram OAuth redirect URIs
- [ ] Update Threads OAuth redirect URIs
- [ ] Redeploy Vercel application
- [ ] Test Gmail login
- [ ] Test other OAuth providers (Twitter, Facebook, etc.)

---

## 🔍 Troubleshooting

### Still redirecting to localhost?
1. Clear browser cache and cookies
2. Try in incognito/private mode
3. Check Supabase logs for redirect URL being used
4. Verify all environment variables are updated in Vercel

### OAuth errors?
1. Check that callback URLs match exactly (including https://)
2. Verify OAuth app is in production mode (not development)
3. Check that all required scopes are enabled
4. Review error messages in browser console

### Supabase errors?
1. Check that Supabase project is active
2. Verify API keys are correct
3. Check RLS policies allow authentication
4. Review Supabase Auth logs

---

## 📝 Important URLs Reference

**Your Production URL:**
```
https://streamline-news-network-plus.vercel.app
```

**Alternative Vercel URL:**
```
https://streamline-news-network-plus-chizees-projects.vercel.app
```

**Supabase Project URL:**
```
https://tucebjhxskjodugijicc.supabase.co
```

---

**Last Updated**: December 3, 2025
