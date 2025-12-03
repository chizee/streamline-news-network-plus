'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NewsCard } from './NewsCard'
import { DEFAULT_CATEGORIES } from '@/lib/news/categories'
import type { NewsArticle } from '@/types/news'

interface NewsFeedProps {
  articles: NewsArticle[]
  onBookmark?: (article: NewsArticle) => void
  onSelectArticle?: (article: NewsArticle) => void
  onRefresh?: () => void
  isLoading?: boolean
  bookmarkedIds?: Set<string>
}

const ARTICLES_PER_PAGE = 10

export function NewsFeed({
  articles,
  onBookmark,
  onSelectArticle,
  onRefresh,
  isLoading = false,
  bookmarkedIds = new Set(),
}: NewsFeedProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'relevance'>('date')
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>(articles)
  const [currentPage, setCurrentPage] = useState(1)

  // Use comprehensive predefined categories
  const categories = [
    { value: 'all', label: 'All Categories' },
    ...DEFAULT_CATEGORIES
  ]

  useEffect(() => {
    let filtered = [...articles]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.description?.toLowerCase().includes(query) ||
          article.source.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((article) => article.category.includes(categoryFilter))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
      } else {
        return (b.relevance_score || 0) - (a.relevance_score || 0)
      }
    })

    setFilteredArticles(filtered)
    setCurrentPage(1) // Reset to first page when filters change
  }, [articles, searchQuery, categoryFilter, sortBy])

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE)
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE
  const endIndex = startIndex + ARTICLES_PER_PAGE
  const paginatedArticles = filteredArticles.slice(startIndex, endIndex)

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[#1a1f3a] border-gray-700 text-white placeholder:text-gray-500 focus:border-purple-500"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1f3a] border-gray-700 text-white focus:border-purple-500">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f3a] border-gray-700">
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value} className="text-white focus:bg-purple-500/20 focus:text-white">
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'relevance')}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#1a1f3a] border-gray-700 text-white focus:border-purple-500">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-[#1a1f3a] border-gray-700">
            <SelectItem value="date" className="text-white focus:bg-purple-500/20 focus:text-white">Latest First</SelectItem>
            <SelectItem value="relevance" className="text-white focus:bg-purple-500/20 focus:text-white">Most Relevant</SelectItem>
          </SelectContent>
        </Select>

        {onRefresh && (
          <Button
            variant="outline"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-shrink-0 bg-[#1a1f3a] border-gray-700 text-white hover:bg-purple-500/20 hover:border-purple-500"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-400">
        Showing {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} of {filteredArticles.length} articles
        {filteredArticles.length !== articles.length && ` (filtered from ${articles.length} total)`}
      </div>

      {/* Articles Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No articles found</p>
          {searchQuery && (
            <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-purple-400 hover:text-purple-300">
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {paginatedArticles.map((article) => (
              <NewsCard
                key={article.id}
                article={article}
                isBookmarked={bookmarkedIds.has(article.id)}
                onBookmark={onBookmark}
                onSelect={onSelectArticle}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800">
              <Button
                variant="outline"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 bg-[#1a1f3a] border-gray-700 text-white hover:bg-purple-500/20 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 bg-[#1a1f3a] border-gray-700 text-white hover:bg-purple-500/20 hover:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
