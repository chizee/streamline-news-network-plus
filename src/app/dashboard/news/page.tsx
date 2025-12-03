import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { NewsFeedClient } from '@/components/news/NewsFeedClient'

export default async function NewsPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch news articles from last 48 hours
  const twoDaysAgo = new Date()
  twoDaysAgo.setHours(twoDaysAgo.getHours() - 48)

  const { data: articles } = await supabase
    .from('news_articles')
    .select('*')
    .eq('is_active', true)
    .gte('published_at', twoDaysAgo.toISOString())
    .order('published_at', { ascending: false })
    .limit(100)

  // Fetch user's bookmarked articles
  const { data: bookmarks } = await supabase
    .from('saved_news')
    .select('article_id')
    .eq('user_id', session.user.id)

  const bookmarkedIds = new Set(bookmarks?.map((b) => b.article_id) || [])

  // Check if we need to fetch fresh news (no articles or articles are old)
  // Also check if the most recent article is more than 2 hours old
  let shouldAutoFetch = !articles || articles.length === 0
  
  if (articles && articles.length > 0) {
    const mostRecentArticle = articles[0]
    const twoHoursAgo = new Date()
    twoHoursAgo.setHours(twoHoursAgo.getHours() - 2)
    
    if (new Date(mostRecentArticle.published_at) < twoHoursAgo) {
      shouldAutoFetch = true
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e27]">
      <div className="container mx-auto p-8">
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">AI News Feed</h1>
            <p className="text-gray-400">Latest AI news from the past 48 hours</p>
          </div>
        </div>

        <NewsFeedClient
          initialArticles={(articles || []).map(article => ({
            ...article,
            category: article.category || [],
            keywords: article.keywords || null,
            sentiment: article.sentiment as 'positive' | 'neutral' | 'negative' | null,
            is_active: article.is_active ?? true
          }))}
          initialBookmarkedIds={Array.from(bookmarkedIds)}
          userId={session.user.id}
          shouldAutoFetch={shouldAutoFetch}
        />
      </div>
    </div>
  )
}
