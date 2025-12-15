import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getEngagementData } from '@/lib/analytics/data-aggregation'

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

    // Get engagement data
    const engagement = await getEngagementData(user.id)
    
    return NextResponse.json(engagement)
  } catch (error) {
    console.error('Engagement analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement analytics' },
      { status: 500 }
    )
  }
}
