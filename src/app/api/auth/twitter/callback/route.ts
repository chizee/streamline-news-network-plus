// Twitter OAuth Callback Route

import { NextRequest, NextResponse } from 'next/server'
import { TwitterClient } from '@/lib/social/twitter-client'
import { verifyState } from '@/lib/social/oauth-utils'
import { encryptToken } from '@/lib/security/encryption'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    // Handle OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=twitter_oauth_${error}`, request.url)
      )
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=twitter_oauth_missing_params', request.url)
      )
    }
    
    // Verify state parameter
    const cookieStore = await cookies()
    const storedState = cookieStore.get('twitter_oauth_state')?.value
    const codeVerifier = cookieStore.get('twitter_code_verifier')?.value
    
    if (!storedState || !codeVerifier) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=twitter_oauth_expired', request.url)
      )
    }
    
    if (!verifyState(state, storedState)) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=twitter_oauth_invalid_state', request.url)
      )
    }
    
    // Exchange code for tokens
    const twitterClient = new TwitterClient()
    const tokenResponse = await twitterClient.authenticate(code, codeVerifier)
    
    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: {
        Authorization: `Bearer ${tokenResponse.accessToken}`,
      },
    })
    
    if (!userResponse.ok) {
      throw new Error('Failed to get Twitter user info')
    }
    
    const userData = await userResponse.json()
    
    // Store encrypted tokens in database
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(
        new URL('/login?error=authentication_required', request.url)
      )
    }
    
    const encryptedAccessToken = encryptToken(tokenResponse.accessToken)
    const encryptedRefreshToken = tokenResponse.refreshToken
      ? encryptToken(tokenResponse.refreshToken)
      : null
    
    const connectionData = {
      user_id: user.id,
      platform: 'twitter',
      access_token: encryptedAccessToken,
      refresh_token: encryptedRefreshToken,
      token_expires_at: tokenResponse.expiresIn
        ? new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString()
        : null,
      platform_user_id: userData.data.id,
      platform_username: userData.data.username,
      connected_at: new Date().toISOString(),
    }
    
    console.log('Attempting to save Twitter connection for user:', user.id)
    
    const { data: savedData, error: dbError } = await supabase
      .from('social_connections')
      .upsert(connectionData, {
        onConflict: 'user_id,platform'
      })
      .select()
    
    if (dbError) {
      console.error('Database error details:', {
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
        code: dbError.code
      })
      return NextResponse.redirect(
        new URL(`/dashboard/settings?error=twitter_save_failed&details=${encodeURIComponent(dbError.message)}`, request.url)
      )
    }
    
    console.log('Twitter connection saved successfully:', savedData)
    
    // Clear cookies
    cookieStore.delete('twitter_oauth_state')
    cookieStore.delete('twitter_code_verifier')
    
    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?success=twitter_connected', request.url)
    )
  } catch (error) {
    console.error('Twitter OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=twitter_oauth_failed', request.url)
    )
  }
}
