// Instagram OAuth Initiation Route
// Instagram uses Facebook's OAuth system

import { NextResponse } from 'next/server'
import { InstagramClient } from '@/lib/social/instagram-client'
import { generateState } from '@/lib/social/oauth-utils'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const instagramClient = new InstagramClient()
    
    // Generate state parameter
    const state = generateState()
    
    // Store state in secure cookie
    const cookieStore = await cookies()
    cookieStore.set('instagram_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })
    
    // Generate authorization URL
    const authUrl = instagramClient.getAuthorizationUrl(state)
    
    // Redirect to Instagram OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Instagram OAuth initiation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Instagram OAuth',
      },
      { status: 500 }
    )
  }
}
