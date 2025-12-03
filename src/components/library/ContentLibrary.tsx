'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ContentCard } from './ContentCard'
import { PlatformFilter } from './PlatformFilter'
import { DateRangeFilter } from './DateRangeFilter'
import { SearchBar } from './SearchBar'

interface PublishedPost {
  platform: string
  status: 'pending' | 'published' | 'failed'
  platform_post_url?: string
  error_message?: string
  published_at?: string
}

interface GeneratedContent {
  id: string
  platform: string
  content_type: string
  generated_text: string
  tone: string
  ai_model: string
  created_at: string
  is_published: boolean | null
}

interface ContentLibraryProps {
  initialContent: GeneratedContent[]
  publishedPosts?: Record<string, PublishedPost[]>
}

export function ContentLibrary({ initialContent, publishedPosts = {} }: ContentLibraryProps) {
  const [content, setContent] = useState<GeneratedContent[]>(initialContent)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [postsData, setPostsData] = useState<Record<string, PublishedPost[]>>(publishedPosts)

  const filteredContent = content.filter((item) => {
    // Platform filter
    if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(item.platform)) {
      return false
    }

    // Search filter
    if (searchQuery && !item.generated_text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Date range filter
    if (dateRange.from || dateRange.to) {
      const itemDate = new Date(item.created_at)
      if (dateRange.from && itemDate < dateRange.from) return false
      if (dateRange.to && itemDate > dateRange.to) return false
    }

    return true
  })

  const handleSelectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredContent.map((item) => item.id)))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete content')
      }

      setContent(content.filter((item) => item.id !== id))
      selectedItems.delete(id)
      setSelectedItems(new Set(selectedItems))
    } catch (err) {
      console.error('Delete error:', err)
      alert('Failed to delete content')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return

    if (!confirm(`Delete ${selectedItems.size} items?`)) return

    try {
      await Promise.all(
        Array.from(selectedItems).map((id) =>
          fetch(`/api/content/${id}`, { method: 'DELETE' })
        )
      )

      setContent(content.filter((item) => !selectedItems.has(item.id)))
      setSelectedItems(new Set())
    } catch (err) {
      console.error('Bulk delete error:', err)
      alert('Failed to delete some items')
    }
  }

  const handleExport = (format: 'csv' | 'json') => {
    const dataToExport = filteredContent

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-library-${new Date().toISOString()}.json`
      a.click()
    } else {
      // CSV export
      const headers = ['Platform', 'Type', 'Tone', 'Content', 'Created', 'Published']
      const rows = dataToExport.map((item) => [
        item.platform,
        item.content_type,
        item.tone,
        `"${item.generated_text.replace(/"/g, '""')}"`,
        new Date(item.created_at).toLocaleDateString(),
        item.is_published ? 'Yes' : 'No',
      ])

      const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `content-library-${new Date().toISOString()}.csv`
      a.click()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Content Library</h1>
              <p className="text-gray-400 mt-1">
                {filteredContent.length} of {content.length} items
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('csv')} className="bg-[#1a1f3a] border-gray-700 text-white hover:bg-purple-500/20">
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport('json')} className="bg-[#1a1f3a] border-gray-700 text-white hover:bg-purple-500/20">
              Export JSON
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-[#1a1f3a] border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
            <PlatformFilter
              selectedPlatforms={selectedPlatforms}
              onChange={setSelectedPlatforms}
            />
            <DateRangeFilter dateRange={dateRange} onChange={setDateRange} />
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedItems.size > 0 && (
          <Card className="p-4 bg-[#1a1f3a] border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">
                {selectedItems.size} items selected
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedItems(new Set())} className="bg-gray-800 border-gray-700 text-white hover:bg-purple-500/20">
                  Clear Selection
                </Button>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30">
                  Delete Selected
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Select All */}
        {filteredContent.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItems.size === filteredContent.length}
              onChange={handleSelectAll}
              className="rounded"
            />
            <span className="text-sm text-gray-300">Select All</span>
          </div>
        )}

        {/* Content Grid */}
        {filteredContent.length === 0 ? (
          <Card className="p-12 text-center bg-[#1a1f3a] border-gray-800">
            <p className="text-gray-400">No content found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredContent.map((item) => (
              <ContentCard
                key={item.id}
                content={item}
                publishedPosts={postsData[item.id] || []}
                isSelected={selectedItems.has(item.id)}
                onSelect={(selected: boolean) => {
                  const newSelected = new Set(selectedItems)
                  if (selected) {
                    newSelected.add(item.id)
                  } else {
                    newSelected.delete(item.id)
                  }
                  setSelectedItems(newSelected)
                }}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
