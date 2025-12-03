'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { NewsArticle } from '@/types/news'
import type { GenerationRequest } from '@/types/ai'
import { PlatformSelector } from './PlatformSelector'
import { ToneSelector } from './ToneSelector'
import { ContentPreview } from './ContentPreview'

interface ContentGeneratorProps {
  article: NewsArticle
}

export function ContentGenerator({ article }: ContentGeneratorProps) {
  const [platform, setPlatform] = useState<GenerationRequest['platform']>('linkedin')
  const [tone, setTone] = useState<GenerationRequest['tone']>('professional')
  const [contentType, setContentType] = useState<'post' | 'thread'>('post')
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [contentId, setContentId] = useState<string | undefined>(undefined)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const request: GenerationRequest = {
        articleTitle: article.title,
        articleDescription: article.description || '',
        articleContent: article.content || undefined,
        platform,
        tone,
        contentType: platform === 'twitter' ? contentType : undefined,
      }

      console.log('Generating content with request:', request)

      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to generate content' }))
        throw new Error(errorData.error || 'Failed to generate content')
      }

      const data = await response.json()
      console.log('Content generated successfully:', data)
      setGeneratedContent(data.content)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while generating content'
      console.error('Generation error:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/content/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article_id: article.id,
          platform,
          content_type: contentType,
          generated_text: generatedContent,
          tone,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save content')
      }

      const data = await response.json()
      if (data.content?.id) {
        setContentId(data.content.id)
      }

      alert('Content saved to library!')
    } catch (err) {
      console.error('Save error:', err)
      alert('Failed to save content')
    }
  }

  return (
    <div className="space-y-6">
      {/* Article Info */}
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
        <p className="text-sm text-gray-600">{article.description}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <span>{article.source}</span>
          <span>•</span>
          <span>{new Date(article.published_at).toLocaleDateString()}</span>
        </div>
      </Card>

      {/* Platform Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Platform</label>
        <PlatformSelector value={platform} onChange={setPlatform} />
      </div>

      {/* Twitter Content Type */}
      {platform === 'twitter' && (
        <div>
          <label className="block text-sm font-medium mb-2">Content Type</label>
          <div className="flex gap-2">
            <Button
              variant={contentType === 'post' ? 'default' : 'outline'}
              onClick={() => setContentType('post')}
            >
              Single Post
            </Button>
            <Button
              variant={contentType === 'thread' ? 'default' : 'outline'}
              onClick={() => setContentType('thread')}
            >
              Thread
            </Button>
          </div>
        </div>
      )}

      {/* Tone Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Tone</label>
        <ToneSelector value={tone} onChange={setTone} />
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white border-2 border-purple-400 shadow-lg shadow-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/60 disabled:opacity-50 disabled:cursor-not-allowed"
        size="lg"
      >
        {isGenerating ? 'Generating...' : 'Generate Content'}
      </Button>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/20 border-2 border-red-500/50 rounded-lg text-red-300 text-sm backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold">Generation Failed</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Content Preview */}
      {generatedContent && (
        <ContentPreview
          content={generatedContent}
          platform={platform}
          contentId={contentId}
          onRegenerate={handleGenerate}
          onSave={handleSave}
          isRegenerating={isGenerating}
        />
      )}
    </div>
  )
}
