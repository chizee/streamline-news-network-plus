import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { NewsAggregator } from '@/lib/news/aggregator'
import type { NewsArticle } from '@/types/news'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || 'artificial intelligence AI machine learning'
    const maxArticles = parseInt(searchParams.get('max') || '20')
    const hours = parseInt(searchParams.get('hours') || '48')

    // Initialize aggregator
    const aggregator = new NewsAggregator({
      maxArticles,
      minRelevanceScore: 0.3,
    })

    // Fetch news with date filter
    const fromDate = new Date()
    fromDate.setHours(fromDate.getHours() - hours)

    const result = await aggregator.fetchNews(query, {
      maxResults: maxArticles,
      fromDate,
      language: 'en',
      sortBy: 'publishedAt',
    })

    // Score articles for relevance
    const scoredArticles = aggregator.scoreArticles(result.articles)

    // Filter by minimum relevance score
    const relevantArticles = scoredArticles.filter(
      article => article.relevance_score && article.relevance_score >= 0.3
    )

    // Store articles in database
    const storedArticles = await storeArticles(supabase, relevantArticles)

    return NextResponse.json({
      success: true,
      source: result.source,
      totalFetched: result.totalFetched,
      filtered: result.filtered,
      relevant: relevantArticles.length,
      stored: storedArticles.length,
      articles: storedArticles,
      errors: result.errors,
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    
    return NextResponse.json(
      {
        error: 'Failed to fetch news',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

async function storeArticles(supabase: any, articles: NewsArticle[]): Promise<NewsArticle[]> {
  const stored: NewsArticle[] = []

  for (const article of articles) {
    try {
      // Check if article already exists
      const { data: existing, error: checkError } = await supabase
        .from('news_articles')
        .select('id, url')
        .eq('url', article.url)
        .maybeSingle()

      if (existing) {
        // Article exists, update fetched_at and return it
        const { data: updated, error: updateError } = await supabase
          .from('news_articles')
          .update({
            fetched_at: new Date().toISOString(),
            is_active: true,
          })
          .eq('url', article.url)
          .select()
          .single()

        if (!updateError && updated) {
          stored.push(updated)
          console.log(`Updated existing article: ${article.title}`)
        }
      } else {
        // Article doesn't exist, insert it
        const { data: inserted, error: insertError } = await supabase
          .from('news_articles')
          .insert({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            source: article.source,
            author: article.author,
            published_at: article.published_at,
            image_url: article.image_url,
            category: article.category,
            keywords: article.keywords,
            sentiment: article.sentiment,
            relevance_score: article.relevance_score,
            fetched_at: article.fetched_at,
            is_active: true,
          })
          .select()
          .single()

        if (!insertError && inserted) {
          stored.push(inserted)
          console.log(`Inserted new article: ${article.title}`)
        } else if (insertError) {
          console.error(`Insert error for ${article.url}:`, insertError)
        }
      }
    } catch (err) {
      // Log but continue with other articles
      console.error(`Failed to store article: ${article.url}`, err)
    }
  }

  console.log(`Stored ${stored.length} articles out of ${articles.length}`)
  return stored
}
