'use client'

import { useState } from 'react'
import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScheduleDialog } from '@/components/schedule'
import { PublishButton } from '@/components/social/PublishButton'
import type { GenerationRequest } from '@/types/ai'

interface ContentPreviewProps {
  content: string
  platform: GenerationRequest['platform']
  contentId?: string
  onRegenerate: () => void
  onSave: () => void
  isRegenerating: boolean
}

export function ContentPreview({
  content,
  platform,
  contentId,
  onRegenerate,
  onSave,
  isRegenerating,
}: ContentPreviewProps) {
  const [copied, setCopied] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const getCharacterCount = () => {
    return content.length
  }

  const getCharacterLimit = () => {
    switch (platform) {
      case 'linkedin':
        return '1300-3000'
      case 'twitter':
        return '280'
      case 'instagram':
        return '2200'
      case 'facebook':
        return 'N/A'
      case 'threads':
        return '500'
      default:
        return 'N/A'
    }
  }

  const getHashtagCount = () => {
    if (platform !== 'instagram') return null
    const hashtags = content.match(/#\w+/g) || []
    return hashtags.length
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-[#1a1f3a] to-[#0f1229] border-2 border-purple-500/30 shadow-xl shadow-purple-500/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-white">Generated Content</h3>
        <div className="flex items-center gap-2 text-sm text-purple-300">
          <span>{getCharacterCount()} characters</span>
          {platform !== 'facebook' && (
            <>
              <span>•</span>
              <span>Limit: {getCharacterLimit()}</span>
            </>
          )}
          {getHashtagCount() !== null && (
            <>
              <span>•</span>
              <span>{getHashtagCount()} hashtags</span>
            </>
          )}
        </div>
      </div>

      <div className="bg-[#0a0e27] rounded-lg p-6 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto border border-purple-500/20 shadow-inner">
        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-100 leading-relaxed">{content}</pre>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleCopy} 
          variant="outline" 
          className="flex-1 bg-[#0a0e27] border-2 border-purple-500/50 text-white hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300"
        >
          {copied ? '✓ Copied!' : 'Copy to Clipboard'}
        </Button>
        <Button
          onClick={onRegenerate}
          variant="outline"
          disabled={isRegenerating}
          className="flex-1 bg-[#0a0e27] border-2 border-purple-500/50 text-white hover:bg-purple-500/20 hover:border-purple-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </Button>
        {contentId && (
          <>
            <PublishButton
              contentId={contentId}
              content={content}
              variant="outline"
              className="flex-1 bg-[#0a0e27] border-2 border-green-500/50 text-white hover:bg-green-500/20 hover:border-green-400 transition-all duration-300"
            />
            <Button
              onClick={() => setShowScheduleDialog(true)}
              variant="outline"
              className="flex-1 bg-[#0a0e27] border-2 border-blue-500/50 text-white hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-300"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </>
        )}
        <Button 
          onClick={onSave} 
          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/60"
        >
          Save to Library
        </Button>
      </div>

      {contentId && (
        <ScheduleDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          contentId={contentId}
          platform={platform}
          onScheduled={() => {
            // Optionally refresh or show success message
          }}
        />
      )}
    </Card>
  )
}
