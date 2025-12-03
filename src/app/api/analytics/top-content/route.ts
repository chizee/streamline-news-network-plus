import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getTopContent } from '@/lib/analytics/data-aggregation'

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

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')

    // Get top content
    const topContent = await getTopContent(user.id, limit)
    
    return NextResponse.json(topContent)
  } catch (error) {
    console.error('Top content analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top content analytics' },
      { status: 500 }
    )
  }
}
