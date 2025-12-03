'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface BookmarkButtonProps {
  articleId: string
  initialBookmarked?: boolean
  onBookmarkChange?: (bookmarked: boolean) => void
}

export function BookmarkButton({
  articleId,
  initialBookmarked = false,
  onBookmarkChange,
}: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isBookmarked) {
        // Unbookmark
        const response = await fetch(`/api/bookmarks/${articleId}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to remove bookmark')
        }

        setIsBookmarked(false)
        onBookmarkChange?.(false)
      } else {
        // Bookmark
        const response = await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ article_id: articleId }),
        })

        if (!response.ok) {
          throw new Error('Failed to add bookmark')
        }

        setIsBookmarked(true)
        onBookmarkChange?.(true)
      }
    } catch (error) {
      console.error('Bookmark error:', error)
      alert(error instanceof Error ? error.message : 'Failed to update bookmark')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={isBookmarked ? 'default' : 'outline'}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className="gap-1"
    >
      {isBookmarked ? '★' : '☆'}
      {isBookmarked ? 'Saved' : 'Save'}
    </Button>
  )
}
