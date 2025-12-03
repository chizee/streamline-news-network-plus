import type { NewsArticle } from '@/types/news'

export interface NewsAPIClient {
  fetchNews(query: string, options?: FetchOptions): Promise<NewsArticle[]>
  isAvailable(): boolean
  getName(): string
}

export interface FetchOptions {
  maxResults?: number
  fromDate?: Date
  toDate?: Date
  language?: string
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt'
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public provider?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class RateLimitError extends APIError {
  constructor(
    message: string,
    public retryAfter?: number,
    provider?: string
  ) {
    super(message, 429, provider)
    this.name = 'RateLimitError'
  }
}
