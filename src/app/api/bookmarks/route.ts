import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { article_id, notes } = body

    if (!article_id) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('saved_news')
      .insert({
        user_id: user.id,
        article_id,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Article already bookmarked' }, { status: 409 })
      }
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to bookmark article' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bookmark: data })
  } catch (error) {
    console.error('Bookmark error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to bookmark article' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('saved_news')
      .select(`
        *,
        article:news_articles(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 })
    }

    return NextResponse.json({ bookmarks: data })
  } catch (error) {
    console.error('Fetch bookmarks error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch bookmarks' },
      { status: 500 }
    )
  }
}
