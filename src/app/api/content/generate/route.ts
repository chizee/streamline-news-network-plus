import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentGenerator } from '@/lib/ai/content-generator'
import type { GenerationRequest } from '@/types/ai'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = (await request.json()) as GenerationRequest

    // Validate request
    if (!body.articleTitle || !body.platform || !body.tone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Generate content
    const generator = new ContentGenerator()
    const result = await generator.generate(body)

    // Return generated content
    return NextResponse.json({
      content: result.content,
      provider: result.provider,
      model: result.model,
      generationTimeMs: result.generationTimeMs,
    })
  } catch (error) {
    console.error('Content generation error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate content' },
      { status: 500 }
    )
  }
}
