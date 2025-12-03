'use client'

import { useState } from 'react'
import { Calendar, Linkedin, Twitter, Instagram, Facebook, AtSign } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScheduleDialog } from '@/components/schedule'
import { PublishButton } from '@/components/social/PublishButton'

interface PublishedPost {
  platform: string
  status: 'pending' | 'published' | 'failed'
  platform_post_url?: string
  error_message?: string
  published_at?: string
}

interface ContentCardProps {
  content: {
    id: string
    platform: string
    content_type: string
    generated_text: string
    tone: string
    created_at: string
    is_published: boolean | null
  }
  publishedPosts?: PublishedPost[]
  isSelected: boolean
  onSelect: (selected: boolean) => void
  onDelete: () => void
}

const platformConfig: Record<string, { icon: React.ElementType; color: string }> = {
  linkedin: { icon: Linkedin, color: '#0077B5' },
  twitter: { icon: Twitter, color: '#1DA1F2' },
  instagram: { icon: Instagram, color: '#E4405F' },
  facebook: { icon: Facebook, color: '#1877F2' },
  threads: { icon: AtSign, color: '#000000' },
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const config = platformConfig[platform] || platformConfig.twitter
  const Icon = config.icon
  return <Icon className="w-5 h-5" style={{ color: config.color }} />
}

export function ContentCard({ content, publishedPosts = [], isSelected, onSelect, onDelete }: ContentCardProps) {
  const [copied, setCopied] = useState(false)
  const [showFull, setShowFull] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.generated_text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const truncatedText =
    content.generated_text.length > 150
      ? content.generated_text.slice(0, 150) + '...'
      : content.generated_text

  return (
    <Card className={`p-4 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded"
          />
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gray-800/50">
            <PlatformIcon platform={content.platform} />
          </div>
          <div>
            <div className="font-semibold text-sm capitalize text-gray-100">{content.platform}</div>
            <div className="text-xs text-gray-400 capitalize">{content.tone}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          {publishedPosts.map((post) => (
            <span
              key={post.platform}
              className={`text-xs px-2 py-1 rounded capitalize ${
                post.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : post.status === 'failed'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {post.platform}: {post.status}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">
          {showFull ? content.generated_text : truncatedText}
        </p>
        {content.generated_text.length > 150 && (
          <button
            onClick={() => setShowFull(!showFull)}
            className="text-xs text-purple-400 hover:text-purple-300 hover:underline mt-1"
          >
            {showFull ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>

      <div className="text-xs text-gray-500 mb-3">
        {new Date(content.created_at).toLocaleDateString()} •{' '}
        {content.generated_text.length} characters
      </div>

      {/* Publishing Status Details */}
      {publishedPosts.length > 0 && (
        <div className="mb-3 space-y-2">
          {publishedPosts.map((post) => (
            <div
              key={post.platform}
              className="text-xs p-2 rounded bg-gray-800/50 border border-gray-700"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-gray-200 capitalize">{post.platform}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    post.status === 'published'
                      ? 'bg-green-500/20 text-green-300'
                      : post.status === 'failed'
                      ? 'bg-red-500/20 text-red-300'
                      : 'bg-yellow-500/20 text-yellow-300'
                  }`}
                >
                  {post.status}
                </span>
              </div>
              {post.status === 'published' && post.platform_post_url && (
                <a
                  href={post.platform_post_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 hover:underline block truncate"
                >
                  View post →
                </a>
              )}
              {post.status === 'failed' && post.error_message && (
                <p className="text-red-300 mt-1">{post.error_message}</p>
              )}
              {post.published_at && (
                <p className="text-gray-400 mt-1">
                  {new Date(post.published_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={handleCopy} className="flex-1">
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
        <PublishButton
          contentId={content.id}
          content={content.generated_text}
          variant="outline"
          size="sm"
          className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
        />
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setShowScheduleDialog(true)} 
          className="flex-1 text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          <Calendar className="h-3 w-3 mr-1" />
          Schedule
        </Button>
        <Button size="sm" variant="outline" onClick={onDelete} className="flex-1 text-red-600 border-red-300 hover:bg-red-50">
          Delete
        </Button>
      </div>

      <ScheduleDialog
        open={showScheduleDialog}
        onOpenChange={setShowScheduleDialog}
        contentId={content.id}
        platform={content.platform}
        onScheduled={() => {
          setShowScheduleDialog(false)
          // Optionally refresh the content list or show a success message
        }}
      />
    </Card>
  )
}
