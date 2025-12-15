'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { ContentAnalytics } from '@/types/analytics'

interface ContentAnalyticsProps {
  data: ContentAnalytics
}

const TONE_COLORS = {
  professional: '#3b82f6',
  casual: '#10b981',
  enthusiastic: '#f59e0b',
  informative: '#8b5cf6',
  persuasive: '#ef4444'
}

export function ContentAnalytics({ data }: ContentAnalyticsProps) {
  // Prepare data for tone chart
  const toneChartData = data.byTone.map(item => ({
    ...item,
    fill: TONE_COLORS[item.tone as keyof typeof TONE_COLORS] || '#6b7280'
  }))

  // Prepare data for daily content chart (last 7 days)
  const recentData = data.byDate.slice(-7).map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
    count: item.count
  }))

  return (
    <Card className="p-6 bg-[#1a1f3a] border-gray-800">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Content Analytics</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Total Generated:</span>
            <span className="text-white font-semibold ml-2">{data.totalGenerated}</span>
          </div>
          <div>
            <span className="text-gray-400">Daily Average:</span>
            <span className="text-white font-semibold ml-2">{data.averagePerDay}</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Daily Content Generation (Last 7 Days) */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Daily Content (Last 7 Days)</h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content by Tone */}
        {data.byTone.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-300 mb-3">Content by Tone</h4>
            <div className="flex items-center justify-between">
              <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={toneChartData}
                      dataKey="count"
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                    >
                      {toneChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="flex-1 ml-4 space-y-1">
                {data.byTone.slice(0, 3).map((tone) => (
                  <div key={tone.tone} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-2 h-2 rounded-full mr-2"
                        style={{ backgroundColor: TONE_COLORS[tone.tone as keyof typeof TONE_COLORS] || '#6b7280' }}
                      />
                      <span className="text-gray-300 capitalize">{tone.tone}</span>
                    </div>
                    <span className="text-white font-medium">{tone.count}</span>
                  </div>
                ))}
                {data.byTone.length > 3 && (
                  <div className="text-xs text-gray-500 mt-2">
                    +{data.byTone.length - 3} more tones
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
