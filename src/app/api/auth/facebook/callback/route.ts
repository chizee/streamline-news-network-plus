// Facebook OAuth Callback Route

import { NextRequest, NextResponse } from 'next/server'
import { FacebookClient } from '@/lib/social/facebook-client'
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
        new URL(`/dashboard/settings?error=facebook_oauth_${error}`, request.url)
      )
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=facebook_oauth_missing_params', request.url)
      )
    }
    
    // Verify state parameter
    const cookieStore = await cookies()
    const storedState = cookieStore.get('facebook_oauth_state')?.value
    
    if (!storedState) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=facebook_oauth_expired', request.url)
      )
    }
    
    if (!verifyState(state, storedState)) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=facebook_oauth_invalid_state', request.url)
      )
    }
    
    // Exchange code for tokens
    const facebookClient = new FacebookClient()
    const tokenResponse = await facebookClient.authenticate(code)
    
    // Get user info
    const userResponse = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${tokenResponse.accessToken}`
    )
    
    if (!userResponse.ok) {
      throw new Error('Failed to get Facebook user info')
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
    
    const { error: dbError } = await supabase
      .from('social_connections')
      .upsert({
        user_id: user.id,
        platform: 'facebook',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: tokenResponse.expiresIn
          ? new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString()
          : null,
        platform_user_id: userData.id,
        platform_username: userData.name,
        connected_at: new Date().toISOString(),
      })
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=facebook_save_failed', request.url)
      )
    }
    
    // Clear cookies
    cookieStore.delete('facebook_oauth_state')
    
    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?success=facebook_connected', request.url)
    )
  } catch (error) {
    console.error('Facebook OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=facebook_oauth_failed', request.url)
    )
  }
}
