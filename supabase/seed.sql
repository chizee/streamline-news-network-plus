-- SNN+ Seed Data for Development Testing
-- This file contains sample data for local development and testing

-- Note: This seed data assumes you have at least one test user created through Supabase Auth
-- Replace 'YOUR_TEST_USER_ID' with an actual user ID from auth.users

-- =====================================================
-- SAMPLE NEWS ARTICLES
-- =====================================================

-- Insert sample AI news articles
INSERT INTO public.news_articles (
  title,
  description,
  content,
  url,
  source,
  author,
  published_at,
  image_url,
  category,
  keywords,
  sentiment,
  relevance_score
) VALUES
(
  'OpenAI Announces GPT-5 with Revolutionary Capabilities',
  'OpenAI unveils GPT-5, featuring enhanced reasoning and multimodal understanding that surpasses previous models.',
  'In a groundbreaking announcement, OpenAI has revealed GPT-5, the latest iteration of their language model series. The new model demonstrates significant improvements in reasoning, coding, and multimodal understanding...',
  'https://example.com/openai-gpt5-announcement',
  'TechCrunch',
  'Sarah Johnson',
  NOW() - INTERVAL '2 hours',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995',
  ARRAY['ai', 'machine-learning', 'nlp'],
  ARRAY['openai', 'gpt-5', 'language-model', 'artificial-intelligence'],
  'positive',
  0.95
),
(
  'Google DeepMind Achieves Breakthrough in Protein Folding',
  'AlphaFold 3 predicts protein structures with unprecedented accuracy, accelerating drug discovery.',
  'Google DeepMind''s AlphaFold 3 has achieved a major milestone in computational biology by predicting protein structures with near-perfect accuracy. This breakthrough is expected to revolutionize drug discovery and disease research...',
  'https://example.com/deepmind-alphafold3',
  'Nature',
  'Dr. Michael Chen',
  NOW() - INTERVAL '5 hours',
  'https://images.unsplash.com/photo-1576086213369-97a306d36557',
  ARRAY['ai', 'biotech', 'research'],
  ARRAY['deepmind', 'alphafold', 'protein-folding', 'drug-discovery'],
  'positive',
  0.92
),
(
  'AI Regulation: EU Passes Comprehensive AI Act',
  'European Union finalizes landmark legislation to regulate artificial intelligence systems.',
  'The European Parliament has passed the AI Act, establishing comprehensive regulations for AI systems operating within the EU. The legislation categorizes AI applications by risk level and sets strict requirements for high-risk systems...',
  'https://example.com/eu-ai-act-passed',
  'Reuters',
  'Emma Williams',
  NOW() - INTERVAL '8 hours',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  ARRAY['ai', 'policy', 'regulation'],
  ARRAY['eu', 'ai-act', 'regulation', 'policy', 'governance'],
  'neutral',
  0.88
),
(
  'Anthropic Releases Claude 3.5 with Enhanced Safety Features',
  'Claude 3.5 introduces new safety mechanisms and improved performance across various tasks.',
  'Anthropic has launched Claude 3.5, featuring advanced safety guardrails and constitutional AI principles. The model shows significant improvements in coding, analysis, and creative tasks while maintaining strong ethical boundaries...',
  'https://example.com/anthropic-claude-3-5',
  'VentureBeat',
  'Alex Martinez',
  NOW() - INTERVAL '12 hours',
  'https://images.unsplash.com/photo-1620712943543-bcc4688e7485',
  ARRAY['ai', 'safety', 'ethics'],
  ARRAY['anthropic', 'claude', 'ai-safety', 'constitutional-ai'],
  'positive',
  0.90
),
(
  'Startup Raises $100M for AI-Powered Climate Solutions',
  'ClimateAI secures major funding to develop AI models for climate change prediction and mitigation.',
  'ClimateAI, a startup focused on using artificial intelligence to combat climate change, has raised $100 million in Series B funding. The company plans to expand its AI models that predict extreme weather events and optimize renewable energy systems...',
  'https://example.com/climateai-funding',
  'Bloomberg',
  'Jennifer Lee',
  NOW() - INTERVAL '18 hours',
  'https://images.unsplash.com/photo-1569163139394-de4798aa62b6',
  ARRAY['ai', 'climate', 'startup'],
  ARRAY['climate-change', 'funding', 'renewable-energy', 'prediction'],
  'positive',
  0.85
),
(
  'Meta Unveils Llama 3 with Open-Source License',
  'Meta releases Llama 3, their most powerful open-source language model to date.',
  'Meta has announced Llama 3, continuing their commitment to open-source AI development. The model is available in multiple sizes and demonstrates competitive performance with proprietary models while remaining freely accessible to researchers and developers...',
  'https://example.com/meta-llama-3',
  'The Verge',
  'David Park',
  NOW() - INTERVAL '24 hours',
  'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
  ARRAY['ai', 'open-source', 'nlp'],
  ARRAY['meta', 'llama', 'open-source', 'language-model'],
  'positive',
  0.93
),
(
  'AI Detects Early Signs of Alzheimer''s with 95% Accuracy',
  'New AI system analyzes brain scans to identify Alzheimer''s disease years before symptoms appear.',
  'Researchers have developed an AI system that can detect early signs of Alzheimer''s disease with 95% accuracy by analyzing brain MRI scans. The breakthrough could enable earlier interventions and significantly improve patient outcomes...',
  'https://example.com/ai-alzheimers-detection',
  'Medical News Today',
  'Dr. Lisa Anderson',
  NOW() - INTERVAL '30 hours',
  'https://images.unsplash.com/photo-1559757175-5700dde675bc',
  ARRAY['ai', 'healthcare', 'research'],
  ARRAY['alzheimers', 'medical-ai', 'diagnosis', 'brain-scan'],
  'positive',
  0.91
),
(
  'GitHub Copilot Workspace: AI-Powered Development Environment',
  'GitHub introduces Copilot Workspace, an AI-native development environment for software engineering.',
  'GitHub has launched Copilot Workspace, a new AI-powered development environment that assists developers throughout the entire software development lifecycle. The tool can understand natural language requirements and generate complete implementations...',
  'https://example.com/github-copilot-workspace',
  'GitHub Blog',
  'Thomas Wright',
  NOW() - INTERVAL '36 hours',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c',
  ARRAY['ai', 'developer-tools', 'coding'],
  ARRAY['github', 'copilot', 'coding-assistant', 'developer-tools'],
  'positive',
  0.89
);

