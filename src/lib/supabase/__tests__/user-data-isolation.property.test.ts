/**
 * Property-Based Tests for User Data Isolation
 * 
 * **Feature: snn-platform, Property 6: User data isolation through RLS**
 * 
 * For any user querying their profile, preferences, content, or integrations,
 * the system should return only data where the user_id matches auth.uid().
 * 
 * **Validates: Requirements 2.4, 10.2, 10.3, 10.4, 10.5**
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// User-specific tables that should enforce data isolation
const USER_TABLES = [
  'profiles',
  'user_preferences',
  'generated_content',
  'social_integrations',
  'user_activity',
  'saved_news',
  'content_schedule',
] as const;

describe('User Data Isolation Properties', () => {
  let serviceClient: ReturnType<typeof createClient<Database>>;
  let testUsers: Array<{ id: string; email: string; password: string }> = [];

  beforeAll(async () => {
    // Create service role client for setup
    serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create multiple test users
    const userCount = 5;
    for (let i = 0; i < userCount; i++) {
      const email = `test-isolation-${Date.now()}-${i}@example.com`;
      const password = `TestPassword${i}!SecurePass`;
      
      const { data, error } = await serviceClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (error) {
        console.error(`Failed to create test user ${i}:`, error);
        throw error;
      }

      if (data.user) {
        testUsers.push({ id: data.user.id, email, password });
        
        // Create some test data for each user
        await serviceClient
          .from('generated_content')
          .insert({
            user_id: data.user.id,
            platform: 'linkedin',
            content_type: 'post',
            generated_text: `Test content for user ${i}`,
            tone: 'professional',
            ai_model: 'gpt-4',
          });
      }
    }
  });

  afterAll(async () => {
    // Cleanup test users and their data
    for (const user of testUsers) {
      await serviceClient.auth.admin.deleteUser(user.id);
    }
  });

  /**
   * Property 6: Profile data isolation
   * 
   * For any user, querying the profiles table should only return their own profile
   */
  it('should isolate profile data per user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          // Create authenticated client for this user
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          const { data: signInData, error: signInError } = await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          expect(signInError).toBeNull();
          expect(signInData.session).not.toBeNull();

          // Query profiles
          const { data, error } = await userClient
            .from('profiles')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's profile
          if (data && data.length > 0) {
            expect(data.length).toBeLessThanOrEqual(1);
            expect(data[0].id).toBe(user.id);
            expect(data[0].email).toBe(user.email);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Preferences data isolation
   * 
   * For any user, querying user_preferences should only return their own preferences
   */
  it('should isolate preferences data per user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query preferences
          const { data, error } = await userClient
            .from('user_preferences')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's preferences
          if (data && data.length > 0) {
            expect(data.every(pref => pref.user_id === user.id)).toBe(true);
            expect(data.length).toBeLessThanOrEqual(1); // One preferences record per user
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Generated content data isolation
   * 
   * For any user, querying generated_content should only return their own content
   */
  it('should isolate generated content per user', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query generated content
          const { data, error } = await userClient
            .from('generated_content')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's content
          if (data) {
            expect(data.every(content => content.user_id === user.id)).toBe(true);
            expect(data.length).toBeGreaterThan(0); // We created content for each user
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Social integrations data isolation
   * 
   * For any user, querying social_integrations should only return their own integrations
   */
  it('should isolate social integrations per user', async () => {
    // First, create some integrations for each user
    for (const user of testUsers) {
      await serviceClient
        .from('social_integrations')
        .insert({
          user_id: user.id,
          platform: 'linkedin',
          is_connected: true,
        });
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query social integrations
          const { data, error } = await userClient
            .from('social_integrations')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's integrations
          if (data) {
            expect(data.every(integration => integration.user_id === user.id)).toBe(true);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Cross-user data access prevention
   * 
   * For any two different users, user A should never be able to access user B's data
   */
  it('should prevent cross-user data access', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(...testUsers),
          fc.constantFrom(...testUsers)
        ).filter(([userA, userB]) => userA.id !== userB.id),
        async ([userA, userB]) => {
          // Sign in as user A
          const userAClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userAClient.auth.signInWithPassword({
            email: userA.email,
            password: userA.password,
          });

          // Try to query generated_content (which has data for both users)
          const { data, error } = await userAClient
            .from('generated_content')
            .select('*');

          expect(error).toBeNull();

          // Should not contain user B's data
          if (data) {
            expect(data.every(content => content.user_id === userA.id)).toBe(true);
            expect(data.every(content => content.user_id !== userB.id)).toBe(true);
          }

          await userAClient.auth.signOut();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 6: User activity isolation
   * 
   * For any user, querying user_activity should only return their own activity logs
   */
  it('should isolate user activity logs per user', async () => {
    // Create activity logs for each user
    for (const user of testUsers) {
      await serviceClient
        .from('user_activity')
        .insert({
          user_id: user.id,
          activity_type: 'login',
          metadata: { timestamp: new Date().toISOString() },
        });
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query user activity
          const { data, error } = await userClient
            .from('user_activity')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's activity
          if (data) {
            expect(data.every(activity => activity.user_id === user.id)).toBe(true);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Saved news isolation
   * 
   * For any user, querying saved_news should only return their own bookmarks
   */
  it('should isolate saved news per user', async () => {
    // First, create a news article
    const { data: article } = await serviceClient
      .from('news_articles')
      .insert({
        title: 'Test Article for Isolation',
        url: `https://example.com/test-${Date.now()}`,
        source: 'Test Source',
        published_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (!article) {
      throw new Error('Failed to create test article');
    }

    // Create bookmarks for each user
    for (const user of testUsers) {
      await serviceClient
        .from('saved_news')
        .insert({
          user_id: user.id,
          article_id: article.id,
        });
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query saved news
          const { data, error } = await userClient
            .from('saved_news')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's bookmarks
          if (data) {
            expect(data.every(bookmark => bookmark.user_id === user.id)).toBe(true);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Content schedule isolation
   * 
   * For any user, querying content_schedule should only return their own scheduled content
   */
  it('should isolate content schedule per user', async () => {
    // Create scheduled content for each user
    for (const user of testUsers) {
      // First get a content_id for this user
      const { data: content } = await serviceClient
        .from('generated_content')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (content) {
        await serviceClient
          .from('content_schedule')
          .insert({
            user_id: user.id,
            content_id: content.id,
            scheduled_for: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          });
      }
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query content schedule
          const { data, error } = await userClient
            .from('content_schedule')
            .select('*');

          expect(error).toBeNull();

          // Should only return this user's scheduled content
          if (data) {
            expect(data.every(schedule => schedule.user_id === user.id)).toBe(true);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 6: Aggregate isolation check across all user tables
   * 
   * For any user, across all user-specific tables, no data from other users should be accessible
   */
  it('should enforce isolation across all user tables', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Check each user table
          for (const table of USER_TABLES) {
            const { data, error } = await userClient
              .from(table as any)
              .select('*');

            expect(error).toBeNull();

            // All returned data should belong to this user
            if (data && data.length > 0) {
              const hasUserId = 'user_id' in data[0];
              const hasId = 'id' in data[0];

              if (hasUserId) {
                expect(data.every((row: any) => row.user_id === user.id)).toBe(true);
              } else if (hasId && table === 'profiles') {
                expect(data.every((row: any) => row.id === user.id)).toBe(true);
              }
            }
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 15 }
    );
  });
});

