// Instagram OAuth Callback Route (uses Facebook OAuth)

import { NextRequest, NextResponse } from 'next/server'
import { InstagramClient } from '@/lib/social/instagram-client'
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
        new URL(`/dashboard/settings?error=instagram_oauth_${error}`, request.url)
      )
    }
    
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=instagram_oauth_missing_params', request.url)
      )
    }
    
    // Verify state parameter
    const cookieStore = await cookies()
    const storedState = cookieStore.get('instagram_oauth_state')?.value
    
    if (!storedState) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=instagram_oauth_expired', request.url)
      )
    }
    
    if (!verifyState(state, storedState)) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=instagram_oauth_invalid_state', request.url)
      )
    }
    
    // Exchange code for tokens
    const instagramClient = new InstagramClient()
    const tokenResponse = await instagramClient.authenticate(code)
    
    // Get Instagram Business Account info
    // First get Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenResponse.accessToken}`
    )
    
    if (!pagesResponse.ok) {
      throw new Error('Failed to get Facebook pages')
    }
    
    const pagesData = await pagesResponse.json()
    const pageId = pagesData.data?.[0]?.id
    
    if (!pageId) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=instagram_no_page', request.url)
      )
    }
    
    // Get Instagram Business Account
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${tokenResponse.accessToken}`
    )
    
    if (!igAccountResponse.ok) {
      throw new Error('Failed to get Instagram Business account')
    }
    
    const igAccountData = await igAccountResponse.json()
    const igUserId = igAccountData.instagram_business_account?.id
    
    if (!igUserId) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=instagram_no_business_account', request.url)
      )
    }
    
    // Get Instagram user info
    const igUserResponse = await fetch(
      `https://graph.instagram.com/v18.0/${igUserId}?fields=id,username&access_token=${tokenResponse.accessToken}`
    )
    
    if (!igUserResponse.ok) {
      throw new Error('Failed to get Instagram user info')
    }
    
    const igUserData = await igUserResponse.json()
    
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
        platform: 'instagram',
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        token_expires_at: tokenResponse.expiresIn
          ? new Date(Date.now() + tokenResponse.expiresIn * 1000).toISOString()
          : null,
        platform_user_id: igUserData.id,
        platform_username: igUserData.username,
        connected_at: new Date().toISOString(),
      })
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=instagram_save_failed', request.url)
      )
    }
    
    // Clear cookies
    cookieStore.delete('instagram_oauth_state')
    
    // Redirect to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?success=instagram_connected', request.url)
    )
  } catch (error) {
    console.error('Instagram OAuth callback error:', error)
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=instagram_oauth_failed', request.url)
    )
  }
}
