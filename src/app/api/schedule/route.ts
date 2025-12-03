import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/schedule - List all scheduled posts for the user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    // Build query
    let query = supabase
      .from('scheduled_posts')
      .select(`
        *,
        content:generated_content(id, generated_text, platform, tone)
      `)
      .eq('user_id', session.user.id)
      .order('scheduled_for', { ascending: true })

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching scheduled posts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ scheduledPosts: data })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/schedule - Create a new scheduled post
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { content_id, platform, scheduled_for } = body

    // Validate required fields
    if (!content_id || !platform || !scheduled_for) {
      return NextResponse.json(
        { error: 'Missing required fields: content_id, platform, scheduled_for' },
        { status: 400 }
      )
    }

    // Validate scheduled_for is in the future
    const scheduledDate = new Date(scheduled_for)
    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: 'Scheduled time must be in the future' },
        { status: 400 }
      )
    }

    // Verify content belongs to user
    const { data: content, error: contentError } = await supabase
      .from('generated_content')
      .select('id')
      .eq('id', content_id)
      .eq('user_id', session.user.id)
      .single()

    if (contentError || !content) {
      return NextResponse.json(
        { error: 'Content not found or unauthorized' },
        { status: 404 }
      )
    }

    // Create scheduled post
    const { data: scheduledPost, error: insertError } = await supabase
      .from('scheduled_posts')
      .insert({
        user_id: session.user.id,
        content_id,
        platform,
        scheduled_for,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating scheduled post:', insertError)
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({ scheduledPost }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
