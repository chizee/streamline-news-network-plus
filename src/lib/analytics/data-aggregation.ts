import { createClient } from '@/lib/supabase/server'
import type {
  AnalyticsOverview,
  ContentAnalytics,
  PlatformMetric,
  ToneMetric,
  DateMetric,
  EngagementData,
  TopContentItem,
  AnalyticsFilters
} from '@/types/analytics'
import { subDays, format, parseISO, differenceInDays } from 'date-fns'

// Platform colors for consistent theming
const PLATFORM_COLORS = {
  twitter: '#1DA1F2',
  linkedin: '#0077B5',
  instagram: '#E4405F',
  facebook: '#1877F2',
  threads: '#000000'
}

export async function getAnalyticsOverview(
  userId: string,
  filters?: AnalyticsFilters
): Promise<AnalyticsOverview> {
  const supabase = await createClient()
  
  const dateFilter = filters?.dateRange
    ? `AND created_at >= '${filters.dateRange.start}' AND created_at <= '${filters.dateRange.end}'`
    : ''

  // Get total content generated
  const { count: totalContent } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get total bookmarks
  const { count: totalBookmarks } = await supabase
    .from('saved_news')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get total scheduled posts
  const { count: totalScheduled } = await (supabase as any)
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Calculate active streak (days with activity)
  const { data: recentActivity } = await supabase
    .from('generated_content')
    .select('created_at')
    .eq('user_id', userId)
    .gte('created_at', format(subDays(new Date(), 30), 'yyyy-MM-dd'))
    .order('created_at', { ascending: false })

  const activeStreak = calculateActiveStreak(recentActivity || [])

  // Get platform breakdown to find top platform
  const { data: platformData } = await supabase
    .from('generated_content')
    .select('platform')
    .eq('user_id', userId)

  const topPlatform = getTopPlatform(platformData || [])

  // Calculate engagement rate (simulated based on content variety)
  const engagementRate = calculateEngagementRate(platformData || [])

  // Calculate growth rate (content generated this week vs last week)
  const growthRate = await calculateGrowthRate(supabase, userId)

  // Get last active date
  const { data: lastActivity } = await supabase
    .from('generated_content')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    totalContent: totalContent || 0,
    totalBookmarks: totalBookmarks || 0,
    totalScheduled: totalScheduled || 0,
    activeStreak,
    topPlatform,
    engagementRate,
    growthRate,
    lastActive: lastActivity?.created_at || new Date().toISOString()
  }
}

export async function getContentAnalytics(
  userId: string,
  filters?: AnalyticsFilters
): Promise<ContentAnalytics> {
  const supabase = await createClient()
  
  const { data: contentData } = await supabase
    .from('generated_content')
    .select('platform, tone, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (!contentData) {
    return {
      byPlatform: [],
      byTone: [],
      byDate: [],
      totalGenerated: 0,
      averagePerDay: 0
    }
  }

  // Platform breakdown
  const platformCounts = contentData.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const totalContent = contentData.length
  const byPlatform: PlatformMetric[] = Object.entries(platformCounts).map(([platform, count]) => ({
    platform,
    count,
    percentage: Math.round((count / totalContent) * 100),
    trend: 'stable' as const, // TODO: Calculate actual trend
    engagementScore: Math.random() * 100, // Simulated for now
    color: PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || '#6366f1'
  }))

  // Tone breakdown
  const toneCounts = contentData.reduce((acc, item) => {
    acc[item.tone] = (acc[item.tone] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byTone: ToneMetric[] = Object.entries(toneCounts).map(([tone, count]) => ({
    tone,
    count,
    percentage: Math.round((count / totalContent) * 100)
  }))

  // Date breakdown (last 30 days)
  const byDate: DateMetric[] = []
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), i)
    const dateStr = format(date, 'yyyy-MM-dd')
    const count = contentData.filter(item => 
      format(parseISO(item.created_at), 'yyyy-MM-dd') === dateStr
    ).length
    
    return {
      date: dateStr,
      count
    }
  }).reverse()

  byDate.push(...last30Days)

  // Calculate average per day
  const daysWithData = byDate.filter(d => d.count > 0).length
  const averagePerDay = daysWithData > 0 ? Math.round(totalContent / daysWithData * 10) / 10 : 0

  return {
    byPlatform,
    byTone,
    byDate,
    totalGenerated: totalContent,
    averagePerDay
  }
}

