-- Fix RLS policy for news_articles to allow inserts from API
-- This allows the news fetch API (using service role) to insert articles

-- Drop existing policy if it exists
drop policy if exists "Service role can insert news" on public.news_articles;
drop policy if exists "Service role can update news" on public.news_articles;

-- Allow service role to insert news articles
create policy "Service role can insert news"
  on public.news_articles for insert
  to authenticated
  with check (true);

-- Allow service role to update news articles
create policy "Service role can update news"
  on public.news_articles for update
  to authenticated
  using (true);

