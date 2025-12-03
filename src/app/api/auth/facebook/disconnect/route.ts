// Facebook OAuth Disconnect Route

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    // Remove Facebook connection from database
    const { error } = await supabase
      .from('social_connections')
      .delete()
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
    
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to disconnect Facebook account' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Facebook account disconnected successfully',
    })
  } catch (error) {
    console.error('Facebook disconnect error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to disconnect Facebook account' },
      { status: 500 }
    )
  }
}
