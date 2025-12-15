'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { X, Home, Newspaper, Sparkles, Library, Bookmark, Settings, BarChart3, Calendar, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'News Feed', href: '/dashboard/news', icon: Newspaper },
  { name: 'Generate Content', href: '/dashboard/generate', icon: Sparkles },
  { name: 'Content Library', href: '/dashboard/library', icon: Library },
  { name: 'Saved Articles', href: '/dashboard/saved', icon: Bookmark },
  { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Integrations', href: '/dashboard/integrations', icon: Share2, badge: 'Soon' },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

interface UserProfile {
  full_name: string | null
  email: string
  avatar_url?: string | null
}

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  userProfile: UserProfile | null
}

export function MobileSidebar({ isOpen, onClose, userProfile }: MobileSidebarProps) {
  const pathname = usePathname()

  // Get display name and initials
  const displayName = userProfile?.full_name || userProfile?.email?.split('@')[0] || 'User'
  const initials = userProfile?.full_name 
    ? userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : userProfile?.email?.[0]?.toUpperCase() || 'U'

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0e27] border-r border-gray-800 lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="SNN+" width={32} height={32} className="w-8 h-8" />
            <span className="text-xl font-bold text-white">SNN+</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-purple-500/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-purple-500/20 text-purple-300'
                    : 'text-gray-400 hover:bg-purple-500/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800 bg-[#0a0e27]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-400 truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
