import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  getAnalyticsOverview, 
  getContentAnalytics, 
  getEngagementData, 
  getTopContent 
} from '@/lib/analytics/data-aggregation'
import type { ExportData } from '@/types/analytics'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    const filters = startDate && endDate ? {
      dateRange: {
        start: startDate,
        end: endDate
      }
    } : undefined

    // Fetch all analytics data
    const [overview, content, engagement, topContent] = await Promise.all([
      getAnalyticsOverview(user.id),
      getContentAnalytics(user.id),
      getEngagementData(user.id),
      getTopContent(user.id, 20)
    ])

    // Create export data
    const exportData: ExportData = {
      overview,
      content,
      engagement,
      topContent,
      exportedAt: new Date().toISOString()
    }

    // Return as JSON file
    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="analytics-export-${new Date().toISOString().split('T')[0]}.json"`
      }
    })
  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json(
      { error: 'Failed to export analytics data' },
      { status: 500 }
    )
  }
}
