import type { NewsArticle, NewsAPIArticle } from '@/types/news'
import type { NewsAPIClient as INewsAPIClient, FetchOptions } from './base-client'
import { APIError, RateLimitError } from './base-client'

export class NewsAPIClient implements INewsAPIClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://newsapi.org/v2'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEWS_API_KEY || ''
  }

  getName(): string {
    return 'NewsAPI.org'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async fetchNews(query: string, options?: FetchOptions): Promise<NewsArticle[]> {
    if (!this.isAvailable()) {
      throw new APIError('NewsAPI key not configured', undefined, 'NewsAPI.org')
    }

    try {
      const params = new URLSearchParams({
        q: query,
        apiKey: this.apiKey,
        pageSize: String(options?.maxResults || 20),
        language: options?.language || 'en',
        sortBy: options?.sortBy || 'publishedAt',
      })

      if (options?.fromDate) {
        params.append('from', options.fromDate.toISOString())
      }

      if (options?.toDate) {
        params.append('to', options.toDate.toISOString())
      }

      const response = await fetch(`${this.baseUrl}/everything?${params.toString()}`)

      if (response.status === 429) {
        throw new RateLimitError(
          'NewsAPI rate limit exceeded',
          undefined,
          'NewsAPI.org'
        )
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(
          `NewsAPI error: ${errorData.message || response.statusText}`,
          response.status,
          'NewsAPI.org'
        )
      }

      const data = await response.json()
      
      if (!data.articles || !Array.isArray(data.articles)) {
        return []
      }

      return data.articles.map((item: NewsAPIArticle) => this.convertToNewsArticle(item))
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        `Failed to fetch from NewsAPI: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'NewsAPI.org'
      )
    }
  }

  private convertToNewsArticle(item: NewsAPIArticle): NewsArticle {
    const now = new Date().toISOString()
    
    return {
      id: `newsapi-${Buffer.from(item.url).toString('base64').slice(0, 20)}`,
      title: item.title,
      description: item.description || null,
      content: item.content || null,
      url: item.url,
      source: item.source.name,
      author: item.author || null,
      published_at: item.publishedAt,
      image_url: item.urlToImage || null,
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
