import type { NewsArticle, HackerNewsItem } from '@/types/news'
import type { NewsAPIClient, FetchOptions } from './base-client'
import { APIError } from './base-client'

export class HackerNewsClient implements NewsAPIClient {
  private readonly baseUrl = 'https://hacker-news.firebaseio.com/v0'
  private readonly aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'ml', 'gpt', 'llm', 'neural', 'deep learning']

  getName(): string {
    return 'HackerNews'
  }

  isAvailable(): boolean {
    return true // No API key required
  }

  async fetchNews(query: string, options?: FetchOptions): Promise<NewsArticle[]> {
    try {
      // Fetch top stories
      const topStoriesResponse = await fetch(`${this.baseUrl}/topstories.json`)
      
      if (!topStoriesResponse.ok) {
        throw new APIError(
          `HackerNews API error: ${topStoriesResponse.statusText}`,
          topStoriesResponse.status,
          'HackerNews'
        )
      }

      const storyIds: number[] = await topStoriesResponse.json()
      
      // Fetch first 100 stories (to filter for AI-related content)
      const maxStories = Math.min(options?.maxResults || 20, 100)
      const storyPromises = storyIds.slice(0, maxStories).map(id =>
        this.fetchStory(id)
      )

      const stories = await Promise.all(storyPromises)
      
      // Filter for AI-related stories and valid URLs
      const aiStories = stories.filter(story => 
        story && 
        story.url && 
        this.isAIRelated(story.title)
      )

      // Convert to NewsArticle format
      return aiStories.map(story => this.convertToNewsArticle(story!))
    } catch (error) {
      if (error instanceof APIError) {
        throw error
      }
      throw new APIError(
        `Failed to fetch HackerNews stories: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'HackerNews'
      )
    }
  }

  private async fetchStory(id: number): Promise<HackerNewsItem | null> {
    try {
      const response = await fetch(`${this.baseUrl}/item/${id}.json`)
      if (!response.ok) return null
      return await response.json()
    } catch {
      return null
    }
  }

  private isAIRelated(title: string): boolean {
    const lowerTitle = title.toLowerCase()
    return this.aiKeywords.some(keyword => lowerTitle.includes(keyword))
  }

  private convertToNewsArticle(item: HackerNewsItem): NewsArticle {
    const now = new Date().toISOString()
    
    return {
      id: `hn-${item.id}`,
      title: item.title,
      description: null,
      content: null,
      url: item.url || `https://news.ycombinator.com/item?id=${item.id}`,
      source: 'Hacker News',
      author: item.by || null,
      published_at: new Date(item.time * 1000).toISOString(),
      image_url: null,
      category: ['technology', 'ai'],
      keywords: null,
      sentiment: null,
      relevance_score: item.score ? Math.min(item.score / 100, 1) : null,
      fetched_at: now,
      is_active: true,
      created_at: now,
    }
  }
}
