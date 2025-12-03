-- SNN+ Database Setup Verification Script
-- Run this script to verify that all tables, policies, and functions are properly configured

-- =====================================================
-- CHECK TABLES EXIST
-- =====================================================
SELECT 
  'Tables Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 9 THEN '✓ PASS'
    ELSE '✗ FAIL - Expected 9 tables'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'profiles',
    'user_preferences',
    'news_articles',
    'generated_content',
    'social_integrations',
    'content_analytics',
    'user_activity',
    'saved_news',
    'content_schedule'
  );

-- =====================================================
-- CHECK RLS IS ENABLED
-- =====================================================
SELECT 
  'RLS Enabled Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) = 9 THEN '✓ PASS'
    ELSE '✗ FAIL - RLS not enabled on all tables'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND rowsecurity = true
  AND tablename IN (
    'profiles',
    'user_preferences',
    'news_articles',
    'generated_content',
    'social_integrations',
    'content_analytics',
    'user_activity',
    'saved_news',
    'content_schedule'
  );

-- =====================================================
-- CHECK RLS POLICIES EXIST
-- =====================================================
SELECT 
  'RLS Policies Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 20 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing RLS policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- CHECK INDEXES EXIST
-- =====================================================
SELECT 
  'Indexes Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing indexes'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE '%_idx';

-- =====================================================
-- CHECK FUNCTIONS EXIST
-- =====================================================
SELECT 
  'Functions Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 2 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing functions'
  END as status
FROM pg_proc 
WHERE proname IN ('handle_new_user', 'handle_updated_at');

-- =====================================================
-- CHECK TRIGGERS EXIST
-- =====================================================
SELECT 
  'Triggers Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 6 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing triggers'
  END as status
FROM pg_trigger 
WHERE tgname LIKE 'handle_%' OR tgname = 'on_auth_user_created';

-- =====================================================
-- DETAILED TABLE INFORMATION
-- =====================================================
SELECT 
  t.tablename,
  t.rowsecurity as rls_enabled,
  COUNT(DISTINCT p.policyname) as policy_count,
  COUNT(DISTINCT i.indexname) as index_count
FROM pg_tables t
LEFT JOIN pg_policies p ON p.tablename = t.tablename AND p.schemaname = t.schemaname
LEFT JOIN pg_indexes i ON i.tablename = t.tablename AND i.schemaname = t.schemaname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'profiles',
    'user_preferences',
    'news_articles',
    'generated_content',
    'social_integrations',
    'content_analytics',
    'user_activity',
    'saved_news',
    'content_schedule'
  )
GROUP BY t.tablename, t.rowsecurity
ORDER BY t.tablename;

-- =====================================================
-- CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================
SELECT 
  'Foreign Keys Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing foreign key constraints'
  END as status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'FOREIGN KEY';

-- =====================================================
-- CHECK UNIQUE CONSTRAINTS
-- =====================================================
SELECT 
  'Unique Constraints Check' as check_type,
  COUNT(*) as count,
  CASE 
    WHEN COUNT(*) >= 5 THEN '✓ PASS'
    ELSE '✗ FAIL - Missing unique constraints'
  END as status
FROM information_schema.table_constraints
WHERE constraint_schema = 'public'
  AND constraint_type = 'UNIQUE';

-- =====================================================
-- SUMMARY
-- =====================================================
SELECT 
  '=== VERIFICATION SUMMARY ===' as summary,
  CASE 
    WHEN (
      SELECT COUNT(*) FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ) >= 9
    AND (
      SELECT COUNT(*) FROM pg_tables 
      WHERE schemaname = 'public' AND rowsecurity = true
    ) >= 9
    AND (
      SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'
    ) >= 20
    THEN '✓ ALL CHECKS PASSED - Database setup is complete!'
    ELSE '✗ SOME CHECKS FAILED - Review the results above'
  END as overall_status;

