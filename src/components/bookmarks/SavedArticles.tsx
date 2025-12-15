'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { NewsCard } from '@/components/news/NewsCard'
import type { NewsArticle } from '@/types/news'

interface SavedArticle {
  id: string
  article_id: string
  notes: string | null
  created_at: string
  article: NewsArticle
}

interface SavedArticlesProps {
  initialBookmarks: SavedArticle[]
}

export function SavedArticles({ initialBookmarks }: SavedArticlesProps) {
  const [bookmarks, setBookmarks] = useState<SavedArticle[]>(initialBookmarks)
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')

  const handleRemoveBookmark = async (articleId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${articleId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove bookmark')
      }

      setBookmarks(bookmarks.filter((b) => b.article_id !== articleId))
    } catch (error) {
      console.error('Remove bookmark error:', error)
      alert('Failed to remove bookmark')
    }
  }

  const handleSaveNotes = async (articleId: string) => {
    try {
      const response = await fetch(`/api/bookmarks/${articleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesText }),
      })

      if (!response.ok) {
        throw new Error('Failed to update notes')
      }

      setBookmarks(
        bookmarks.map((b) =>
          b.article_id === articleId ? { ...b, notes: notesText } : b
        )
      )
      setEditingNotes(null)
      setNotesText('')
    } catch (error) {
      console.error('Update notes error:', error)
      alert('Failed to update notes')
    }
  }

  const startEditingNotes = (bookmark: SavedArticle) => {
    setEditingNotes(bookmark.article_id)
    setNotesText(bookmark.notes || '')
  }

  if (bookmarks.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e27] p-6">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Saved Articles</h1>
        </div>
        <Card className="p-12 text-center bg-[#1a1f3a] border-gray-800">
          <p className="text-gray-400 mb-4">You haven&apos;t saved any articles yet</p>
          <Button onClick={() => (window.location.href = '/dashboard/news')} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
            Browse News
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Saved Articles</h1>
          <p className="text-gray-400 mt-1">{bookmarks.length} saved articles</p>
        </div>
      </div>

      <div className="space-y-6">
        {bookmarks.map((bookmark) => (
          <Card key={bookmark.id} className="p-6 bg-[#1a1f3a] border-gray-800">
            <div className="mb-4">
              <NewsCard article={bookmark.article} />
            </div>

            {/* Notes Section */}
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm text-white">Notes</h3>
                <div className="flex gap-2">
                  {editingNotes === bookmark.article_id ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleSaveNotes(bookmark.article_id)}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNotes(null)}
                        className="bg-gray-800 border-gray-700 text-white hover:bg-purple-500/20"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEditingNotes(bookmark)}
                        className="bg-gray-800 border-gray-700 text-white hover:bg-purple-500/20"
                      >
                        {bookmark.notes ? 'Edit Notes' : 'Add Notes'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveBookmark(bookmark.article_id)}
                        className="bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                      >
                        Remove
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {editingNotes === bookmark.article_id ? (
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add your notes here..."
                  className="w-full p-3 border border-gray-700 bg-gray-800 text-white placeholder:text-gray-500 rounded-md min-h-[100px] focus:border-purple-500 focus:outline-none"
                />
              ) : bookmark.notes ? (
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {bookmark.notes}
                </p>
              ) : (
                <p className="text-sm text-gray-500 italic">No notes added</p>
              )}
            </div>

            <div className="text-xs text-gray-500 mt-4">
              Saved on {new Date(bookmark.created_at).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
