import type { NewsArticle, GNewsArticle } from '@/types/news'
import type { NewsAPIClient, FetchOptions } from './base-client'
import { APIError, RateLimitError } from './base-client'

export class GNewsClient implements NewsAPIClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://gnews.io/api/v4'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GNEWS_API_KEY || ''
  }

  getName(): string {
    return 'GNews'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async fetchNews(query: string, options?: FetchOptions): Promise<NewsArticle[]> {
    if (!this.isAvailable()) {
      throw new APIError('GNews API key not configured', undefined, 'GNews')
    }

    try {
      const params = new URLSearchParams({
        q: query,
        token: this.apiKey,
        max: String(options?.maxResults || 20),
        lang: options?.language || 'en',
      })

      if (options?.fromDate) {
        params.append('from', options.fromDate.toISOString())
      }

      if (options?.toDate) {
        params.append('to', options.toDate.toISOString())
      }

      const response = await fetch(`${this.baseUrl}/search?${params.toString()}`)

      if (response.status === 429) {
        throw new RateLimitError(
          'GNews API rate limit exceeded',
          undefined,
          'GNews'
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          `GNews error: ${errorData.errors?.[0] || response.statusText}`,
          response.status,
          'GNews'
        )
      }

      const data = await response.json()
      
      if (data.errors && data.errors.length > 0) {
        throw new APIError(
          `GNews error: ${data.errors[0]}`,
          undefined,
          'GNews'
        )
      }

      if (!data.articles || !Array.isArray(data.articles)) {
        return []
      }

      return data.articles.map((item: GNewsArticle) => this.convertToNewsArticle(item))
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        `Failed to fetch from GNews: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'GNews'
      )
    }
  }

  private convertToNewsArticle(item: GNewsArticle): NewsArticle {
    const now = new Date().toISOString()
    
    return {
      id: `gnews-${Buffer.from(item.url).toString('base64').slice(0, 20)}`,
      title: item.title,
      description: item.description || null,
      content: item.content || null,
      url: item.url,
      source: item.source.name,
      author: null,
      published_at: item.publishedAt,
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
