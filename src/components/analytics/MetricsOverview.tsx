'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, TrendingDown, FileText, Bookmark, Calendar, Zap } from 'lucide-react'
import type { AnalyticsOverview } from '@/types/analytics'

interface MetricsOverviewProps {
  data: AnalyticsOverview
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  const metrics = [
    {
      title: 'Total Content',
      value: data.totalContent.toLocaleString(),
      icon: FileText,
      change: data.growthRate,
      changeLabel: 'vs last week',
      color: 'text-blue-400'
    },
    {
      title: 'Bookmarks',
      value: data.totalBookmarks.toLocaleString(),
      icon: Bookmark,
      change: null,
      changeLabel: 'articles saved',
      color: 'text-green-400'
    },
    {
      title: 'Scheduled Posts',
      value: data.totalScheduled.toLocaleString(),
      icon: Calendar,
      change: null,
      changeLabel: 'upcoming posts',
      color: 'text-purple-400'
    },
    {
      title: 'Active Streak',
      value: `${data.activeStreak} days`,
      icon: Zap,
      change: null,
      changeLabel: 'consecutive days',
      color: 'text-orange-400'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        const isPositive = metric.change && metric.change > 0
        const isNegative = metric.change && metric.change < 0
        
        return (
          <Card key={index} className="p-6 bg-[#1a1f3a] border-gray-800 hover:border-purple-500/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-gray-800 ${metric.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              {metric.change !== null && (
                <div className={`flex items-center text-sm ${
                  isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {isPositive && <TrendingUp className="w-4 h-4 mr-1" />}
                  {isNegative && <TrendingDown className="w-4 h-4 mr-1" />}
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-sm text-gray-400">{metric.title}</p>
              <p className="text-xs text-gray-500 mt-1">{metric.changeLabel}</p>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
