// News Article Types

export interface NewsArticle {
  id: string
  title: string
  description: string | null
  content: string | null
  url: string
  source: string
  author: string | null
  published_at: string
  image_url: string | null
  category: string[]
  keywords: string[] | null
  sentiment: 'positive' | 'neutral' | 'negative' | null
  relevance_score: number | null
  fetched_at: string
  is_active: boolean
  created_at: string
}

export interface NewsAPIResponse {
  articles: NewsArticle[]
  totalResults: number
  source: string
}

export interface NewsAggregatorConfig {
  maxArticles: number
  timeWindow: number // hours
  minRelevanceScore: number
  categories: string[]
}

// Raw API response types for each provider
export interface SerperNewsResult {
  title: string
  link: string
  snippet?: string
  date?: string
  source?: string
  imageUrl?: string
}

export interface NewsAPIArticle {
  title: string
  description?: string
  url: string
  urlToImage?: string
  publishedAt: string
  source: {
    name: string
  }
  author?: string
  content?: string
}

export interface MediastackArticle {
  title: string
  description?: string
  url: string
  image?: string
  published_at: string
  source: string
  author?: string
}

export interface GNewsArticle {
  title: string
  description?: string
  url: string
  image?: string
  publishedAt: string
  source: {
    name: string
  }
  content?: string
}

export interface HackerNewsItem {
  id: number
  title: string
  url?: string
  by?: string
  time: number
  score?: number
  descendants?: number
}
