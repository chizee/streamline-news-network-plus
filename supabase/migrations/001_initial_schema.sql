-- SNN+ Initial Database Schema
-- Created: November 25, 2025

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'free_user' check (role in ('free_user', 'pro_user', 'admin')),
  onboarding_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- USER PREFERENCES TABLE
-- =====================================================
create table public.user_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  notification_email boolean default true,
  notification_push boolean default true,
  notification_weekly_digest boolean default true,
  notification_breaking_news boolean default true,
  content_tone text default 'professional' check (content_tone in ('professional', 'friendly', 'witty', 'formal')),
  preferred_platforms text[] default array['linkedin', 'twitter'],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- =====================================================
-- NEWS ARTICLES TABLE
-- =====================================================
create table public.news_articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  content text,
  url text unique not null,
  source text not null,
  author text,
  published_at timestamp with time zone not null,
  image_url text,
  category text[] default array['ai'],
  keywords text[],
  sentiment text check (sentiment in ('positive', 'neutral', 'negative')),
  relevance_score decimal(3,2),
  fetched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- GENERATED CONTENT TABLE
-- =====================================================
create table public.generated_content (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  article_id uuid references public.news_articles(id) on delete set null,
  platform text not null check (platform in ('linkedin', 'twitter', 'instagram', 'facebook', 'threads')),
  content_type text not null check (content_type in ('post', 'thread', 'story', 'carousel')),
  generated_text text not null,
  generated_hashtags text[],
  image_url text,
  tone text not null,
  ai_model text not null,
  generation_time_ms integer,
  is_published boolean default false,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- SOCIAL INTEGRATIONS TABLE
-- =====================================================
create table public.social_integrations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  platform text not null check (platform in ('linkedin', 'twitter', 'instagram', 'facebook', 'threads')),
  is_connected boolean default false,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  platform_user_id text,
  platform_username text,
  connected_at timestamp with time zone,
  last_used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, platform)
);

-- =====================================================
-- CONTENT ANALYTICS TABLE
-- =====================================================
create table public.content_analytics (
  id uuid default uuid_generate_v4() primary key,
  content_id uuid references public.generated_content(id) on delete cascade not null,
  platform text not null,
  impressions integer default 0,
  engagements integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  clicks integer default 0,
  engagement_rate decimal(5,2),
  synced_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(content_id)
);

-- =====================================================
-- USER ACTIVITY TABLE
-- =====================================================
create table public.user_activity (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  activity_type text not null check (activity_type in ('login', 'generate_content', 'publish_content', 'view_news', 'connect_platform')),
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- SAVED NEWS TABLE (Bookmarks)
-- =====================================================
create table public.saved_news (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  article_id uuid references public.news_articles(id) on delete cascade not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, article_id)
);

-- =====================================================
-- CONTENT SCHEDULE TABLE
-- =====================================================
create table public.content_schedule (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.generated_content(id) on delete cascade not null,
  scheduled_for timestamp with time zone not null,
  is_published boolean default false,
  published_at timestamp with time zone,
  failed boolean default false,
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
create index news_articles_published_at_idx on public.news_articles(published_at desc);
create index news_articles_category_idx on public.news_articles using gin(category);
create index news_articles_url_idx on public.news_articles(url);
create index generated_content_user_id_idx on public.generated_content(user_id);
create index generated_content_platform_idx on public.generated_content(platform);
create index generated_content_created_at_idx on public.generated_content(created_at desc);
create index user_activity_user_id_idx on public.user_activity(user_id);
create index user_activity_created_at_idx on public.user_activity(created_at desc);
create index content_schedule_user_id_idx on public.content_schedule(user_id);
create index content_schedule_scheduled_for_idx on public.content_schedule(scheduled_for);
create index saved_news_user_id_idx on public.saved_news(user_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.news_articles enable row level security;
alter table public.generated_content enable row level security;
alter table public.social_integrations enable row level security;
alter table public.content_analytics enable row level security;
alter table public.user_activity enable row level security;
alter table public.saved_news enable row level security;
alter table public.content_schedule enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- User preferences policies
create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

-- News articles policies (public read for all authenticated users)
create policy "Authenticated users can view news"
  on public.news_articles for select
  to authenticated
  using (true);

-- Generated content policies
create policy "Users can view own content"
  on public.generated_content for select
  using (auth.uid() = user_id);

create policy "Users can create own content"
  on public.generated_content for insert
  with check (auth.uid() = user_id);

create policy "Users can update own content"
  on public.generated_content for update
  using (auth.uid() = user_id);

create policy "Users can delete own content"
  on public.generated_content for delete
  using (auth.uid() = user_id);

-- Social integrations policies
create policy "Users can view own integrations"
  on public.social_integrations for select
  using (auth.uid() = user_id);

create policy "Users can create own integrations"
  on public.social_integrations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own integrations"
  on public.social_integrations for update
  using (auth.uid() = user_id);

create policy "Users can delete own integrations"
  on public.social_integrations for delete
  using (auth.uid() = user_id);

-- Content analytics policies
create policy "Users can view own content analytics"
  on public.content_analytics for select
  using (
    exists (
      select 1 from public.generated_content
      where generated_content.id = content_analytics.content_id
      and generated_content.user_id = auth.uid()
    )
  );

create policy "Users can insert own content analytics"
  on public.content_analytics for insert
  with check (
    exists (
      select 1 from public.generated_content
      where generated_content.id = content_analytics.content_id
      and generated_content.user_id = auth.uid()
    )
  );

create policy "Users can update own content analytics"
  on public.content_analytics for update
  using (
    exists (
      select 1 from public.generated_content
      where generated_content.id = content_analytics.content_id
      and generated_content.user_id = auth.uid()
    )
  );

-- User activity policies
create policy "Users can view own activity"
  on public.user_activity for select
  using (auth.uid() = user_id);

create policy "Users can insert own activity"
  on public.user_activity for insert
  with check (auth.uid() = user_id);

-- Saved news policies
create policy "Users can view own saved news"
  on public.saved_news for select
  using (auth.uid() = user_id);

create policy "Users can create own saved news"
  on public.saved_news for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved news"
  on public.saved_news for delete
  using (auth.uid() = user_id);

-- Content schedule policies
create policy "Users can view own scheduled content"
  on public.content_schedule for select
  using (auth.uid() = user_id);

create policy "Users can create own scheduled content"
  on public.content_schedule for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scheduled content"
  on public.content_schedule for update
  using (auth.uid() = user_id);

create policy "Users can delete own scheduled content"
  on public.content_schedule for delete
  using (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to automatically create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  
  insert into public.user_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$;

-- Trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

-- Triggers for updated_at
create trigger handle_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.user_preferences
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.generated_content
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.social_integrations
  for each row execute procedure public.handle_updated_at();

create trigger handle_updated_at before update on public.content_schedule
  for each row execute procedure public.handle_updated_at();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
comment on table public.profiles is 'User profiles linked to auth.users';
comment on table public.user_preferences is 'User-specific settings and preferences';
comment on table public.news_articles is 'Aggregated news articles from various sources';
comment on table public.generated_content is 'AI-generated social media content';
comment on table public.social_integrations is 'OAuth connections to social media platforms';
comment on table public.content_analytics is 'Performance metrics for published content';
comment on table public.user_activity is 'Activity log for user actions';
comment on table public.saved_news is 'User bookmarks for news articles';
comment on table public.content_schedule is 'Scheduled content for future publication';
