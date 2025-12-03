'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { ScheduleWithContent } from '@/types/scheduling'

interface ScheduledPostsListProps {
  refreshTrigger?: number
}

export function ScheduledPostsList({ refreshTrigger }: ScheduledPostsListProps) {
  const [posts, setPosts] = useState<ScheduleWithContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchScheduledPosts = async () => {
    try {
      const response = await fetch('/api/schedule')
      if (!response.ok) throw new Error('Failed to fetch scheduled posts')
      
      const data = await response.json()
      setPosts(data.scheduledPosts || [])
    } catch (error) {
      console.error('Error fetching scheduled posts:', error)
      toast.error('Failed to load scheduled posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchScheduledPosts()
  }, [refreshTrigger])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled post?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete scheduled post')

      toast.success('Scheduled post cancelled')
      setPosts(posts.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error deleting scheduled post:', error)
      toast.error('Failed to cancel scheduled post')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1 border-gray-600 text-gray-300"><Clock className="h-3 w-3" /> Pending</Badge>
      case 'published':
        return <Badge className="gap-1 bg-green-500 text-white border-transparent"><CheckCircle className="h-3 w-3" /> Published</Badge>
      case 'failed':
        return <Badge className="gap-1 bg-red-500 text-white border-transparent"><XCircle className="h-3 w-3" /> Failed</Badge>
      case 'cancelled':
        return <Badge className="gap-1 bg-gray-700 text-gray-300 border-transparent"><AlertCircle className="h-3 w-3" /> Cancelled</Badge>
      default:
        return <Badge className="bg-gray-700 text-gray-300">{status}</Badge>
    }
  }

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-blue-500'
      case 'twitter':
        return 'bg-sky-400'
      case 'instagram':
        return 'bg-pink-500'
      case 'facebook':
        return 'bg-blue-600'
      case 'threads':
        return 'bg-black'
      default:
        return 'bg-gray-500'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse bg-[#1a1f3a] border-gray-800">
            <div className="h-20 bg-gray-800 rounded" />
          </Card>
        ))}
      </div>
    )
  }

  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center bg-[#1a1f3a] border-gray-800">
        <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="font-semibold mb-2 text-white">No Scheduled Posts</h3>
        <p className="text-sm text-gray-400">
          Schedule posts from your content library to publish them automatically.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-4 bg-[#1a1f3a] border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              {/* Platform Badge */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getPlatformColor(post.platform)}`} />
                <span className="text-sm font-medium capitalize text-white">{post.platform}</span>
                {getStatusBadge(post.status)}
              </div>

              {/* Content Preview */}
              <p className="text-sm text-gray-300 line-clamp-2">
                {post.content?.generated_text || 'No content available'}
              </p>

              {/* Scheduled Time */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-400">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(post.scheduled_for), 'MMM d, yyyy')}
                </div>
                <div className="flex items-center gap-1 text-gray-400">
                  <Clock className="h-4 w-4" />
                  {format(new Date(post.scheduled_for), 'h:mm a')}
                </div>
              </div>

              {/* Error Message */}
              {post.error_message && (
                <p className="text-sm text-red-400">
                  Error: {post.error_message}
                </p>
              )}
            </div>

            {/* Actions */}
            {post.status === 'pending' && (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="hover:bg-purple-500/20 text-gray-400 hover:text-white"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

