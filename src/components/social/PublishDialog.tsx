'use client'

import { useState, useEffect, useCallback } from 'react'
import { Twitter, Facebook, Instagram, MessageCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

interface PublishDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contentId: string
  content: string
  onPublished?: () => void
}

interface PlatformConfig {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  charLimit: number
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: 'twitter',
    name: 'Twitter / X',
    icon: Twitter,
    color: 'text-blue-400',
    charLimit: 280,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    charLimit: 63206,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    charLimit: 2200,
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: MessageCircle,
    color: 'text-purple-400',
    charLimit: 500,
  },
]

export function PublishDialog({
  open,
  onOpenChange,
  contentId,
  content,
  onPublished,
}: PublishDialogProps) {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConnections, setIsLoadingConnections] = useState(true)
  const supabase = createClient()

  const loadConnectedPlatforms = useCallback(async () => {
    setIsLoadingConnections(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('social_connections')
        .select('platform')
        .eq('user_id', user.id)

      if (error) throw error
      
      const platforms = data?.map((conn) => conn.platform) || []
      setConnectedPlatforms(platforms)
    } catch (error) {
      console.error('Error loading connections:', error)
      toast.error('Failed to load connected accounts')
    } finally {
      setIsLoadingConnections(false)
    }
  }, [supabase])

  useEffect(() => {
    if (open) {
      loadConnectedPlatforms()
    }
  }, [open, loadConnectedPlatforms])

  function togglePlatform(platformId: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platformId)
        ? prev.filter((id) => id !== platformId)
        : [...prev, platformId]
    )
  }

  function getCharacterCount(platformId: string): { count: number; limit: number; isValid: boolean } {
    const platform = PLATFORMS.find((p) => p.id === platformId)
    if (!platform) return { count: 0, limit: 0, isValid: true }

    const count = content.length
    const limit = platform.charLimit
    const isValid = count <= limit

    return { count, limit, isValid }
  }

  function validateContent(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const platformId of selectedPlatforms) {
      const { isValid, count, limit } = getCharacterCount(platformId)
      if (!isValid) {
        const platform = PLATFORMS.find((p) => p.id === platformId)
        errors.push(`${platform?.name}: Content exceeds ${limit} character limit (${count} characters)`)
      }
    }

    return { isValid: errors.length === 0, errors }
  }

  async function handlePublish() {
    if (selectedPlatforms.length === 0) {
      toast.error('Please select at least one platform')
      return
    }

    const validation = validateContent()
    if (!validation.isValid) {
      validation.errors.forEach((error) => toast.error(error))
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId,
          platforms: selectedPlatforms,
          content,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to publish')
      }

      const results = await response.json()
      
      // Show results
      const successCount = results.filter((r: { success: boolean }) => r.success).length
      const failCount = results.filter((r: { success: boolean }) => !r.success).length

      if (successCount > 0) {
        toast.success(`Published to ${successCount} platform${successCount > 1 ? 's' : ''}`)
      }
      
      if (failCount > 0) {
        results
          .filter((r: { success: boolean }) => !r.success)
          .forEach((r: { platform: string; error: string }) => {
            toast.error(`${r.platform}: ${r.error}`)
          })
      }

      if (successCount > 0) {
        onOpenChange(false)
        onPublished?.()
        setSelectedPlatforms([])
      }
    } catch (error) {
      console.error('Error publishing:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to publish')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-[#1a1f3a]/95 to-[#0f1229]/95 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl shadow-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Publish to Social Media</DialogTitle>
          <DialogDescription className="text-gray-300 text-sm">
            Select the platforms where you want to publish this content.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isLoadingConnections ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : connectedPlatforms.length === 0 ? (
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/30 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-300">No connected accounts</p>
                  <p className="text-xs text-yellow-200/80 mt-1">
                    Connect your social media accounts in Settings to publish content.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {PLATFORMS.map((platform) => {
                const isConnected = connectedPlatforms.includes(platform.id)
                const isSelected = selectedPlatforms.includes(platform.id)
                const { count, limit, isValid } = getCharacterCount(platform.id)
                const Icon = platform.icon

                return (
                  <div
                    key={platform.id}
                    className={`rounded-lg border p-4 transition-all ${
                      isConnected
                        ? isSelected
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-gray-700 bg-gray-800/30 hover:border-gray-600'
                        : 'border-gray-800 bg-gray-900/30 opacity-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={platform.id}
                        checked={isSelected}
                        onCheckedChange={() => togglePlatform(platform.id)}
                        disabled={!isConnected || isLoading}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={platform.id}
                          className={`flex items-center gap-2 cursor-pointer ${
                            isConnected ? 'text-white' : 'text-gray-500'
                          }`}
                        >
                          <Icon className={`h-4 w-4 ${platform.color}`} />
                          <span className="font-medium">{platform.name}</span>
                        </Label>
                        {isConnected && (
                          <div className="mt-2 text-xs">
                            <span className={isValid ? 'text-gray-400' : 'text-red-400'}>
                              {count} / {limit.toLocaleString()} characters
                            </span>
                            {!isValid && (
                              <span className="ml-2 text-red-400 font-medium">
                                ⚠ Exceeds limit
                              </span>
                            )}
                          </div>
                        )}
                        {!isConnected && (
                          <p className="text-xs text-gray-500 mt-1">Not connected</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {selectedPlatforms.length > 0 && (
            <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
              <p className="text-xs text-purple-300">
                Publishing to {selectedPlatforms.length} platform{selectedPlatforms.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="bg-[#0a0e27]/80 border-2 border-purple-500/30 text-white hover:bg-purple-500/20 hover:border-purple-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            disabled={isLoading || selectedPlatforms.length === 0 || connectedPlatforms.length === 0}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Publishing...
              </>
            ) : (
              'Publish Now'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
