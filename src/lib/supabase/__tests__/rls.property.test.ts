/**
 * Property-Based Tests for Row Level Security (RLS) Policies
 * 
 * **Feature: snn-platform, Property 29: RLS policy enforcement**
 * 
 * For any table with RLS enabled, queries should only return rows that satisfy 
 * the RLS policy conditions based on auth.uid().
 * 
 * **Validates: Requirements 10.1**
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Tables with RLS that should be tested
const RLS_TABLES = [
  'profiles',
  'user_preferences',
  'generated_content',
  'social_integrations',
  'content_analytics',
  'user_activity',
  'saved_news',
  'content_schedule',
] as const;

describe('RLS Policy Enforcement Properties', () => {
  let serviceClient: ReturnType<typeof createClient<Database>>;
  let testUserIds: string[] = [];

  beforeAll(async () => {
    // Create service role client for setup
    serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create test users for property testing
    const userCount = 3;
    for (let i = 0; i < userCount; i++) {
      const email = `test-rls-${Date.now()}-${i}@example.com`;
      const password = `TestPassword${i}!`;
      
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
        testUserIds.push(data.user.id);
      }
    }
  });

  afterAll(async () => {
    // Cleanup test users
    for (const userId of testUserIds) {
      await serviceClient.auth.admin.deleteUser(userId);
    }
  });

  /**
   * Property 29: RLS policy enforcement
   * 
   * For any table with RLS enabled, when a user queries that table,
   * they should only see rows where they are authorized based on RLS policies.
   */
  it('should enforce RLS policies on profiles table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUserIds),
        async (userId) => {
          // Create a client authenticated as this user
          const { data: sessionData } = await serviceClient.auth.admin.generateLink({
            type: 'magiclink',
            email: `test-rls-${userId}@example.com`,
          });

          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);
          
          // Set the session for this user
          if (sessionData.properties?.access_token) {
            await userClient.auth.setSession({
              access_token: sessionData.properties.access_token,
              refresh_token: sessionData.properties.refresh_token || '',
            });
          }

          // Query profiles table
          const { data, error } = await userClient
            .from('profiles')
            .select('*');

          // Should not error
          expect(error).toBeNull();

          // Should only return the user's own profile (or empty if not created yet)
          if (data && data.length > 0) {
            expect(data.every(profile => profile.id === userId)).toBe(true);
            expect(data.length).toBeLessThanOrEqual(1);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 29: RLS policy enforcement for generated_content
   * 
   * Users should only see their own generated content
   */
  it('should enforce RLS policies on generated_content table', async () => {
    // First, create some test content for each user
    for (const userId of testUserIds) {
      await serviceClient
        .from('generated_content')
        .insert({
          user_id: userId,
          platform: 'linkedin',
          content_type: 'post',
          generated_text: `Test content for user ${userId}`,
          tone: 'professional',
          ai_model: 'gpt-4',
        });
    }

    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUserIds),
        async (userId) => {
          // Get user's email to create authenticated client
          const { data: userData } = await serviceClient.auth.admin.getUserById(userId);
          
          if (!userData.user?.email) {
            throw new Error('User email not found');
          }

          // Create authenticated client for this user
          const { data: signInData } = await serviceClient.auth.signInWithPassword({
            email: userData.user.email,
            password: `TestPassword${testUserIds.indexOf(userId)}!`,
          });

          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);
          
          if (signInData.session) {
            await userClient.auth.setSession({
              access_token: signInData.session.access_token,
              refresh_token: signInData.session.refresh_token,
            });
          }

          // Query generated_content table
          const { data, error } = await userClient
            .from('generated_content')
            .select('*');

          // Should not error
          expect(error).toBeNull();

          // Should only return content belonging to this user
          if (data) {
            expect(data.every(content => content.user_id === userId)).toBe(true);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 29: RLS policy enforcement for user_preferences
   * 
   * Users should only see their own preferences
   */
  it('should enforce RLS policies on user_preferences table', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUserIds),
        async (userId) => {
          // Get user's email
          const { data: userData } = await serviceClient.auth.admin.getUserById(userId);
          
          if (!userData.user?.email) {
            throw new Error('User email not found');
          }

          // Create authenticated client
          const { data: signInData } = await serviceClient.auth.signInWithPassword({
            email: userData.user.email,
            password: `TestPassword${testUserIds.indexOf(userId)}!`,
          });

          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);
          
          if (signInData.session) {
            await userClient.auth.setSession({
              access_token: signInData.session.access_token,
              refresh_token: signInData.session.refresh_token,
            });
          }

          // Query user_preferences table
          const { data, error } = await userClient
            .from('user_preferences')
            .select('*');

          // Should not error
          expect(error).toBeNull();

          // Should only return preferences for this user
          if (data && data.length > 0) {
            expect(data.every(pref => pref.user_id === userId)).toBe(true);
            expect(data.length).toBeLessThanOrEqual(1); // Should be at most one preferences record per user
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Property 29: Cross-user data isolation
   * 
   * A user should never be able to access another user's data
   */
  it('should prevent cross-user data access', async () => {
    // Create content for user 0
    const user0Id = testUserIds[0];
    const user1Id = testUserIds[1];

    await serviceClient
      .from('generated_content')
      .insert({
        user_id: user0Id,
        platform: 'twitter',
        content_type: 'post',
        generated_text: 'Private content for user 0',
        tone: 'professional',
        ai_model: 'gpt-4',
      });

    // Try to access as user 1
    const { data: user1Data } = await serviceClient.auth.admin.getUserById(user1Id);
    
    if (!user1Data.user?.email) {
      throw new Error('User email not found');
    }

    const { data: signInData } = await serviceClient.auth.signInWithPassword({
      email: user1Data.user.email,
      password: `TestPassword1!`,
    });

    const user1Client = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    
    if (signInData.session) {
      await user1Client.auth.setSession({
        access_token: signInData.session.access_token,
        refresh_token: signInData.session.refresh_token,
      });
    }

    // Query for all content
    const { data, error } = await user1Client
      .from('generated_content')
      .select('*');

    // Should not error
    expect(error).toBeNull();

    // Should not contain user 0's content
    if (data) {
      expect(data.every(content => content.user_id !== user0Id)).toBe(true);
      expect(data.every(content => content.user_id === user1Id)).toBe(true);
    }
  });

  /**
   * Property 29: Unauthenticated access should be denied
   * 
   * Unauthenticated users should not be able to access RLS-protected tables
   */
  it('should deny unauthenticated access to RLS-protected tables', async () => {
    const unauthClient = createClient<Database>(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

    for (const table of RLS_TABLES) {
      const { data, error } = await unauthClient
        .from(table as any)
        .select('*');

      // Should either error or return empty results
      if (!error) {
        expect(data).toEqual([]);
      }
    }
  });
});

