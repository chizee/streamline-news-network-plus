import type { NewsArticle, MediastackArticle } from '@/types/news'
import type { NewsAPIClient, FetchOptions } from './base-client'
import { APIError, RateLimitError } from './base-client'

export class MediastackClient implements NewsAPIClient {
  private readonly apiKey: string
  private readonly baseUrl = 'http://api.mediastack.com/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.MEDIASTACK_API_KEY || ''
  }

  getName(): string {
    return 'Mediastack'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async fetchNews(query: string, options?: FetchOptions): Promise<NewsArticle[]> {
    if (!this.isAvailable()) {
      throw new APIError('Mediastack API key not configured', undefined, 'Mediastack')
    }

    try {
      const params = new URLSearchParams({
        access_key: this.apiKey,
        keywords: query,
        limit: String(options?.maxResults || 20),
        languages: options?.language || 'en',
        sort: options?.sortBy === 'publishedAt' ? 'published_desc' : 'popularity',
      })

      if (options?.fromDate) {
        params.append('date', options.fromDate.toISOString().split('T')[0])
      }

      const response = await fetch(`${this.baseUrl}/news?${params.toString()}`)

      if (response.status === 429) {
        throw new RateLimitError(
          'Mediastack API rate limit exceeded',
          undefined,
          'Mediastack'
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          `Mediastack error: ${errorData.error?.message || response.statusText}`,
          response.status,
          'Mediastack'
        )
      }

      const data = await response.json()
      
      if (data.error) {
        throw new APIError(
          `Mediastack error: ${data.error.message}`,
          data.error.code,
          'Mediastack'
        )
      }

      if (!data.data || !Array.isArray(data.data)) {
        return []
      }

      return data.data.map((item: MediastackArticle) => this.convertToNewsArticle(item))
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        `Failed to fetch from Mediastack: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'Mediastack'
      )
    }
  }

  private convertToNewsArticle(item: MediastackArticle): NewsArticle {
    const now = new Date().toISOString()
    
    return {
      id: `mediastack-${Buffer.from(item.url).toString('base64').slice(0, 20)}`,
      title: item.title,
      description: item.description || null,
      content: null,
      url: item.url,
      source: item.source,
      author: item.author || null,
      published_at: item.published_at,
      image_url: item.image || null,
      category: ['ai', 'technology'],
      keywords: null,
      sentiment: null,
      relevance_score: null,
      fetched_at: now,
      is_active: true,
      created_at: now,
    }
  }
}
