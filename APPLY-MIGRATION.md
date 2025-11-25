# How to Apply Database Migration

## Option 1: Using Supabase Dashboard (Recommended for now)

1. **Go to your Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project: `tucebjhxskjodugijicc`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and Paste the Migration:**
   - Open `supabase/migrations/001_initial_schema.sql`
   - Copy the entire contents
   - Paste into the SQL Editor

4. **Run the Migration:**
   - Click "Run" button (or press Ctrl/Cmd + Enter)
   - Wait for completion (should take a few seconds)
   - You should see "Success. No rows returned"

5. **Verify Tables Created:**
   - Click on "Table Editor" in the left sidebar
   - You should see all 9 tables:
     - profiles
     - user_preferences
     - news_articles
     - generated_content
     - social_integrations
     - content_analytics
     - user_activity
     - saved_news
     - content_schedule

## Option 2: Using Supabase CLI (For later)

Once you have Supabase CLI installed:

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref tucebjhxskjodugijicc

# Push migrations
supabase db push
```

## What This Migration Creates

### Tables (9 total):
1. **profiles** - User profile information
2. **user_preferences** - User settings and preferences
3. **news_articles** - Aggregated news content
4. **generated_content** - AI-generated social media posts
5. **social_integrations** - OAuth connections to social platforms
6. **content_analytics** - Performance metrics
7. **user_activity** - Activity logging
8. **saved_news** - User bookmarks
9. **content_schedule** - Scheduled posts

### Security:
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies ensure users can only access their own data
- ✅ News articles are publicly readable by authenticated users
- ✅ Automatic profile creation on user signup

### Performance:
- ✅ Indexes on frequently queried columns
- ✅ Optimized for fast lookups and filtering

### Automation:
- ✅ Automatic profile creation when user signs up
- ✅ Automatic updated_at timestamp updates
- ✅ Cascade deletes for data integrity

## After Migration

Once the migration is applied, I'll generate TypeScript types for type-safe database access.

## Troubleshooting

**If you get an error:**
1. Make sure you're connected to the correct project
2. Check if tables already exist (drop them if needed)
3. Verify you have admin access to the project

**Need help?** Let me know what error you see!
