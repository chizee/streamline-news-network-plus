import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContentLibrary } from '@/components/library/ContentLibrary'

export default async function LibraryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's generated content
  const { data: content } = await supabase
    .from('generated_content')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch published posts for all content
  const { data: publishedPostsData } = await supabase
    .from('published_posts')
    .select('content_id, platform, status, platform_post_url, error_message, published_at')
    .eq('user_id', user.id)

  // Group published posts by content_id
  interface PublishedPost {
    platform: string
    status: 'pending' | 'published' | 'failed'
    platform_post_url?: string
    error_message?: string
    published_at?: string
  }
  const publishedPosts: Record<string, PublishedPost[]> = {}
  if (publishedPostsData) {
    for (const post of publishedPostsData) {
      if (!publishedPosts[post.content_id]) {
        publishedPosts[post.content_id] = []
      }
      publishedPosts[post.content_id].push({
        platform: post.platform,
        status: (post.status as 'pending' | 'published' | 'failed') || 'pending',
        platform_post_url: post.platform_post_url || undefined,
        error_message: post.error_message || undefined,
        published_at: post.published_at || undefined,
      })
    }
  }

  return (
    <ContentLibrary 
      initialContent={content || []} 
      publishedPosts={publishedPosts}
    />
  )
}
