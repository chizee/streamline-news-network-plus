# Social Media OAuth - Complete Setup Guide

**Date:** December 3, 2025  
**Status:** All platforms configured for real OAuth

---

## ✅ What's Been Fixed

1. **Twitter OAuth** - Now redirects properly to Twitter authorization
2. **Facebook OAuth** - Configured for real user authentication
3. **Instagram OAuth** - Created OAuth flow (uses Facebook's system)
4. **Threads OAuth** - Created OAuth flow (uses Facebook's system)
5. **Development Mode** - Can be toggled on/off for testing

---

## 🔧 Twitter Loop Issue - Troubleshooting

If Twitter keeps looping without authorizing, check these:

### 1. Twitter Developer Portal Settings

**Go to:** https://developer.twitter.com/en/portal/dashboard

**Check App Settings → User authentication settings:**

```
✅ App permissions: Read and Write
✅ Type of App: Web App, Automated App or Bot
✅ OAuth 2.0: ON
```

**Callback URLs (must match exactly):**
```
http://localhost:3000/api/auth/twitter/callback
```

**Website URL:**
```
http://localhost:3000
```

### 2. Common Twitter OAuth Issues

**Issue: "Invalid callback URL"**
- Solution: Ensure callback URL in Twitter portal matches exactly
- No trailing slashes
- Check http vs https

**Issue: "App not approved"**
- Solution: Some Twitter apps need approval for elevated access
- Check app status in developer portal

**Issue: "Invalid client credentials"**
- Solution: Regenerate Client ID and Secret
- Update `.env.local` with new values
- Restart dev server

**Issue: Redirect loop**
- Solution: Clear browser cookies for localhost
- Clear Twitter OAuth cookies
- Try in incognito mode

### 3. Verify Environment Variables

Check `.env.local`:
```bash
TWITTER_CLIENT_ID=NXMyY2RNellYNmctd3QxMHM0VVQ6MTpjaQ
TWITTER_CLIENT_SECRET=5HuMMdKlYW4Px39nvNzOOT2z_FMDwHiPMoy5D3W3OlUgMNNnD1
TWITTER_CALLBACK_URL=http://localhost:3000/api/auth/twitter/callback
```

### 4. Test the OAuth Flow

1. Clear all cookies
2. Restart dev server: `npm run dev`
3. Go to Settings → Social Accounts
4. Click "Connect" for Twitter
5. Should redirect to Twitter authorization page
6. Authorize the app
7. Should redirect back to settings with success message

---

## 📱 Facebook OAuth Setup

### Developer Portal Configuration

**Go to:** https://developers.facebook.com/apps

**1. Create/Select Your App**
- App Type: Business
- Use case: Other

**2. Add Facebook Login Product**
- Settings → Basic
- Add Platform → Website
- Site URL: `http://localhost:3000`

**3. Configure OAuth Settings**
- Facebook Login → Settings
- Valid OAuth Redirect URIs:
  ```
  http://localhost:3000/api/auth/facebook/callback
  ```

**4. Get Credentials**
- Settings → Basic
- Copy App ID and App Secret

**5. Update `.env.local`:**
```bash
FACEBOOK_APP_ID=706825715832098
FACEBOOK_APP_SECRET=26732858dd0e5cba0f06c575cbce5624
FACEBOOK_CALLBACK_URL=http://localhost:3000/api/auth/facebook/callback
```

**6. Permissions Needed:**
- `pages_manage_posts` - To post to Facebook pages
- `pages_read_engagement` - To read page insights
- `publish_to_groups` - To post to groups (optional)

---

## 📸 Instagram OAuth Setup

Instagram uses Facebook's OAuth system.

### Developer Portal Configuration

**Go to:** https://developers.facebook.com/apps

**1. Add Instagram Product**
- Products → Instagram → Set Up
- Instagram Basic Display or Instagram Graph API

**2. Configure OAuth**
- Valid OAuth Redirect URIs:
  ```
  http://localhost:3000/api/auth/instagram/callback
  ```

**3. Get Credentials**
- Use same App ID and Secret as Facebook
- Or create separate Instagram app

**4. Update `.env.local`:**
```bash
INSTAGRAM_APP_ID=4299676923608884
INSTAGRAM_APP_SECRET=ea9e03566bc1821caac931689a7d8de4
```

**5. Permissions Needed:**
- `instagram_basic` - Basic profile access
- `instagram_content_publish` - To publish posts

---

## 🧵 Threads OAuth Setup

Threads uses Facebook's OAuth system.

### Developer Portal Configuration

**Go to:** https://developers.facebook.com/apps

**1. Add Threads Product**
- Products → Threads → Set Up
- Threads API access

**2. Configure OAuth**
- Valid OAuth Redirect URIs:
  ```
  http://localhost:3000/api/auth/threads/callback
  ```

**3. Get Credentials**
- Use Facebook App credentials

**4. Update `.env.local`:**
```bash
THREADS_APP_ID=1619429509417745
THREADS_APP_SECRET=c84cadda1a934b0e730b631e5a2b93cb
```

**5. Permissions Needed:**
- `threads_basic` - Basic profile access
- `threads_content_publish` - To publish threads

---

## 🔄 Development Mode vs Real OAuth

### Enable Development Mode

**In `.env.local`:**
```bash
NEXT_PUBLIC_OAUTH_DEV_MODE=true
```

**What it does:**
- Simulates OAuth connections without real API calls
- Perfect for UI testing
- Shows "(Dev Mode)" indicator
- No real tokens stored

### Disable for Real OAuth

**In `.env.local`:**
```bash
NEXT_PUBLIC_OAUTH_DEV_MODE=false
```

**What it does:**
- Uses real OAuth flows
- Redirects to actual social media platforms
- Stores real access tokens
- Required for actual posting

---

## 🧪 Testing Each Platform

### Test Checklist

**For each platform:**

1. ✅ Verify credentials in `.env.local`
2. ✅ Check callback URL in developer portal
3. ✅ Restart dev server
4. ✅ Clear browser cookies
5. ✅ Click "Connect" in Settings
6. ✅ Should redirect to platform OAuth page
7. ✅ Authorize the app
8. ✅ Should redirect back with success
9. ✅ Connection should show as "Connected"

### Expected Flow

```
[Your App] 
  ↓ Click "Connect"
[/api/auth/{platform}] 
  ↓ Generates OAuth URL
[Platform OAuth Page] 
  ↓ User authorizes
[/api/auth/{platform}/callback] 
  ↓ Exchanges code for token
[Database] 
  ↓ Stores encrypted token
[Settings Page] 
  ↓ Shows "Connected"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to connect"

**Check:**
1. Environment variables are set correctly
2. No typos in credentials
3. Callback URLs match exactly
4. Dev server was restarted after env changes

### Issue: "OAuth state mismatch"

**Solution:**
- Clear browser cookies
- Try in incognito mode
- Check if cookies are being set properly

### Issue: "Invalid redirect URI"

**Solution:**
- Verify callback URL in developer portal
- Must match exactly (no trailing slash)
- Check http vs https

### Issue: "App not authorized"

**Solution:**
- Check app status in developer portal
- Some platforms require app review
- Use test users during development

---

## 📊 Database Schema

Connections are stored in `social_connections` table:

```sql
CREATE TABLE social_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  platform TEXT NOT NULL,
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  access_token TEXT NOT NULL, -- Encrypted
  refresh_token TEXT, -- Encrypted
  token_expires_at TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB
);
```

---

## 🔐 Security Notes

### Token Encryption

All access tokens are encrypted before storage using AES-256-GCM:

```typescript
import { encryptToken } from '@/lib/security/encryption'

const encryptedToken = encryptToken(accessToken)
```

### PKCE Flow (Twitter)

Twitter uses PKCE (Proof Key for Code Exchange) for enhanced security:

1. Generate code verifier and challenge
2. Store verifier in secure cookie
3. Send challenge to Twitter
4. Exchange code + verifier for token

### State Parameter

All OAuth flows use state parameter for CSRF protection:

1. Generate random state
2. Store in secure cookie
3. Verify on callback

---

## 🚀 Next Steps

### After Connecting Accounts

1. **Test Publishing**
   - Go to Content Library
   - Generate content
   - Click "Publish"
   - Select connected platforms

2. **Schedule Posts**
   - Create content
   - Click "Schedule"
   - Choose date/time
   - Select platforms

3. **View Analytics**
   - Go to Analytics Dashboard
   - See performance across platforms
   - Track engagement metrics

---

## 📝 Files Modified

### OAuth Routes Created/Updated:
- ✅ `src/app/api/auth/twitter/route.ts` - Fixed redirect
- ✅ `src/app/api/auth/facebook/route.ts` - Fixed redirect
- ✅ `src/app/api/auth/instagram/route.ts` - Created
- ✅ `src/app/api/auth/threads/route.ts` - Created

### Components Updated:
- ✅ `src/components/social/SocialConnectionsManager.tsx` - Added dev mode

### Environment:
- ✅ `.env.local` - All credentials configured

---

## 🎯 Summary

All social media OAuth flows are now configured and ready to use:

- **Twitter** ✅ OAuth 2.0 with PKCE
- **Facebook** ✅ OAuth 2.0
- **Instagram** ✅ OAuth 2.0 (via Facebook)
- **Threads** ✅ OAuth 2.0 (via Facebook)

Development mode available for UI testing without real OAuth.

---

*Setup completed: December 3, 2025*  
*All platforms ready for real user authentication! 🎉*
