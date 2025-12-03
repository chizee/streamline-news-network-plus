'use client'

import { Linkedin, Twitter, Instagram, Facebook, AtSign } from 'lucide-react'

interface PlatformFilterProps {
  selectedPlatforms: string[]
  onChange: (platforms: string[]) => void
}

const platforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
  { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E4405F' },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: '#1877F2' },
  { id: 'threads', name: 'Threads', icon: AtSign, color: '#000000' },
]

export function PlatformFilter({ selectedPlatforms, onChange }: PlatformFilterProps) {
  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      onChange(selectedPlatforms.filter((p) => p !== platformId))
    } else {
      onChange([...selectedPlatforms, platformId])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-200">Filter by Platform</label>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id)
          const Icon = platform.icon
          return (
            <button
              key={platform.id}
              onClick={() => togglePlatform(platform.id)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                  : 'bg-gray-800/50 border-gray-700 text-gray-300 hover:bg-gray-700/50'
              }`}
            >
              <Icon className="w-4 h-4" style={{ color: isSelected ? platform.color : undefined }} />
              {platform.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
