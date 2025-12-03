'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, LucideIcon } from 'lucide-react'
import { toast } from 'sonner'

interface OAuthButtonProps {
  platform: string
  platformName: string
  icon: LucideIcon
  connected?: boolean
  onConnect?: () => void
  onDisconnect?: () => void
  disabled?: boolean
  className?: string
}

export function OAuthButton({
  platform,
  platformName,
  icon: Icon,
  connected = false,
  onConnect,
  onDisconnect,
  disabled = false,
  className = '',
}: OAuthButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    if (disabled || loading) return

    setLoading(true)
    try {
      if (connected && onDisconnect) {
        await onDisconnect()
      } else if (!connected && onConnect) {
        await onConnect()
      } else if (!connected) {
        // Default behavior: redirect to OAuth flow
        window.location.href = `/api/auth/${platform}`
      }
    } catch (error) {
      console.error(`Error with ${platformName}:`, error)
      toast.error(
        connected
          ? `Failed to disconnect from ${platformName}`
          : `Failed to connect to ${platformName}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant={connected ? 'outline' : 'default'}
      className={`${className} ${
        connected
          ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
          : 'bg-purple-600 hover:bg-purple-700 text-white'
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {connected ? 'Disconnecting...' : 'Connecting...'}
        </>
      ) : (
        <>
          <Icon className="h-4 w-4 mr-2" />
          {connected ? `Disconnect ${platformName}` : `Connect ${platformName}`}
        </>
      )}
    </Button>
  )
}
