# Supabase Edge Functions

This directory contains Supabase Edge Functions that run in the Deno runtime.

## Important Note

**TypeScript errors in these files are expected in your IDE.** 

These functions use Deno-specific imports and globals (`Deno`, `jsr:` imports) that are not available in Node.js. Your IDE's TypeScript checker is configured for Node.js, so it will show errors for:

- `Cannot find name 'Deno'`
- `Cannot find module 'jsr:@supabase/supabase-js@2'`
- `Cannot find type definition file for 'https://esm.sh/...'`

**These errors can be safely ignored.** The code will work correctly when deployed to Supabase's Deno runtime.

## Functions

### fetch-news

Scheduled function that runs every 2 hours to fetch fresh AI news articles from multiple sources.

**Schedule:** Every 2 hours via Supabase Cron

**What it does:**
1. Calls the `/api/news/fetch` endpoint
2. Aggregates news from multiple APIs (Serper, NewsAPI, Mediastack, GNews, HackerNews)
3. Filters articles for AI relevance
4. Stores unique articles in the database

## Deployment

These functions are automatically deployed when you push to your Supabase project:

```bash
supabase functions deploy fetch-news
```

## Testing Locally

To test Edge Functions locally with Deno:

```bash
supabase functions serve fetch-news
```

Then trigger it:

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/fetch-news' \
  --header 'Authorization: Bearer YOUR_ANON_KEY'
```