-- =====================================================
-- SAMPLE USER PREFERENCES
-- =====================================================

-- Note: Uncomment and update with your test user ID
-- INSERT INTO public.user_preferences (
--   user_id,
--   notification_email,
--   notification_push,
--   notification_weekly_digest,
--   notification_breaking_news,
--   content_tone,
--   preferred_platforms
-- ) VALUES (
--   'YOUR_TEST_USER_ID',
--   true,
--   true,
--   true,
--   false,
--   'professional',
--   ARRAY['linkedin', 'twitter']
-- )
-- ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- SAMPLE GENERATED CONTENT
-- =====================================================

-- Note: Uncomment and update with your test user ID and article IDs
-- INSERT INTO public.generated_content (
--   user_id,
--   article_id,
--   platform,
--   content_type,
--   generated_text,
--   generated_hashtags,
--   tone,
--   ai_model,
--   generation_time_ms
-- ) VALUES (
--   'YOUR_TEST_USER_ID',
--   (SELECT id FROM public.news_articles WHERE title LIKE '%GPT-5%' LIMIT 1),
--   'linkedin',
--   'post',
--   'Exciting news from OpenAI! GPT-5 has been announced with revolutionary capabilities that push the boundaries of what''s possible with AI. The enhanced reasoning and multimodal understanding represent a significant leap forward in language model technology. This development will undoubtedly impact how we approach problem-solving and creative tasks across industries. What are your thoughts on the implications of this advancement? #AI #OpenAI #GPT5 #ArtificialIntelligence #TechNews',
--   ARRAY['AI', 'OpenAI', 'GPT5', 'ArtificialIntelligence', 'TechNews'],
--   'professional',
--   'gpt-4',
--   2340
-- ),
-- (
--   'YOUR_TEST_USER_ID',
--   (SELECT id FROM public.news_articles WHERE title LIKE '%DeepMind%' LIMIT 1),
--   'twitter',
--   'post',
--   '🧬 Google DeepMind''s AlphaFold 3 just achieved a major breakthrough in protein folding! This could revolutionize drug discovery and disease research. The future of computational biology is here. #AI #DeepMind #AlphaFold #Biotech',
--   ARRAY['AI', 'DeepMind', 'AlphaFold', 'Biotech'],
--   'friendly',
--   'gpt-4',
--   1850
-- );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.news_articles IS 'Sample news articles for development testing';

-- Instructions for using this seed file:
-- 1. Create a test user through Supabase Auth dashboard or signup flow
-- 2. Copy the user ID from auth.users table
-- 3. Replace 'YOUR_TEST_USER_ID' in the commented sections above
-- 4. Uncomment the sections you want to seed
-- 5. Run this file against your Supabase database

