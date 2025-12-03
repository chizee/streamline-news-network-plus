'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileSidebar } from './MobileSidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
}

interface UserProfile {
  full_name: string | null
  email: string
  avatar_url?: string | null
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  useEffect(() => {
    async function loadUserProfile() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', session.user.id)
          .single()

        setUserProfile({
          full_name: profile?.full_name || null,
          email: session.user.email || '',
          avatar_url: profile?.avatar_url || null
        })
      }
    }

    loadUserProfile()
  }, [])

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      {/* Desktop Sidebar */}
      <Sidebar userProfile={userProfile} />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <TopBar onMenuClick={() => setMobileMenuOpen(true)} userProfile={userProfile} />

        {/* Page Content */}
        <main className="p-2 sm:p-3 lg:p-4">
          {children}
        </main>
      </div>
    </div>
  )
}
