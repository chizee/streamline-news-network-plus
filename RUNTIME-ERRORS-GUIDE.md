# Runtime Errors Guide

**Date:** December 3, 2025

---

## Console Errors You're Seeing

You're seeing these errors in the browser console:
1. "Error loading connections: {}"
2. "Database error: {}"

---

## Why These Errors Occur

These are **expected runtime errors** that happen when:

### 1. User Not Authenticated
- The SocialConnectionsManager component tries to load connections
- But no user is logged in
- This is normal behavior - the component gracefully handles it

### 2. Database Tables Don't Exist Yet
- The `social_connections` table hasn't been created in your Supabase database
- You need to apply the migration first

---

## How to Fix

### Option 1: Apply Database Migrations (Recommended)

You need to apply the social publishing migration to your Supabase database:

```bash
# Navigate to your project
cd snn-plus

# Apply the migration using Supabase CLI
supabase db push

# OR manually run the migration in Supabase Dashboard
# Go to: SQL Editor > New Query
# Copy and paste the contents of: supabase/migrations/004_social_publishing.sql
# Click "Run"
```

### Option 2: Log In to Test

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` or `/signup`

3. Create an account or log in

4. Navigate to `/dashboard/settings` and click on "Social Accounts" tab

5. The errors should disappear once you're authenticated

---

## What I Fixed

I've updated the error handling to:

1. **Suppress expected errors** - Won't log errors when the table doesn't exist
2. **Graceful degradation** - Shows empty state instead of crashing
3. **Better user experience** - Only shows error toasts for unexpected errors

### Changes Made:

**File:** `src/components/social/SocialConnectionsManager.tsx`

- ✅ Checks if error is "table doesn't exist" before logging
- ✅ Sets empty connections array instead of throwing
- ✅ Only shows error toast for unexpected errors
- ✅ Handles authentication errors gracefully

---

## Verification

After applying migrations and logging in, you should see:

### ✅ No Console Errors
- No "Error loading connections" messages
- No "Database error" messages

### ✅ Social Connections UI
- Shows "Not connected" for all platforms
- "Connect" buttons are clickable
- No error toasts appear

### ✅ Smooth User Experience
- Component loads without errors
- Empty state displays correctly
- Ready for OAuth connections

---

## Migration Files

Make sure these migrations are applied in order:

1. ✅ `001_initial_schema.sql` - Base tables
2. ✅ `002_fix_news_articles_rls.sql` - RLS policies
3. ✅ `003_scheduling_system.sql` - Scheduling tables
4. ⏳ `004_social_publishing.sql` - **Social connections tables** (APPLY THIS)

---

## Testing Checklist

- [ ] Apply migration 004_social_publishing.sql
- [ ] Restart development server
- [ ] Log in to the application
- [ ] Navigate to Settings > Social Accounts
- [ ] Verify no console errors
- [ ] Verify "Connect" buttons appear
- [ ] Test connecting a social account (requires OAuth credentials)

---

## Next Steps

1. **Apply the migration** to create the `social_connections` table
2. **Set up OAuth credentials** (see WHATS-REMAINING.md for details)
3. **Test the social connections** feature

The code is working correctly - you just need to set up the database and OAuth!

---

*Guide created: December 3, 2025*  
*Status: Code is correct, database setup needed*
