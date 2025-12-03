'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Twitter, Facebook, Instagram, MessageCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

type SocialConnection = Tables<'social_connections'>

interface PlatformConfig {
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const PLATFORMS: Record<string, PlatformConfig> = {
  twitter: {
    name: 'Twitter / X',
    icon: Twitter,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10 hover:bg-blue-600/20',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10 hover:bg-pink-500/20',
  },
  threads: {
    name: 'Threads',
    icon: MessageCircle,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
  },
}

export function SocialConnectionsManager() {
  const [connections, setConnections] = useState<SocialConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null)
  const [disconnectingPlatform, setDisconnectingPlatform] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    loadConnections()
  }, [])

  async function loadConnections() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        // Silently handle auth errors - user not logged in
        setLoading(false)
        return
      }
      
      if (!user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('social_connections')
        .select('*')
        .eq('user_id', user.id)

      if (error) {
        // Silently handle database errors - table likely doesn't exist yet
        // This is expected before migrations are applied
        setConnections([])
        setLoading(false)
        return
      }
      
      setConnections(data || [])
    } catch (error) {
      // Silently handle all errors - component will show empty state
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  async function handleConnect(platform: string) {
    setConnectingPlatform(platform)
    try {
      // Check if development mode is enabled
      const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
                               process.env.NEXT_PUBLIC_OAUTH_DEV_MODE === 'true'
      
      if (isDevelopmentMode) {
        // Simulate connection in development mode
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create a mock connection
        const mockConnection: SocialConnection = {
          id: `dev-${platform}-${Date.now()}`,
          user_id: 'dev-user',
          platform,
          platform_user_id: `dev-${platform}-user`,
          platform_username: `DevUser_${platform}`,
          access_token: 'dev-token',
          refresh_token: null,
          token_expires_at: null,
          connected_at: new Date().toISOString(),
          last_used_at: null,
          is_active: true,
          metadata: null,
        }
        
        setConnections([...connections, mockConnection])
        toast.success(`Connected to ${PLATFORMS[platform].name} (Dev Mode)`)
        setConnectingPlatform(null)
        return
      }
      
      // Redirect to OAuth flow
      window.location.href = `/api/auth/${platform}`
    } catch (error) {
      console.error('Error connecting:', error)
      toast.error(`Failed to connect to ${PLATFORMS[platform].name}`)
      setConnectingPlatform(null)
    }
  }

  async function handleDisconnect(platform: string) {
    setDisconnectingPlatform(platform)
    try {
      // Check if development mode is enabled
      const isDevelopmentMode = process.env.NODE_ENV === 'development' && 
                               process.env.NEXT_PUBLIC_OAUTH_DEV_MODE === 'true'
      
      if (isDevelopmentMode) {
        // Simulate disconnection in development mode
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Remove from local state
        setConnections(connections.filter((c) => c.platform !== platform))
        toast.success(`Disconnected from ${PLATFORMS[platform].name} (Dev Mode)`)
        setDisconnectingPlatform(null)
        return
      }
      
      const response = await fetch(`/api/auth/${platform}/disconnect`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to disconnect')
      }

      // Remove from local state
      setConnections(connections.filter((c) => c.platform !== platform))
      toast.success(`Disconnected from ${PLATFORMS[platform].name}`)
    } catch (error) {
      console.error('Error disconnecting:', error)
      toast.error(`Failed to disconnect from ${PLATFORMS[platform].name}`)
    } finally {
      setDisconnectingPlatform(null)
    }
  }

  function getConnection(platform: string): SocialConnection | undefined {
    return connections.find((c) => c.platform === platform)
  }

  function isConnected(platform: string): boolean {
    return !!getConnection(platform)
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Social Media Connections</h3>
        <p className="text-sm text-gray-400">
          Connect your social media accounts to publish content directly from the platform.
        </p>
      </div>

      <div className="grid gap-4">
        {Object.entries(PLATFORMS).map(([platform, config]) => {
          const connection = getConnection(platform)
          const connected = isConnected(platform)
          const Icon = config.icon
          const isConnecting = connectingPlatform === platform
          const isDisconnecting = disconnectingPlatform === platform

          return (
            <div
              key={platform}
              className={`p-4 rounded-lg border border-gray-800 ${config.bgColor} transition-colors`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gray-900/50`}>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{config.name}</h4>
                    {connected && connection ? (
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-gray-400">
                          Connected as {connection.platform_username || 'User'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        <XCircle className="h-3 w-3 text-gray-500" />
                        <span className="text-xs text-gray-500">Not connected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {connected && connection && (
                    <div className="text-right mr-2">
                      <p className="text-xs text-gray-500">Connected</p>
                      <p className="text-xs text-gray-400">
                        {formatDate(connection.connected_at)}
                      </p>
                    </div>
                  )}

                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(platform)}
                      disabled={isDisconnecting}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                      {isDisconnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Disconnecting...
                        </>
                      ) : (
                        'Disconnect'
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleConnect(platform)}
                      disabled={isConnecting}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
        <h4 className="text-sm font-medium text-purple-300 mb-2">Why connect social accounts?</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Publish content directly to your social media platforms</li>
          <li>• Schedule posts for optimal engagement times</li>
          <li>• Track performance across all your accounts</li>
          <li>• Save time with multi-platform publishing</li>
        </ul>
      </div>
    </div>
  )
}
