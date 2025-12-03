'use client'

import { formatDistanceToNow } from 'date-fns'
import { ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { NewsArticle } from '@/types/news'

interface NewsCardProps {
  article: NewsArticle
  isBookmarked?: boolean
  onBookmark?: (article: NewsArticle) => void
  onSelect?: (article: NewsArticle) => void
}

export function NewsCard({ article, isBookmarked = false, onBookmark, onSelect }: NewsCardProps) {
  const publishedDate = new Date(article.published_at)
  const timeAgo = formatDistanceToNow(publishedDate, { addSuffix: true })

  const relevanceColor = article.relevance_score
    ? article.relevance_score >= 0.7
      ? 'bg-green-500'
      : article.relevance_score >= 0.5
      ? 'bg-yellow-500'
      : 'bg-gray-500'
    : 'bg-gray-500'

  return (
    <Card className="bg-[#1a1f3a] border-gray-800 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-xl hover:shadow-purple-500/10" onClick={() => onSelect?.(article)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-lg line-clamp-2 text-white">{article.title}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2 text-xs text-gray-400">
              <span>{article.source}</span>
              <span>•</span>
              <span>{timeAgo}</span>
              {article.author && (
                <>
                  <span>•</span>
                  <span>by {article.author}</span>
                </>
              )}
            </CardDescription>
          </div>
          {article.image_url && (
            <img
              src={article.image_url}
              alt={article.title}
              className="w-24 h-24 object-cover rounded-md flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {article.description && (
          <p className="text-sm text-gray-400 line-clamp-3 mb-4">{article.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            {article.category.slice(0, 3).map((cat) => (
              <Badge key={cat} className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                {cat}
              </Badge>
            ))}
            {article.relevance_score !== null && (
              <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                <div className={`w-2 h-2 rounded-full ${relevanceColor} mr-1`} />
                {Math.round(article.relevance_score * 100)}% relevant
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-purple-500/20"
              onClick={(e) => {
                e.stopPropagation()
                onBookmark?.(article)
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-purple-400" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-purple-500/20"
              onClick={(e) => {
                e.stopPropagation()
                window.open(article.url, '_blank')
              }}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
