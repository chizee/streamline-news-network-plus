// Instagram OAuth Disconnect Route

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Remove Instagram connection from database
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'instagram')
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect Instagram account' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Instagram account disconnected successfully',
    })
  } catch (error) {
    console.error('Instagram disconnect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect Instagram account' },
      { status: 500 }
    )
  }
}
