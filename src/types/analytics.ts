// Analytics types for the dashboard

export interface AnalyticsOverview {
  totalContent: number
  totalBookmarks: number
  totalScheduled: number
  activeStreak: number
  topPlatform: string
  engagementRate: number
  growthRate: number
  lastActive: string
}

export interface ContentAnalytics {
  byPlatform: PlatformMetric[]
  byTone: ToneMetric[]
  byDate: DateMetric[]
  totalGenerated: number
  averagePerDay: number
}

export interface PlatformMetric {
  platform: string
  count: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
  engagementScore: number
  color: string
  [key: string]: string | number
}

export interface ToneMetric {
  tone: string
  count: number
  percentage: number
}

export interface DateMetric {
  date: string
  count: number
  platform?: string
}

export interface EngagementData {
  date: string
  content: number
  bookmarks: number
  scheduled: number
}

export interface TopContentItem {
  id: string
  platform: string
  content: string
  tone: string
  createdAt: string
  engagementScore: number
}

export interface ActivityHeatmapData {
  date: string
  day: number
  hour: number
  activity: number
}

export interface AnalyticsFilters {
  dateRange?: {
    start: string
    end: string
  }
  platforms?: string[]
  tones?: string[]
}

export interface ExportData {
  overview: AnalyticsOverview
  content: ContentAnalytics
  engagement: EngagementData[]
  topContent: TopContentItem[]
  exportedAt: string
}
