'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PublishDialog } from './PublishDialog'

interface PublishButtonProps {
  contentId: string
  content: string
  variant?: 'default' | 'outline'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  onPublished?: () => void
}

export function PublishButton({
  contentId,
  content,
  variant = 'default',
  size = 'default',
  className = '',
  onPublished,
}: PublishButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowDialog(true)}
        variant={variant}
        size={size}
        className={className}
      >
        <Send className="h-4 w-4 mr-2" />
        Publish
      </Button>

      <PublishDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        contentId={contentId}
        content={content}
        onPublished={() => {
          setShowDialog(false)
          onPublished?.()
        }}
      />
    </>
  )
}
