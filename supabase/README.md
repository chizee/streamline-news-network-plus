# Supabase Database Setup

This directory contains database migrations, Edge Functions, and seed data for the SNN+ platform.

## Directory Structure

```
supabase/
├── migrations/          # Database schema migrations
│   ├── 001_initial_schema.sql
│   ├── 002_fix_news_articles_rls.sql
│   └── 003_scheduling_system.sql
├── functions/           # Supabase Edge Functions
│   └── fetch-news/      # Scheduled news fetching function
├── seed.sql            # Development seed data
└── README.md           # This file
```

## Database Schema

The database includes the following tables:

- **profiles** - User profile information
- **user_preferences** - User settings and preferences
- **news_articles** - Aggregated AI news articles
- **generated_content** - AI-generated social media posts
- **social_integrations** - OAuth connections to social platforms
- **content_analytics** - Performance metrics for published content
- **user_activity** - Activity logging for analytics
- **saved_news** - User bookmarks for articles
- **content_schedule** - Scheduled content for future publication

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access their own data
- News articles are publicly readable by all authenticated users
- Proper isolation between user accounts

## Running Migrations

### Local Development

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Start local Supabase:
```bash
supabase start
```

3. Apply migrations:
```bash
supabase db reset
```

### Production

Migrations are automatically applied when pushed to the Supabase dashboard or via CLI:

```bash
supabase db push
```

## Seed Data

To populate your development database with sample data:

1. Create a test user through the Supabase Auth dashboard or signup flow
2. Get the user ID from the `auth.users` table
3. Edit `seed.sql` and replace `YOUR_TEST_USER_ID` with your actual user ID
4. Uncomment the sections you want to seed
5. Run the seed file:

```bash
supabase db execute -f supabase/seed.sql
```

Or through the Supabase dashboard SQL editor.

## Generating TypeScript Types

After making schema changes, regenerate TypeScript types:

```bash
supabase gen types typescript --local > src/types/database.ts
```

For production:
```bash
supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.ts
```

## Edge Functions

### fetch-news

Scheduled function that runs every 2 hours to fetch fresh AI news articles.

Deploy Edge Functions:
```bash
supabase functions deploy fetch-news
```

## Environment Variables

Required environment variables for Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Backup and Recovery

### Creating a Backup

```bash
supabase db dump -f backup.sql
```

### Restoring from Backup

```bash
supabase db reset
psql -h localhost -p 54322 -U postgres -d postgres -f backup.sql
```

## Troubleshooting

### RLS Policies Not Working

1. Verify RLS is enabled on the table:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

2. Check policy definitions:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public';
```

### Migration Conflicts

If migrations fail due to conflicts:

1. Check migration history:
```bash
supabase migration list
```

2. Repair migration history:
```bash
supabase migration repair
```

### Connection Issues

Verify your connection string and credentials:
```bash
supabase status
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Edge Functions Guide](https://supabase.com/docs/guides/functions)
- [Database Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)

