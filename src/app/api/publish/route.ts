// Main Publishing Endpoint - Publish to selected social media platforms

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/security/encryption'
import { TwitterClient } from '@/lib/social/twitter-client'
import { FacebookClient } from '@/lib/social/facebook-client'
import { InstagramClient } from '@/lib/social/instagram-client'
import { ThreadsClient } from '@/lib/social/threads-client'
// import { retryIfRetryable } from '@/lib/social/retry-logic'
// import { handlePlatformError } from '@/lib/social/error-handlers'
import type { SocialPlatform, PublishResult } from '@/lib/social/types'

interface PublishRequest {
  contentId: string
  content: string
  platforms: SocialPlatform[]
}

interface PlatformResult extends PublishResult {
  platform: SocialPlatform
}

export async function POST(request: NextRequest) {
  try {
    const body: PublishRequest = await request.json()
    const { contentId, content, platforms } = body

    // Validate request
    if (!contentId || !content || !platforms || platforms.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: contentId, content, or platforms',
        },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get social connections for requested platforms
    const { data: connections, error: connectionsError } = await supabase
      .from('social_connections')
      .select('*')
      .eq('user_id', user.id)
      .in('platform', platforms)

    if (connectionsError) {
      console.error('Error fetching connections:', connectionsError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch social connections' },
        { status: 500 }
      )
    }

    // Check if all requested platforms are connected
    const connectedPlatforms = connections?.map((c) => c.platform) || []
    const missingPlatforms = platforms.filter(
      (p) => !connectedPlatforms.includes(p)
    )

    if (missingPlatforms.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Not connected to: ${missingPlatforms.join(', ')}`,
          missingPlatforms,
        },
        { status: 400 }
      )
    }

    // Publish to each platform
    const results: PlatformResult[] = []
    const publishPromises = platforms.map(async (platform) => {
      const connection = connections?.find((c) => c.platform === platform)
      if (!connection) {
        return {
          success: false,
          platform,
          error: 'Connection not found',
        }
      }

      try {
        // Decrypt access token
        const accessToken = decryptToken(connection.access_token)

        // Get appropriate client
        let client
        switch (platform) {
          case 'twitter':
            client = new TwitterClient()
            break
          case 'facebook':
            client = new FacebookClient()
            break
          case 'instagram':
            client = new InstagramClient()
            break
          case 'threads':
            client = new ThreadsClient()
            break
          default:
            return {
              success: false,
              platform,
              error: 'Unsupported platform',
            }
        }

        // Validate content for platform
        if (!client.validateContent(content)) {
          return {
            success: false,
            platform,
            error: `Content exceeds ${client.getCharacterLimit()} character limit`,
          }
        }

        // Publish content
        const result = await client.publish(content, accessToken)
        return result
      } catch (error) {
        console.error(`Error publishing to ${platform}:`, error)
        return {
          success: false,
          platform,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }
    })

    // Wait for all publishing attempts
    const publishResults = await Promise.all(publishPromises)
    results.push(...publishResults)

    // Store publishing results in database
    const publishedPosts = results
      .filter((r) => r.success)
      .map((r) => ({
        content_id: contentId,
        user_id: user.id,
        platform: r.platform,
        post_id: r.postId || null,
        post_url: r.postUrl || null,
        published_at: new Date().toISOString(),
        status: 'published' as const,
      }))

    if (publishedPosts.length > 0) {
      const { error: insertError } = await supabase
        .from('published_posts')
        .insert(publishedPosts)

      if (insertError) {
        console.error('Error storing published posts:', insertError)
        // Don't fail the request if storage fails
      }
    }

    // Store failed attempts
    const failedPosts = results
      .filter((r) => !r.success)
      .map((r) => ({
        content_id: contentId,
        user_id: user.id,
        platform: r.platform,
        status: 'failed' as const,
        error_message: r.error || 'Unknown error',
        published_at: new Date().toISOString(),
      }))

    if (failedPosts.length > 0) {
      const { error: insertError } = await supabase
        .from('published_posts')
        .insert(failedPosts)

      if (insertError) {
        console.error('Error storing failed posts:', insertError)
      }
    }

    // Determine overall success
    const successCount = results.filter((r) => r.success).length
    const overallSuccess = successCount > 0

    return NextResponse.json({
      success: overallSuccess,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount,
      },
    })
  } catch (error) {
    console.error('Publishing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
