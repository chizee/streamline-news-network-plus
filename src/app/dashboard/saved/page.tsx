import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SavedArticles } from '@/components/bookmarks/SavedArticles'

export default async function SavedPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's bookmarked articles
  const { data: bookmarks } = await supabase
    .from('saved_news')
    .select(`
      *,
      article:news_articles(*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Normalize the bookmarks data
  const normalizedBookmarks = (bookmarks || []).map(bookmark => ({
    ...bookmark,
    article: {
      ...bookmark.article,
      category: bookmark.article?.category || [],
      sentiment: (bookmark.article?.sentiment === 'positive' || 
                  bookmark.article?.sentiment === 'neutral' || 
                  bookmark.article?.sentiment === 'negative') 
        ? (bookmark.article.sentiment as 'positive' | 'neutral' | 'negative')
        : null,
      is_active: bookmark.article?.is_active ?? true
    }
  }))

  return (
    <SavedArticles initialBookmarks={normalizedBookmarks} />
  )
}
