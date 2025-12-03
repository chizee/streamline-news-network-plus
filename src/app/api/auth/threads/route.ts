// Threads OAuth Initiation Route
// Threads uses Facebook's OAuth system

import { NextRequest, NextResponse } from 'next/server'
import { ThreadsClient } from '@/lib/social/threads-client'
import { generateState } from '@/lib/social/oauth-utils'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const threadsClient = new ThreadsClient()
    
    // Generate state parameter
    const state = generateState()
    
    // Store state in secure cookie
    const cookieStore = await cookies()
    cookieStore.set('threads_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })
    
    // Generate authorization URL
    const authUrl = threadsClient.getAuthorizationUrl(state)
    
    // Redirect to Threads OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Threads OAuth initiation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Threads OAuth',
      },
      { status: 500 }
    )
  }
}
