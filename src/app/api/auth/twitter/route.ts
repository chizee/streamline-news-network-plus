// Twitter OAuth Initiation Route

import { NextRequest, NextResponse } from 'next/server'
import { TwitterClient } from '@/lib/social/twitter-client'
import { generatePKCE, generateState } from '@/lib/social/oauth-utils'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const twitterClient = new TwitterClient()
    
    // Generate PKCE parameters and state
    const { codeVerifier, codeChallenge } = generatePKCE()
    const state = generateState()
    
    // Store PKCE verifier and state in secure cookies
    const cookieStore = await cookies()
    cookieStore.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })
    
    cookieStore.set('twitter_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    })
    
    // Generate authorization URL
    const authUrl = twitterClient.getAuthorizationUrl(state, codeChallenge)
    
    // Redirect to Twitter OAuth page
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('Twitter OAuth initiation error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to initiate Twitter OAuth',
      },
      { status: 500 }
    )
  }
}
