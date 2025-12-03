'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, Twitter, Linkedin, Instagram, Facebook } from 'lucide-react'
import type { TopContentItem } from '@/types/analytics'
import { formatDistanceToNow, parseISO } from 'date-fns'

interface TopContentProps {
  data: TopContentItem[]
}

const PLATFORM_ICONS = {
  twitter: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  facebook: Facebook,
  threads: TrendingUp
}

const PLATFORM_COLORS = {
  twitter: 'text-blue-400',
  linkedin: 'text-blue-600',
  instagram: 'text-pink-500',
  facebook: 'text-blue-500',
  threads: 'text-gray-400'
}

export function TopContent({ data }: TopContentProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-[#1a1f3a] border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Top Performing Content</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No content data available yet</p>
          <p className="text-sm text-gray-500 mt-1">Generate content to see performance metrics</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-[#1a1f3a] border-gray-800">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Top Performing Content</h3>
        <p className="text-sm text-gray-400">
          Your best content based on engagement scores
        </p>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const Icon = PLATFORM_ICONS[item.platform as keyof typeof PLATFORM_ICONS] || TrendingUp
          const colorClass = PLATFORM_COLORS[item.platform as keyof typeof PLATFORM_COLORS] || 'text-gray-400'
          
          return (
            <div 
              key={item.id} 
              className="flex items-start gap-4 p-4 rounded-lg bg-[#0a0e27] border border-gray-800 hover:border-purple-500/50 transition-colors"
            >
              {/* Rank Badge */}
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  index === 2 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-700/20 text-gray-400'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                  <span className="text-xs text-gray-400 capitalize">
                    {item.platform}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-400 capitalize">
                    {item.tone}
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(parseISO(item.createdAt), { addSuffix: true })}
                  </span>
                </div>
                
                <p className="text-sm text-gray-300 line-clamp-2 mb-2">
                  {item.content}
                </p>

                {/* Engagement Score */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${Math.min(item.engagementScore, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-400">
                    {Math.round(item.engagementScore)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {data.length >= 5 && (
        <div className="mt-4 text-center">
          <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
            View all content →
          </button>
        </div>
      )}
    </Card>
  )
}
