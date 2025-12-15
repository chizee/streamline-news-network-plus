import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ContentGenerator } from '@/lib/ai/content-generator'
import { secureApiHandler, validateInput, SecurityErrorType } from '@/lib/security'
import { z } from 'zod'
import type { GenerationRequest } from '@/types/ai'

// Enhanced validation schema for content generation
const contentGenerationSchema = z.object({
  articleTitle: z.string().min(1).max(200),
  articleDescription: z.string().max(1000).optional(),
  articleContent: z.string().max(10000).optional(),
  platform: z.enum(['linkedin', 'twitter', 'instagram', 'facebook', 'threads']),
  tone: z.enum(['professional', 'friendly', 'witty', 'formal']),
  contentType: z.enum(['post', 'thread', 'story', 'carousel']).optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  keywords: z.array(z.string()).max(10).optional(),
  targetAudience: z.string().max(100).optional()
})

async function handleContentGeneration(request: NextRequest): Promise<NextResponse> {
  // Verify authentication
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw {
      type: SecurityErrorType.UNAUTHORIZED,
      message: 'Authentication required',
      statusCode: 401
    }
  }

  // Parse and validate request body
  const body = await request.json()
  const validatedData = validateInput(contentGenerationSchema, body)

  // Generate content
  const generator = new ContentGenerator()
  const result = await generator.generate(validatedData as GenerationRequest)

  // Return generated content with security headers
  return NextResponse.json({
    content: result.content,
    provider: result.provider,
    model: result.model,
    generationTimeMs: result.generationTimeMs,
    timestamp: new Date().toISOString()
  })
}

// Export the secured handler
export const POST = secureApiHandler(handleContentGeneration)
