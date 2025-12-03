/**
 * Property-Based Tests for Public News Article Access
 * 
 * **Feature: snn-platform, Property 30: Public news article access**
 * 
 * For any authenticated user querying the news_articles table, all articles
 * should be accessible regardless of who fetched them.
 * 
 * **Validates: Requirements 10.6**
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import * as fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Test configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('Public News Article Access Properties', () => {
  let serviceClient: ReturnType<typeof createClient<Database>>;
  let testUsers: Array<{ id: string; email: string; password: string }> = [];
  let testArticleIds: string[] = [];

  beforeAll(async () => {
    // Create service role client for setup
    serviceClient = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create test users
    const userCount = 3;
    for (let i = 0; i < userCount; i++) {
      const email = `test-news-access-${Date.now()}-${i}@example.com`;
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
      }
    }

    // Create test news articles
    const articleCount = 10;
    for (let i = 0; i < articleCount; i++) {
      const { data, error } = await serviceClient
        .from('news_articles')
        .insert({
          title: `Test Article ${i} - ${Date.now()}`,
          url: `https://example.com/article-${Date.now()}-${i}`,
          source: `Test Source ${i % 3}`,
          published_at: new Date(Date.now() - i * 3600000).toISOString(), // Stagger by hours
          category: ['ai', 'machine-learning'],
          relevance_score: 0.8 + (i * 0.01),
        })
        .select('id')
        .single();

      if (error) {
        console.error(`Failed to create test article ${i}:`, error);
        throw error;
      }

      if (data) {
        testArticleIds.push(data.id);
      }
    }
  });

  afterAll(async () => {
    // Cleanup test articles
    for (const articleId of testArticleIds) {
      await serviceClient
        .from('news_articles')
        .delete()
        .eq('id', articleId);
    }

    // Cleanup test users
    for (const user of testUsers) {
      await serviceClient.auth.admin.deleteUser(user.id);
    }
  });

  /**
   * Property 30: All authenticated users can access all news articles
   * 
   * For any authenticated user, they should be able to query and access all news articles
   */
  it('should allow all authenticated users to access all news articles', async () => {
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

          // Query all news articles
          const { data, error } = await userClient
            .from('news_articles')
            .select('*');

          expect(error).toBeNull();
          expect(data).not.toBeNull();

          // Should return articles (at least our test articles)
          if (data) {
            expect(data.length).toBeGreaterThanOrEqual(testArticleIds.length);
            
            // Verify all our test articles are accessible
            const returnedIds = data.map(article => article.id);
            for (const testId of testArticleIds) {
              expect(returnedIds).toContain(testId);
            }
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Property 30: Different users see the same news articles
   * 
   * For any two authenticated users, they should see the same set of news articles
   */
  it('should return the same articles for different authenticated users', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(...testUsers),
          fc.constantFrom(...testUsers)
        ).filter(([userA, userB]) => userA.id !== userB.id),
        async ([userA, userB]) => {
          // Query as user A
          const clientA = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          await clientA.auth.signInWithPassword({
            email: userA.email,
            password: userA.password,
          });

          const { data: articlesA } = await clientA
            .from('news_articles')
            .select('id')
            .order('id');

          await clientA.auth.signOut();

          // Query as user B
          const clientB = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          await clientB.auth.signInWithPassword({
            email: userB.email,
            password: userB.password,
          });

          const { data: articlesB } = await clientB
            .from('news_articles')
            .select('id')
            .order('id');

          await clientB.auth.signOut();

          // Both users should see the same articles
          expect(articlesA).toEqual(articlesB);
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 30: News articles are readable by all authenticated users
   * 
   * For any news article and any authenticated user, the user should be able to read the article
   */
  it('should allow any authenticated user to read any news article', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(...testUsers),
          fc.constantFrom(...testArticleIds)
        ),
        async ([user, articleId]) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query specific article
          const { data, error } = await userClient
            .from('news_articles')
            .select('*')
            .eq('id', articleId)
            .single();

          expect(error).toBeNull();
          expect(data).not.toBeNull();
          expect(data?.id).toBe(articleId);

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 30 }
    );
  });

  /**
   * Property 30: Unauthenticated users cannot access news articles
   * 
   * For any unauthenticated request, news articles should not be accessible
   */
  it('should deny unauthenticated access to news articles', async () => {
    const unauthClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data, error } = await unauthClient
      .from('news_articles')
      .select('*');

    // Should either error or return empty results for unauthenticated users
    if (!error) {
      // If no error, should return empty array (depending on RLS policy)
      expect(data).toEqual([]);
    } else {
      // Or should have an authentication error
      expect(error).not.toBeNull();
    }
  });

  /**
   * Property 30: News article filtering works for all authenticated users
   * 
   * For any authenticated user, filtering news articles should work consistently
   */
  it('should allow authenticated users to filter news articles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(...testUsers),
          fc.constantFrom('ai', 'machine-learning', 'nlp')
        ),
        async ([user, category]) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query articles with category filter
          const { data, error } = await userClient
            .from('news_articles')
            .select('*')
            .contains('category', [category]);

          expect(error).toBeNull();

          // All returned articles should contain the category
          if (data) {
            expect(data.every(article => 
              article.category && article.category.includes(category)
            )).toBe(true);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 30: News article sorting works for all authenticated users
   * 
   * For any authenticated user, sorting news articles should work consistently
   */
  it('should allow authenticated users to sort news articles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...testUsers),
        async (user) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query articles sorted by published_at descending
          const { data, error } = await userClient
            .from('news_articles')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(10);

          expect(error).toBeNull();

          // Verify sorting
          if (data && data.length > 1) {
            for (let i = 0; i < data.length - 1; i++) {
              const currentDate = new Date(data[i].published_at);
              const nextDate = new Date(data[i + 1].published_at);
              expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
            }
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * Property 30: News article pagination works for all authenticated users
   * 
   * For any authenticated user, paginating through news articles should work consistently
   */
  it('should allow authenticated users to paginate news articles', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.tuple(
          fc.constantFrom(...testUsers),
          fc.integer({ min: 0, max: 5 }),
          fc.integer({ min: 1, max: 5 })
        ),
        async ([user, offset, limit]) => {
          const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
          
          await userClient.auth.signInWithPassword({
            email: user.email,
            password: user.password,
          });

          // Query with pagination
          const { data, error } = await userClient
            .from('news_articles')
            .select('*')
            .order('published_at', { ascending: false })
            .range(offset, offset + limit - 1);

          expect(error).toBeNull();

          // Should return at most 'limit' articles
          if (data) {
            expect(data.length).toBeLessThanOrEqual(limit);
          }

          await userClient.auth.signOut();
        }
      ),
      { numRuns: 20 }
    );
  });

  /**
   * Property 30: News article count is consistent across users
   * 
   * For any set of authenticated users, the total count of news articles should be the same
   */
  it('should return consistent article counts for all authenticated users', async () => {
    const counts: number[] = [];

    for (const user of testUsers) {
      const userClient = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
      
      await userClient.auth.signInWithPassword({
        email: user.email,
        password: user.password,
      });

      const { count, error } = await userClient
        .from('news_articles')
        .select('*', { count: 'exact', head: true });

      expect(error).toBeNull();
      
      if (count !== null) {
        counts.push(count);
      }

      await userClient.auth.signOut();
    }

    // All counts should be the same
    expect(new Set(counts).size).toBe(1);
    expect(counts[0]).toBeGreaterThanOrEqual(testArticleIds.length);
  });
});

