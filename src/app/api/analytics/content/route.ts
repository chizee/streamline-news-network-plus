import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getContentAnalytics } from '@/lib/analytics/data-aggregation'

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
    const platforms = searchParams.get('platforms')?.split(',')
    const tones = searchParams.get('tones')?.split(',')
    
    const filters = {
      ...(startDate && endDate && {
        dateRange: {
          start: startDate,
          end: endDate
        }
      }),
      ...(platforms && { platforms }),
      ...(tones && { tones })
    }

    // Get content analytics
    const analytics = await getContentAnalytics(user.id, Object.keys(filters).length > 0 ? filters : undefined)
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Content analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch content analytics' },
      { status: 500 }
    )
  }
}
