'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { NewsArticle } from '@/types/news'
import { ContentGenerator } from './ContentGenerator'

interface ContentGeneratorPageProps {
  articles: NewsArticle[]
}

export function ContentGeneratorPage({ articles }: ContentGeneratorPageProps) {
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(
    articles.length > 0 ? articles[0] : null
  )

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0e27] p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Generate Social Content</h1>
          </div>
          <Card className="p-8 text-center bg-[#1a1f3a] border-gray-800">
            <h2 className="text-xl font-semibold mb-2 text-white">No Articles Available</h2>
            <p className="text-gray-400 mb-4">
              There are no articles to generate content from. Please check back later.
            </p>
            <Button onClick={() => window.location.href = '/dashboard/news'} className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
              View News Feed
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0e27] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Generate Social Content</h1>
            <p className="text-gray-400">
              Select an article and generate platform-specific content with AI
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Article Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 bg-[#1a1f3a] border-gray-800">
              <h2 className="font-semibold mb-4 text-white">Select Article</h2>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {articles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      selectedArticle?.id === article.id
                        ? 'bg-purple-500/20 border-purple-500'
                        : 'bg-gray-800 border-gray-700 hover:bg-purple-500/10'
                    }`}
                  >
                    <div className="font-medium text-sm line-clamp-2 mb-1 text-white">
                      {article.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {article.source} • {new Date(article.published_at).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Content Generator */}
          <div className="lg:col-span-2">
            {selectedArticle ? (
              <ContentGenerator article={selectedArticle} />
            ) : (
              <Card className="p-8 text-center bg-[#1a1f3a] border-gray-800">
                <p className="text-gray-400">Select an article to get started</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
