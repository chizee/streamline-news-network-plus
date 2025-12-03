import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentGeneratorPage } from '@/components/content/ContentGeneratorPage'

export default async function GeneratePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch recent articles for selection
  const { data: articles } = await supabase
    .from('news_articles')
    .select('*')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(20)

  // Ensure category is always an array and sentiment is properly typed
  const normalizedArticles = (articles || []).map(article => ({
    ...article,
    category: article.category || [],
    sentiment: (article.sentiment === 'positive' || article.sentiment === 'neutral' || article.sentiment === 'negative') 
      ? (article.sentiment as 'positive' | 'neutral' | 'negative')
      : null,
    is_active: article.is_active ?? true
  }))

  return <ContentGeneratorPage articles={normalizedArticles} />
}
