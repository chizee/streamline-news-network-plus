'use client'

import { Card } from '@/components/ui/card'
import { Linkedin, Twitter, Instagram, Facebook, AtSign } from 'lucide-react'
import type { GenerationRequest } from '@/types/ai'

interface PlatformSelectorProps {
  value: GenerationRequest['platform']
  onChange: (platform: GenerationRequest['platform']) => void
}

const platforms = [
  {
    id: 'linkedin' as const,
    name: 'LinkedIn',
    Icon: Linkedin,
    description: '1300-3000 characters',
    color: 'bg-blue-50 border-blue-200',
    activeColor: 'bg-blue-100 border-blue-500',
    iconColor: 'text-[#0A66C2]',
  },
  {
    id: 'twitter' as const,
    name: 'Twitter/X',
    Icon: Twitter,
    description: 'Up to 280 characters',
    color: 'bg-sky-50 border-sky-200',
    activeColor: 'bg-sky-100 border-sky-500',
    iconColor: 'text-[#1DA1F2]',
  },
  {
    id: 'instagram' as const,
    name: 'Instagram',
    Icon: Instagram,
    description: 'Up to 2200 characters',
    color: 'bg-pink-50 border-pink-200',
    activeColor: 'bg-pink-100 border-pink-500',
    iconColor: 'text-[#E4405F]',
  },
  {
    id: 'facebook' as const,
    name: 'Facebook',
    Icon: Facebook,
    description: '1-3 paragraphs',
    color: 'bg-indigo-50 border-indigo-200',
    activeColor: 'bg-indigo-100 border-indigo-500',
    iconColor: 'text-[#1877F2]',
  },
  {
    id: 'threads' as const,
    name: 'Threads',
    Icon: AtSign,
    description: 'Up to 500 characters',
    color: 'bg-purple-50 border-purple-200',
    activeColor: 'bg-purple-100 border-purple-500',
    iconColor: 'text-gray-900',
  },
]

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {platforms.map((platform) => {
        const isActive = value === platform.id
        const Icon = platform.Icon
        return (
          <Card
            key={platform.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-md ${
              isActive ? platform.activeColor : platform.color
            } ${isActive ? 'ring-2 ring-offset-2' : ''}`}
            onClick={() => onChange(platform.id)}
          >
            <div className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className={`w-8 h-8 ${platform.iconColor}`} />
              </div>
              <div className="font-semibold text-sm mb-1 text-gray-900">{platform.name}</div>
              <div className="text-xs text-gray-700">{platform.description}</div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
