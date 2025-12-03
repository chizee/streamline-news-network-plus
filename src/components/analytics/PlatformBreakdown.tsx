'use client'

import { Card } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { PlatformMetric } from '@/types/analytics'

interface PlatformBreakdownProps {
  data: PlatformMetric[]
}

const PLATFORM_ICONS = {
  twitter: '𝕏',
  linkedin: 'in',
  instagram: '📷',
  facebook: 'f',
  threads: '@'
}

export function PlatformBreakdown({ data }: PlatformBreakdownProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6 bg-[#1a1f3a] border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Platform Breakdown</h3>
        <div className="text-center py-8">
          <p className="text-gray-400">No content generated yet</p>
          <p className="text-sm text-gray-500 mt-1">Start creating content to see platform analytics</p>
        </div>
      </Card>
    )
  }

  const totalContent = data.reduce((sum, platform) => sum + platform.count, 0)

  return (
    <Card className="p-6 bg-[#1a1f3a] border-gray-800">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Platform Breakdown</h3>
        <p className="text-sm text-gray-400">
          {totalContent} total posts across {data.length} platforms
        </p>
      </div>

      <div className="space-y-6">
        {/* Platform Distribution Chart */}
        <div className="flex items-center justify-between">
          <div className="h-32 w-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={60}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number, name: string) => {
                    const platformName = typeof name === 'string' ? name : String(name)
                    return [
                      `${value} posts`,
                      platformName.charAt(0).toUpperCase() + platformName.slice(1)
                    ]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Platform List */}
          <div className="flex-1 ml-6 space-y-3">
            {data.map((platform) => {
              const TrendIcon = platform.trend === 'up' ? TrendingUp : 
                              platform.trend === 'down' ? TrendingDown : Minus
              
              return (
                <div key={platform.platform} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-3"
                      style={{ backgroundColor: platform.color }}
                    />
                    <div className="flex items-center">
                      <span className="text-sm mr-2">
                        {PLATFORM_ICONS[platform.platform as keyof typeof PLATFORM_ICONS] || '📱'}
                      </span>
                      <span className="text-gray-300 capitalize text-sm">
                        {platform.platform}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium text-sm">
                      {platform.count}
                    </span>
                    <span className="text-gray-500 text-xs">
                      ({platform.percentage}%)
                    </span>
                    <TrendIcon className={`w-3 h-3 ${
                      platform.trend === 'up' ? 'text-green-400' :
                      platform.trend === 'down' ? 'text-red-400' :
                      'text-gray-400'
                    }`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Engagement Scores */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Engagement Scores</h4>
          <div className="h-24">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="horizontal">
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="platform"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#ffffff'
                  }}
                  formatter={(value: number) => [`${Math.round(value)}%`, 'Engagement']}
                />
                <Bar 
                  dataKey="engagementScore" 
                  fill="#8b5cf6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Card>
  )
}
