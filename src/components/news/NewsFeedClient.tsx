'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { NewsFeed } from './NewsFeed'
import { createClient } from '@/lib/supabase/client'
import type { NewsArticle } from '@/types/news'

interface NewsFeedClientProps {
  initialArticles: NewsArticle[]
  initialBookmarkedIds: string[]
  userId: string
  shouldAutoFetch?: boolean
}

export function NewsFeedClient({ initialArticles, initialBookmarkedIds, userId, shouldAutoFetch = false }: NewsFeedClientProps) {
  const router = useRouter()
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set(initialBookmarkedIds))
  const [isLoading, setIsLoading] = useState(false)
  const [hasAutoFetched, setHasAutoFetched] = useState(false)

  const handleBookmark = async (article: NewsArticle) => {
    const supabase = createClient()
    const isCurrentlyBookmarked = bookmarkedIds.has(article.id)

    try {
      if (isCurrentlyBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('saved_news')
          .delete()
          .eq('user_id', userId)
          .eq('article_id', article.id)

        if (error) {
          console.error('Delete bookmark error:', error)
          throw error
        }

        setBookmarkedIds((prev) => {
          const next = new Set(prev)
          next.delete(article.id)
          return next
        })

        toast.success('Bookmark removed', {
          description: 'Article removed from saved items',
        })
      } else {
        // Add bookmark - check if article exists first
        const { data: articleExists, error: checkError } = await supabase
          .from('news_articles')
          .select('id')
          .eq('id', article.id)
          .single()

        if (checkError || !articleExists) {
          console.error('Article not found in database:', article.id, checkError)
          throw new Error('Article not found. Please refresh the news feed and try again.')
        }

        const { error } = await supabase.from('saved_news').insert({
          user_id: userId,
          article_id: article.id,
          notes: null,
        })

        if (error) {
          console.error('Insert bookmark error:', error)
          // Check for duplicate
          if (error.code === '23505') {
            toast.info('Already bookmarked', {
              description: 'This article is already in your saved items',
            })
            setBookmarkedIds((prev) => new Set(prev).add(article.id))
            return
          }
          throw error
        }

        setBookmarkedIds((prev) => new Set(prev).add(article.id))

        toast.success('Article saved', {
          description: 'Article added to your saved items',
        })
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update bookmark'
      toast.error('Error', {
        description: errorMessage,
      })
    }
  }

  const handleRefresh = async () => {
    setIsLoading(true)

    try {
      // Fetch fresh news from API - increased to 100 articles
      const response = await fetch('/api/news/fetch?max=100&hours=48')
      
      if (!response.ok) {
        throw new Error('Failed to fetch news')
      }

      const data = await response.json()

      toast.success('News updated', {
        description: `Fetched ${data.stored} new articles from ${data.source}`,
      })

      // Refresh the page to show new articles
      router.refresh()
    } catch (error) {
      console.error('Error refreshing news:', error)
      toast.error('Error', {
        description: 'Failed to fetch fresh news',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectArticle = (article: NewsArticle) => {
    // Open article in new tab
    window.open(article.url, '_blank')
  }

  // Auto-fetch news if needed
  useEffect(() => {
    if (shouldAutoFetch && !hasAutoFetched && !isLoading) {
      setHasAutoFetched(true)
      handleRefresh()
    }
  }, [shouldAutoFetch, hasAutoFetched, isLoading])

  return (
    <NewsFeed
      articles={articles}
      onBookmark={handleBookmark}
      onSelectArticle={handleSelectArticle}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      bookmarkedIds={bookmarkedIds}
    />
  )
}
