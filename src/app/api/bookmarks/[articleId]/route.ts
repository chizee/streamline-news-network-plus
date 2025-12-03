import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('saved_news')
      .delete()
      .eq('user_id', user.id)
      .eq('article_id', articleId)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unbookmark error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to remove bookmark' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notes } = body

    const { data, error } = await supabase
      .from('saved_news')
      .update({ notes })
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
    }

    return NextResponse.json({ success: true, bookmark: data })
  } catch (error) {
    console.error('Update bookmark error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update bookmark' },
      { status: 500 }
    )
  }
}
