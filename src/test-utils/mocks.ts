/**
 * Mock factories for testing
 */

import { NewsArticle } from '@/types/news'

export const mockNewsArticle = (overrides?: Partial<NewsArticle>): NewsArticle => ({
  id: 'test-id-123',
  title: 'Test Article Title',
  description: 'Test article description',
  content: 'Test article content that is long enough to be meaningful.',
  url: 'https://example.com/article',
  source: 'Test Source',
  published_at: new Date().toISOString(),
  category: ['technology'],
  keywords: ['test', 'article'],
  sentiment: 'neutral',
  relevance_score: 0.8,
  fetched_at: new Date().toISOString(),
  is_active: true,
  created_at: new Date().toISOString(),
  image_url: 'https://example.com/image.jpg',
  author: 'Test Author',
  ...overrides,
})

export const mockUser = (overrides?: any) => ({
  id: 'user-123',
  email: 'test@example.com',
  created_at: new Date().toISOString(),
  ...overrides,
})

export const mockGeneratedContent = (overrides?: any) => ({
  id: 'content-123',
  user_id: 'user-123',
  article_id: 'article-123',
  platform: 'linkedin',
  content: 'Generated content for LinkedIn',
  tone: 'professional',
  model_used: 'gpt-4',
  created_at: new Date().toISOString(),
  ...overrides,
})

// Supabase client mock
export const createMockSupabaseClient = () => {
  const mockData: any[] = []
  
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: mockData,
          error: null,
        }),
        gte: (column: string, value: any) => ({
          data: mockData,
          error: null,
        }),
        lte: (column: string, value: any) => ({
          data: mockData,
          error: null,
        }),
        order: (column: string, options?: any) => ({
          data: mockData,
          error: null,
        }),
        limit: (count: number) => ({
          data: mockData.slice(0, count),
          error: null,
        }),
        single: () => ({
          data: mockData[0] || null,
          error: mockData.length === 0 ? { message: 'Not found' } : null,
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          single: () => ({
            data: { ...data, id: 'new-id' },
            error: null,
          }),
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            single: () => ({
              data: { ...data, id: value },
              error: null,
            }),
          }),
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null,
        }),
      }),
    }),
    auth: {
      getUser: async () => ({
        data: { user: mockUser() },
        error: null,
      }),
      signUp: async (credentials: any) => ({
        data: { user: mockUser({ email: credentials.email }) },
        error: null,
      }),
      signInWithPassword: async (credentials: any) => ({
        data: { user: mockUser({ email: credentials.email }) },
        error: null,
      }),
      signOut: async () => ({
        error: null,
      }),
    },
  }
}
