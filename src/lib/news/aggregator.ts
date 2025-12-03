import type { NewsArticle } from '@/types/news'
import type { NewsAPIClient as INewsAPIClient, FetchOptions } from './base-client'
import { APIError, RateLimitError } from './base-client'
import { SerperClient } from './serper-client'
import { NewsAPIClient } from './newsapi-client'
import { MediastackClient } from './mediastack-client'
import { GNewsClient } from './gnews-client'
import { HackerNewsClient } from './hackernews-client'
import { 
  NEWS_CATEGORIES, 
  getCategoryKeywords, 
  getTrendingKeywords,
  calculateKeywordRelevance,
  INDUSTRY_KEYWORDS,
  MARKET_KEYWORDS,
  ALL_KEYWORDS
} from './categories'

export interface AggregatorConfig {
  maxArticles: number
  minRelevanceScore?: number
  retryAttempts?: number
  retryDelay?: number // milliseconds
}

export interface AggregatorResult {
  articles: NewsArticle[]
  source: string
  totalFetched: number
  filtered: number
  errors: string[]
}

export class NewsAggregator {
  private clients: INewsAPIClient[]
  private config: AggregatorConfig

  constructor(config?: Partial<AggregatorConfig>) {
    this.config = {
      maxArticles: config?.maxArticles || 20,
      minRelevanceScore: config?.minRelevanceScore || 0.3,
      retryAttempts: config?.retryAttempts || 2,
      retryDelay: config?.retryDelay || 1000,
    }

    // Initialize clients in fallback order: Serper -> NewsAPI -> Mediastack -> GNews -> HackerNews
    this.clients = [
      new SerperClient(),
      new NewsAPIClient(),
      new MediastackClient(),
      new GNewsClient(),
      new HackerNewsClient(),
    ]
  }

  /**
   * Fetch news articles with automatic fallback chain
   */
  async fetchNews(query: string, options?: FetchOptions): Promise<AggregatorResult> {
    const errors: string[] = []
    const fetchOptions: FetchOptions = {
      maxResults: this.config.maxArticles,
      ...options,
    }

    // Try each client in order until one succeeds
    for (const client of this.clients) {
      if (!client.isAvailable()) {
        errors.push(`${client.getName()}: Not configured (API key missing)`)
        continue
      }

      try {
        console.log(`Attempting to fetch from ${client.getName()}...`)
        
        const articles = await this.fetchWithRetry(client, query, fetchOptions)
        
        if (articles.length === 0) {
          errors.push(`${client.getName()}: No articles returned`)
          continue
        }

        // Filter and deduplicate articles
        const filtered = this.filterArticles(articles)
        const deduplicated = this.deduplicateArticles(filtered)

        console.log(`Successfully fetched ${deduplicated.length} articles from ${client.getName()}`)

        return {
          articles: deduplicated,
          source: client.getName(),
          totalFetched: articles.length,
          filtered: articles.length - deduplicated.length,
          errors,
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`${client.getName()}: ${errorMessage}`)
        
        if (error instanceof RateLimitError) {
          console.warn(`Rate limit hit for ${client.getName()}, trying next provider...`)
        } else {
          console.error(`Error fetching from ${client.getName()}:`, errorMessage)
        }
        
        // Continue to next client
        continue
      }
    }

    // All clients failed
    throw new APIError(
      `All news providers failed. Errors: ${errors.join('; ')}`,
      undefined,
      'NewsAggregator'
    )
  }

  /**
   * Fetch with exponential backoff retry logic
   */
  private async fetchWithRetry(
    client: INewsAPIClient,
    query: string,
    options: FetchOptions,
    attempt: number = 0
  ): Promise<NewsArticle[]> {
    try {
      return await client.fetchNews(query, options)
    } catch (error) {
      // Don't retry on rate limit errors - move to next provider
      if (error instanceof RateLimitError) {
        throw error
      }

      // Retry on other errors
      if (attempt < this.config.retryAttempts!) {
        const delay = this.config.retryDelay! * Math.pow(2, attempt)
        console.log(`Retrying ${client.getName()} in ${delay}ms (attempt ${attempt + 1}/${this.config.retryAttempts})...`)
        
        await this.sleep(delay)
        return this.fetchWithRetry(client, query, options, attempt + 1)
      }

      throw error
    }
  }

  /**
   * Filter articles by relevance score
   */
  private filterArticles(articles: NewsArticle[]): NewsArticle[] {
    return articles.filter(article => {
      // Keep articles without relevance score (will be scored later)
      if (article.relevance_score === null) {
        return true
      }
      
      return article.relevance_score >= this.config.minRelevanceScore!
    })
  }

  /**
   * Remove duplicate articles by URL
   */
  private deduplicateArticles(articles: NewsArticle[]): NewsArticle[] {
    const seen = new Set<string>()
    const unique: NewsArticle[] = []

    for (const article of articles) {
      const normalizedUrl = this.normalizeUrl(article.url)
      
      if (!seen.has(normalizedUrl)) {
        seen.add(normalizedUrl)
        unique.push(article)
      }
    }

    return unique
  }

  /**
   * Normalize URL for deduplication (remove query params, trailing slashes, etc.)
   */
  private normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url)
      // Remove query params and hash
      return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.toLowerCase().replace(/\/$/, '')
    } catch {
      // If URL parsing fails, return as-is
      return url.toLowerCase()
    }
  }

  /**
   * Calculate AI relevance score for an article
   * This is a simple keyword-based scoring. In production, this would use an AI model.
   */
  calculateRelevanceScore(article: NewsArticle): number {
    const aiKeywords = [
      'artificial intelligence', 'ai', 'machine learning', 'ml', 'deep learning',
      'neural network', 'gpt', 'llm', 'large language model', 'chatgpt', 'openai',
      'anthropic', 'claude', 'gemini', 'transformer', 'nlp', 'computer vision',
      'generative ai', 'diffusion', 'stable diffusion', 'midjourney', 'dall-e'
    ]

    const text = `${article.title} ${article.description || ''} ${article.content || ''}`.toLowerCase()
    
    let score = 0
    let matchCount = 0

    for (const keyword of aiKeywords) {
      if (text.includes(keyword)) {
        matchCount++
        // Weight title matches higher
        if (article.title.toLowerCase().includes(keyword)) {
          score += 0.3
        } else {
          score += 0.1
        }
      }
    }

    // Normalize score to 0-1 range
    return Math.min(score, 1)
  }

  /**
   * Score multiple articles for relevance
   */
  scoreArticles(articles: NewsArticle[]): NewsArticle[] {
    return articles.map(article => ({
      ...article,
      relevance_score: this.calculateRelevanceScore(article),
    }))
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