export async function getEngagementData(
  userId: string,
  filters?: AnalyticsFilters
): Promise<EngagementData[]> {
  const supabase = await createClient()
  
  // Calculate date range for last 30 days
  const startDate = format(subDays(new Date(), 29), 'yyyy-MM-dd')
  const endDate = format(new Date(), 'yyyy-MM-dd')

  // Fetch all data for the last 30 days in 3 parallel queries instead of 90 sequential ones
  const [contentData, bookmarksData, scheduledData] = await Promise.all([
    supabase
      .from('generated_content')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`),
    
    supabase
      .from('saved_news')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`),
    
    // Use type assertion for scheduled_posts table
    (supabase as any)
      .from('scheduled_posts')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', `${startDate}T00:00:00.000Z`)
      .lte('created_at', `${endDate}T23:59:59.999Z`)
  ])

  // Group data by date
  const contentByDate = groupByDate(contentData.data || [])
  const bookmarksByDate = groupByDate(bookmarksData.data || [])
  const scheduledByDate = groupByDate(scheduledData.data || [])

  // Generate array for last 30 days with counts
  const engagementData: EngagementData[] = Array.from({ length: 30 }, (_, i) => {
    const date = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
    
    return {
      date,
      content: contentByDate[date] || 0,
      bookmarks: bookmarksByDate[date] || 0,
      scheduled: scheduledByDate[date] || 0
    }
  })

  return engagementData
}

// Helper function to group data by date
function groupByDate(data: { created_at: string }[]): Record<string, number> {
  return data.reduce((acc, item) => {
    const date = format(parseISO(item.created_at), 'yyyy-MM-dd')
    acc[date] = (acc[date] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

export async function getTopContent(
  userId: string,
  limit: number = 10
): Promise<TopContentItem[]> {
  const supabase = await createClient()
  
  const { data: contentData } = await supabase
    .from('generated_content')
    .select('id, platform, generated_text, tone, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit * 2) // Get more to simulate scoring

  if (!contentData) return []

  // Simulate engagement scores and return top content
  const scoredContent = contentData.map(item => ({
    id: item.id,
    platform: item.platform,
    content: item.generated_text.substring(0, 100) + '...',
    tone: item.tone,
    createdAt: item.created_at,
    engagementScore: Math.random() * 100 // Simulated for now
  }))

  return scoredContent
    .sort((a, b) => b.engagementScore - a.engagementScore)
    .slice(0, limit)
}

// Helper functions
function calculateActiveStreak(activities: { created_at: string }[]): number {
  if (activities.length === 0) return 0
  
  const dates = activities.map(a => format(parseISO(a.created_at), 'yyyy-MM-dd'))
  const uniqueDates = [...new Set(dates)].sort().reverse()
  
  let streak = 0
  const today = format(new Date(), 'yyyy-MM-dd')
  
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedDate = format(subDays(new Date(), i), 'yyyy-MM-dd')
    if (uniqueDates[i] === expectedDate) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function getTopPlatform(platformData: { platform: string }[]): string {
  if (platformData.length === 0) return 'None'
  
  const counts = platformData.reduce((acc, item) => {
    acc[item.platform] = (acc[item.platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  return Object.entries(counts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
}

function calculateEngagementRate(platformData: { platform: string }[]): number {
  // Simulate engagement rate based on platform diversity
  const uniquePlatforms = new Set(platformData.map(p => p.platform)).size
  const totalContent = platformData.length
  
  if (totalContent === 0) return 0
  
  // Higher diversity = higher engagement rate (simulated)
  const diversityBonus = uniquePlatforms * 10
  const baseRate = Math.min(50 + diversityBonus, 95)
  
  return Math.round(baseRate + Math.random() * 10)
}

async function calculateGrowthRate(supabase: any, userId: string): Promise<number> {
  const thisWeekStart = format(subDays(new Date(), 7), 'yyyy-MM-dd')
  const lastWeekStart = format(subDays(new Date(), 14), 'yyyy-MM-dd')
  
  const { count: thisWeekCount } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', thisWeekStart)
  
  const { count: lastWeekCount } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', lastWeekStart)
    .lt('created_at', thisWeekStart)
  
  if (!lastWeekCount || lastWeekCount === 0) {
    return thisWeekCount ? 100 : 0
  }
  
  const growth = ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
  return Math.round(growth)
}
