# Fix for News Articles Not Showing (RLS Policy Issue)

## Problem
News articles are being fetched successfully from the Serper API but not being stored in the database due to a Row-Level Security (RLS) policy violation.

**Error:** `new row violates row-level security policy for table "news_articles"`

## Root Cause
The `news_articles` table has RLS enabled but only has a SELECT policy for authenticated users. There's no INSERT or UPDATE policy, which prevents the news fetch API from storing articles.

## Solution
Apply the migration file `supabase/migrations/002_fix_news_articles_rls.sql` which adds the necessary RLS policies.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase/migrations/002_fix_news_articles_rls.sql`
4. Click **Run** to execute the SQL

### Option 2: Using Supabase CLI
```bash
cd snn-plus
npx supabase db push
```

### Option 3: Manual SQL Execution
Run this SQL in your Supabase SQL editor:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Service role can insert news" ON public.news_articles;
DROP POLICY IF EXISTS "Service role can update news" ON public.news_articles;

-- Allow authenticated users to insert news articles
CREATE POLICY "Service role can insert news"
  ON public.news_articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow authenticated users to update news articles  
CREATE POLICY "Service role can update news"
  ON public.news_articles FOR UPDATE
  TO authenticated
  USING (true);
```

## Verification
After applying the fix:

1. Navigate to `/dashboard/news` in your browser
2. The page should automatically fetch news articles
3. You should see articles displayed in the news feed
4. Check the browser console - there should be no errors
5. Check server logs - you should see messages like:
   ```
   Inserted new article: [Article Title]
   Stored 9 articles out of 9
   ```

## Additional Improvements Made

### 1. Date Parsing Fix
Fixed the Serper client to properly parse relative date strings like "14 hours ago" into ISO timestamps.

**File:** `src/lib/news/serper-client.ts`
- Added `parseRelativeDate()` method to convert relative dates to ISO format
- Handles patterns: "X hours ago", "X days ago", "X minutes ago"

### 2. Auto-Fetch on Empty News Feed
Added automatic news fetching when users visit the news page and there are no articles.

**Files Modified:**
- `src/app/dashboard/news/page.tsx` - Detects empty state and passes `shouldAutoFetch` prop
- `src/components/news/NewsFeedClient.tsx` - Implements auto-fetch with useEffect hook

### 3. Improved Article Storage Logic
Enhanced the `storeArticles()` function to better handle duplicates and provide detailed logging.

**File:** `src/app/api/news/fetch/route.ts`
- Uses `maybeSingle()` instead of `single()` to avoid errors when article doesn't exist
- Updates `fetched_at` timestamp for existing articles
- Provides detailed console logging for debugging

## Testing After Fix

1. **Clear existing articles** (optional, for clean test):
   ```sql
   DELETE FROM public.news_articles;
   ```

2. **Visit news page:**
   - Go to `http://localhost:3000/dashboard/news`
   - Articles should auto-fetch and display

3. **Manual refresh:**
   - Click the refresh button
   - Should see toast notification with number of articles fetched

4. **Check database:**
   ```sql
   SELECT COUNT(*) FROM public.news_articles;
   SELECT title, source, published_at FROM public.news_articles LIMIT 5;
   ```

## Expected Behavior After Fix

✅ News articles automatically fetch when page loads with no articles  
✅ Articles are stored in the database successfully  
✅ Articles display in the news feed UI  
✅ Refresh button fetches new articles  
✅ Duplicate articles are handled gracefully (update fetched_at timestamp)  
✅ No RLS policy violations in logs  

## Files Changed

1. `supabase/migrations/002_fix_news_articles_rls.sql` - NEW migration file
2. `src/lib/news/serper-client.ts` - Date parsing fix
3. `src/app/api/news/fetch/route.ts` - Improved storage logic
4. `src/app/dashboard/news/page.tsx` - Auto-fetch detection
5. `src/components/news/NewsFeedClient.tsx` - Auto-fetch implementation

