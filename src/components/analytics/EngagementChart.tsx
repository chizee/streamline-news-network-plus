'use client'

import { Card } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import type { EngagementData } from '@/types/analytics'
import { format, parseISO } from 'date-fns'

interface EngagementChartProps {
  data: EngagementData[]
}

export function EngagementChart({ data }: EngagementChartProps) {
  // Format data for chart
  const chartData = data.map(item => ({
    ...item,
    date: format(parseISO(item.date), 'MMM dd'),
    total: item.content + item.bookmarks + item.scheduled
  }))

  // Calculate totals for summary
  const totals = data.reduce(
    (acc, item) => ({
      content: acc.content + item.content,
      bookmarks: acc.bookmarks + item.bookmarks,
      scheduled: acc.scheduled + item.scheduled
    }),
    { content: 0, bookmarks: 0, scheduled: 0 }
  )

  return (
    <Card className="p-6 bg-[#1a1f3a] border-gray-800">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Activity Trends</h3>
        <p className="text-sm text-gray-400">
          Your activity over the last 30 days
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{totals.content}</div>
          <div className="text-sm text-gray-400">Content Generated</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{totals.bookmarks}</div>
          <div className="text-sm text-gray-400">Articles Saved</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{totals.scheduled}</div>
          <div className="text-sm text-gray-400">Posts Scheduled</div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="contentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="bookmarksGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="scheduledGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Legend 
              wrapperStyle={{
                paddingTop: '20px'
              }}
              iconType="circle"
            />
            <Area 
              type="monotone" 
              dataKey="content" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#contentGradient)"
              name="Content"
            />
            <Area 
              type="monotone" 
              dataKey="bookmarks" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#bookmarksGradient)"
              name="Bookmarks"
            />
            <Area 
              type="monotone" 
              dataKey="scheduled" 
              stroke="#8b5cf6" 
              fillOpacity={1} 
              fill="url(#scheduledGradient)"
              name="Scheduled"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
