'use client'

import { useState } from 'react'
import { Menu, Bell, Search, LogOut, User, Settings } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface UserProfile {
  full_name: string | null
  email: string
  avatar_url?: string | null
}

interface TopBarProps {
  onMenuClick: () => void
  userProfile: UserProfile | null
}

export function TopBar({ onMenuClick, userProfile }: TopBarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [hasUnreadNotifications] = useState(false)
  const router = useRouter()

  // Get display name and initials
  const displayName = userProfile?.full_name || userProfile?.email?.split('@')[0] || 'User'
  const displayEmail = userProfile?.email || ''
  const initials = userProfile?.full_name 
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userProfile?.email?.[0]?.toUpperCase() || 'U'

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    setShowUserMenu(false)
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-800 bg-[#0a0e27] px-4 sm:px-6">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gray-400" />
      </button>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="search"
            placeholder="Search articles, content..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-700 bg-[#1a1f3a] text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 mt-2 w-80 bg-[#1a1f3a] rounded-lg shadow-xl border border-gray-800 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-800">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-500 mt-1">We'll notify you when something important happens</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{initials}</span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              
              {/* Menu */}
              <div className="absolute right-0 mt-2 w-56 bg-[#1a1f3a] rounded-lg shadow-xl border border-gray-800 py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-800">
                  <p className="text-sm font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                </div>
                
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-purple-500/20 hover:text-white"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
                
                <div className="border-t border-gray-800 my-1" />
                
                <button
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
                  onClick={handleSignOut}
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
