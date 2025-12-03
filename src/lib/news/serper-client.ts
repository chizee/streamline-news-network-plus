import type { NewsArticle, SerperNewsResult } from '@/types/news'
import type { NewsAPIClient, FetchOptions } from './base-client'
import { APIError, RateLimitError } from './base-client'
import { getRotatedQuery, getSearchQueries } from './search-queries'
import { NEWS_CATEGORIES, ALL_KEYWORDS } from './categories'

export class SerperClient implements NewsAPIClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://google.serper.dev/news'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SERPER_API_KEY || ''
  }

  getName(): string {
    return 'Serper'
  }

  isAvailable(): boolean {
    return !!this.apiKey
  }

  async fetchNews(query: string, options?: FetchOptions): Promise<NewsArticle[]> {
    if (!this.isAvailable()) {
      throw new APIError('Serper API key not configured', undefined, 'Serper')
    }

    try {
      // Use comprehensive search query if no specific query provided
      let searchQuery = query
      if (!query || query.trim() === '') {
        const rotatedQuery = getRotatedQuery()
        searchQuery = rotatedQuery.query
        console.log(`Serper: Using rotated query "${rotatedQuery.name}"`)
      }

      // For larger result sets, combine multiple query types
      if ((options?.maxResults || 20) > 30) {
        const topQueries = getSearchQueries(3)
        searchQuery = topQueries.map(q => `(${q.query})`).join(' OR ')
        console.log(`Serper: Using combined queries for comprehensive coverage`)
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'X-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: searchQuery,
          num: options?.maxResults || 20,
          ...(options?.fromDate && {
            tbs: `qdr:d${Math.ceil((Date.now() - options.fromDate.getTime()) / (1000 * 60 * 60 * 24))}`,
          }),
        }),
      })

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After')
        throw new RateLimitError(
          'Serper API rate limit exceeded',
          retryAfter ? parseInt(retryAfter) : undefined,
          'Serper'
        )
      }

      if (!response.ok) {
        throw new APIError(
          `Serper API error: ${response.statusText}`,
          response.status,
          'Serper'
        )
      }

      const data = await response.json()
      
      if (!data.news || !Array.isArray(data.news)) {
        return []
      }

      return data.news.map((item: SerperNewsResult) => this.convertToNewsArticle(item))
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        `Failed to fetch from Serper: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'Serper'
      )
    }
  }

  private convertToNewsArticle(item: SerperNewsResult): NewsArticle {
    const now = new Date().toISOString()
    
    // Convert relative date strings like "14 hours ago" to ISO timestamp
    const publishedAt = this.parseRelativeDate(item.date) || now
    
    // Auto-categorize based on content
    const categories = this.categorizeArticle(item.title, item.snippet)
    
    // Extract keywords from title and snippet
    const keywords = this.extractKeywords(item.title, item.snippet)
    
    return {
      id: `serper-${Buffer.from(item.link).toString('base64').slice(0, 20)}`,
      title: item.title,
      description: item.snippet || null,
      content: null,
      url: item.link,
      source: item.source || 'Unknown',
      author: null,
      published_at: publishedAt,
      image_url: item.imageUrl || null,
      category: categories,
      keywords: keywords,
      sentiment: null,
      relevance_score: null,
      fetched_at: now,
      is_active: true,
      created_at: now,
    }
  }

  private categorizeArticle(title: string, snippet: string = ''): string[] {
    const text = `${title} ${snippet}`.toLowerCase()
    const categories: string[] = []

    // Check against all category keywords
    for (const category of NEWS_CATEGORIES) {
      const matchCount = category.keywords.filter(keyword => 
        text.includes(keyword.toLowerCase())
      ).length

      // If at least 2 keywords match, include this category
      if (matchCount >= 2) {
        categories.push(category.id)
      }
    }

    // Default to technology if no specific category found
    if (categories.length === 0) {
      categories.push('technology')
    }

    // Limit to top 3 most relevant categories
    return categories.slice(0, 3)
  }

  private extractKeywords(title: string, snippet: string = ''): string[] {
    const text = `${title} ${snippet}`.toLowerCase()
    const keywords: string[] = []

    // Extract matching keywords from our comprehensive list
    for (const keyword of ALL_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        keywords.push(keyword)
      }
    }

    // Limit to top 10 most relevant keywords
    return keywords.slice(0, 10)
  }

  private parseRelativeDate(dateStr: string | undefined): string | null {
    if (!dateStr) return null

    const now = new Date()
    
    // Match patterns like "X hours ago", "X days ago", "X minutes ago"
    const hoursMatch = dateStr.match(/(\d+)\s+hours?\s+ago/i)
    if (hoursMatch) {
      const hours = parseInt(hoursMatch[1])
      now.setHours(now.getHours() - hours)
      return now.toISOString()
    }

    const daysMatch = dateStr.match(/(\d+)\s+days?\s+ago/i)
    if (daysMatch) {
      const days = parseInt(daysMatch[1])
      now.setDate(now.getDate() - days)
      return now.toISOString()
    }

    const minutesMatch = dateStr.match(/(\d+)\s+minutes?\s+ago/i)
    if (minutesMatch) {
      const minutes = parseInt(minutesMatch[1])
      now.setMinutes(now.getMinutes() - minutes)
      return now.toISOString()
    }

    // Try to parse as ISO date
    try {
      const parsed = new Date(dateStr)
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString()
      }
    } catch {
      // Fall through
    }

    return null
  }
}
