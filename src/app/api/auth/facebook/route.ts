// Facebook OAuth Initiation Route

import { NextRequest, NextResponse } from 'next/server'
import { FacebookClient } from '@/lib/social/facebook-client'
import { generateState } from '@/lib/social/oauth-utils'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const facebookClient = new FacebookClient()
    
    // Generate state parameter
    const state = generateState()
    
    // Store state in secure cookie
    const cookieStore = await cookies()
    cookieStore.set('facebook_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })
    
    // Generate authorization URL
    const authUrl = facebookClient.getAuthorizationUrl(state)
    
    // Redirect to Facebook OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Facebook OAuth initiation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Facebook OAuth',
      },
      { status: 500 }
    )
  }
}
