'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { GenerationRequest } from '@/types/ai'

interface ToneSelectorProps {
  value: GenerationRequest['tone']
  onChange: (tone: GenerationRequest['tone']) => void
}

const tones = [
  {
    value: 'professional' as const,
    label: 'Professional',
    description: 'Authoritative and business-appropriate',
  },
  {
    value: 'friendly' as const,
    label: 'Friendly',
    description: 'Warm and approachable',
  },
  {
    value: 'witty' as const,
    label: 'Witty',
    description: 'Clever with subtle humor',
  },
  {
    value: 'formal' as const,
    label: 'Formal',
    description: 'Academic and precise',
  },
]

export function ToneSelector({ value, onChange }: ToneSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-[#1a1f3a] border-purple-500/30 text-white focus:ring-purple-500">
        <SelectValue placeholder="Select tone" />
      </SelectTrigger>
      <SelectContent 
        position="popper" 
        side="bottom" 
        align="start"
        sideOffset={4}
        className="bg-[#1a1f3a] border-purple-500/30 max-h-[280px]"
      >
        {tones.map((tone) => (
          <SelectItem 
            key={tone.value} 
            value={tone.value}
            className="text-white hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer"
          >
            <div className="py-1">
              <div className="font-medium text-sm">{tone.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{tone.description}</div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
