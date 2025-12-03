// Cron Endpoint for Scheduled Publishing
// This endpoint is called by Vercel Cron to publish scheduled posts

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { decryptToken } from '@/lib/security/encryption'
import { TwitterClient } from '@/lib/social/twitter-client'
import { FacebookClient } from '@/lib/social/facebook-client'
import { InstagramClient } from '@/lib/social/instagram-client'
import { ThreadsClient } from '@/lib/social/threads-client'
import type { SocialPlatform } from '@/lib/social/types'

interface ScheduledPost {
  id: string
  user_id: string
  content_id: string
  scheduled_for: string
}

interface ProcessingResult {
  postId: string
  success: boolean
  platform: SocialPlatform
  error?: string
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Create Supabase client with service role for cron access
    const supabase = await createClient()

    // Query scheduled posts that are due
    const now = new Date().toISOString()
    const { data: scheduledPosts, error: queryError } = await supabase
      .from('content_schedule')
      .select('*, generated_content(generated_text, platform)')
      .is('is_published', false)
      .is('failed', false)
      .lte('scheduled_for', now)
      .order('created_at', { ascending: true })

    if (queryError) {
      console.error('Error querying scheduled posts:', queryError)
      return NextResponse.json(
        { success: false, error: 'Failed to query scheduled posts' },
        { status: 500 }
      )
    }

    if (!scheduledPosts || scheduledPosts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scheduled posts to process',
        processed: 0,
      })
    }

    console.log(`Processing ${scheduledPosts.length} scheduled posts`)

    // Process each scheduled post
    const results: ProcessingResult[] = []

    for (const post of scheduledPosts) {
      try {
        // Extract content and platform from joined data
        const content = (post as any).generated_content
        if (!content || !content.generated_text || !content.platform) {
          console.error(`Content not found for post ${post.id}`)
          await updateScheduledPostStatus(
            supabase,
            post.id,
            true,
            'Content not found'
          )
          results.push({
            postId: post.id,
            success: false,
            platform: 'unknown' as SocialPlatform,
            error: 'Content not found',
          })
          continue
        }

        const platform = content.platform as SocialPlatform
        const contentText = content.generated_text

        // Get social connection for the platform
        const { data: connection, error: connectionError } = await supabase
          .from('social_connections')
          .select('*')
          .eq('user_id', post.user_id)
          .eq('platform', platform)
          .single()

        if (connectionError || !connection) {
          console.error(
            `Connection not found for post ${post.id}:`,
            connectionError
          )
          await updateScheduledPostStatus(
            supabase,
            post.id,
            true,
            `${platform} account not connected`
          )
          results.push({
            postId: post.id,
            success: false,
            platform,
            error: `${platform} account not connected`,
          })
          continue
        }

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
            await updateScheduledPostStatus(
              supabase,
              post.id,
              true,
              'Unsupported platform'
            )
            results.push({
              postId: post.id,
              success: false,
              platform,
              error: 'Unsupported platform',
            })
            continue
        }

        // Validate content
        if (!client.validateContent(contentText)) {
          const error = `Content exceeds ${client.getCharacterLimit()} character limit`
          await updateScheduledPostStatus(supabase, post.id, true, error)
          results.push({
            postId: post.id,
            success: false,
            platform,
            error,
          })
          continue
        }

        // Publish content
        const publishResult = await client.publish(contentText, accessToken)

        if (publishResult.success) {
          // Update scheduled post status to published
          await updateScheduledPostStatus(
            supabase,
            post.id,
            false,
            undefined,
            new Date().toISOString()
          )

          // Store in published_posts table
          await supabase.from('published_posts').insert({
            content_id: post.content_id,
            user_id: post.user_id,
            platform,
            platform_post_id: publishResult.postId || null,
            platform_post_url: publishResult.postUrl || null,
            published_at: new Date().toISOString(),
            status: 'published',
          })

          results.push({
            postId: post.id,
            success: true,
            platform,
          })

          console.log(
            `Successfully published scheduled post ${post.id} to ${platform}`
          )
        } else {
          // Update scheduled post status to failed
          await updateScheduledPostStatus(
            supabase,
            post.id,
            true,
            publishResult.error || 'Publishing failed'
          )

          // Store failed attempt
          await supabase.from('published_posts').insert({
            content_id: post.content_id,
            user_id: post.user_id,
            platform,
            status: 'failed',
            error_message: publishResult.error || 'Unknown error',
            published_at: new Date().toISOString(),
          })

          results.push({
            postId: post.id,
            success: false,
            platform,
            error: publishResult.error,
          })

          console.error(
            `Failed to publish scheduled post ${post.id}:`,
            publishResult.error
          )
        }
      } catch (error) {
        console.error(`Error processing scheduled post ${post.id}:`, error)
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error'
        await updateScheduledPostStatus(supabase, post.id, true, errorMessage)
        results.push({
          postId: post.id,
          success: false,
          platform: 'unknown' as SocialPlatform,
          error: errorMessage,
        })
      }
    }

    // Calculate summary
    const successCount = results.filter((r) => r.success).length
    const failedCount = results.length - successCount

    console.log(
      `Scheduled publishing complete: ${successCount} successful, ${failedCount} failed`
    )

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: successCount,
      failed: failedCount,
      results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

// Helper function to update scheduled post status
async function updateScheduledPostStatus(
  supabase: any,
  postId: string,
  failed: boolean,
  errorMessage?: string,
  publishedAt?: string
) {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  }

  if (failed) {
    updateData.failed = true
    if (errorMessage) {
      updateData.error_message = errorMessage
    }
  } else {
    updateData.is_published = true
    updateData.failed = false
  }

  if (publishedAt) {
    updateData.published_at = publishedAt
  }

  const { error } = await supabase
    .from('content_schedule')
    .update(updateData)
    .eq('id', postId)

  if (error) {
    console.error(`Error updating scheduled post ${postId}:`, error)
  }
}
