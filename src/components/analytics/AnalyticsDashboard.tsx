'use client'

import { useState, useEffect } from 'react'
import { MetricsOverview } from './MetricsOverview'
import { ContentAnalytics } from './ContentAnalytics'
import { PlatformBreakdown } from './PlatformBreakdown'
import { EngagementChart } from './EngagementChart'
import { TopContent } from './TopContent'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, RefreshCw } from 'lucide-react'
import type {
  AnalyticsOverview,
  ContentAnalytics as ContentAnalyticsType,
  EngagementData,
  TopContentItem
} from '@/types/analytics'

export function AnalyticsDashboard() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null)
  const [contentAnalytics, setContentAnalytics] = useState<ContentAnalyticsType | null>(null)
  const [engagementData, setEngagementData] = useState<EngagementData[]>([])
  const [topContent, setTopContent] = useState<TopContentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchAnalytics = async () => {
    try {
      setRefreshing(true)
      
      // Fetch all analytics data in parallel
      const [overviewRes, contentRes, engagementRes, topContentRes] = await Promise.all([
        fetch('/api/analytics/overview'),
        fetch('/api/analytics/content'),
        fetch('/api/analytics/engagement'),
        fetch('/api/analytics/top-content?limit=5')
      ])

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json()
        setOverview(overviewData)
      }

      if (contentRes.ok) {
        const contentData = await contentRes.json()
        setContentAnalytics(contentData)
      }

      if (engagementRes.ok) {
        const engagementData = await engagementRes.json()
        setEngagementData(engagementData)
      }

      if (topContentRes.ok) {
        const topContentData = await topContentRes.json()
        setTopContent(topContentData)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/analytics/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Failed to export analytics:', error)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 bg-[#1a1f3a] border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-700 rounded mb-2" />
              <div className="h-8 bg-gray-700 rounded" />
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-[#1a1f3a] border-gray-800 animate-pulse">
            <div className="h-64 bg-gray-700 rounded" />
          </Card>
          <Card className="p-6 bg-[#1a1f3a] border-gray-800 animate-pulse">
            <div className="h-64 bg-gray-700 rounded" />
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-400">
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="border-gray-700 text-gray-300 hover:bg-purple-500/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="border-gray-700 text-gray-300 hover:bg-purple-500/20"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Metrics Overview */}
      {overview && <MetricsOverview data={overview} />}

      {/* Content Analytics and Platform Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contentAnalytics && <ContentAnalytics data={contentAnalytics} />}
        {contentAnalytics && <PlatformBreakdown data={contentAnalytics.byPlatform} />}
      </div>

      {/* Engagement Chart */}
      {engagementData.length > 0 && (
        <EngagementChart data={engagementData} />
      )}

      {/* Top Content */}
      {topContent.length > 0 && (
        <TopContent data={topContent} />
      )}
    </div>
  )
}
