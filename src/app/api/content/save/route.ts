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
    const { article_id, platform, content_type, generated_text, tone, ai_model, generation_time_ms } = body

    if (!platform || !generated_text || !tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('generated_content')
      .insert({
        user_id: user.id,
        article_id: article_id || null,
        platform,
        content_type: content_type || 'post',
        generated_text,
        tone,
        ai_model: ai_model || 'unknown',
        generation_time_ms: generation_time_ms || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
    }

    return NextResponse.json({ success: true, content: data })
  } catch (error) {
    console.error('Save content error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save content' },
      { status: 500 }
    )
  }
}
