import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Newspaper, Sparkles, Library, TrendingUp } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch stats
  const { count: newsCount } = await supabase
    .from('news_articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  const { count: contentCount } = await supabase
    .from('generated_content')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  const { count: savedCount } = await supabase
    .from('saved_news')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', session.user.id)

  // Fetch recent news articles (limit to 5)
  const { data: recentNews } = await supabase
    .from('news_articles')
    .select('id, title, source, published_at, url')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      name: 'News Articles',
      value: newsCount || 0,
      icon: Newspaper,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/dashboard/news',
    },
    {
      name: 'Generated Content',
      value: contentCount || 0,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/dashboard/library',
    },
    {
      name: 'Saved Articles',
      value: savedCount || 0,
      icon: Library,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/dashboard/saved',
    },
    {
      name: 'Engagement',
      value: '0%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/dashboard/analytics',
      badge: 'Soon',
    },
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#0a0e27] p-3">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome back, {profile?.full_name || session.user.email}!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <a
                key={stat.name}
                href={stat.href}
                className="relative p-5 bg-[#1a1f3a] rounded-lg border border-gray-800/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 group"
              >
                {stat.badge && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-800 text-gray-400">
                    {stat.badge}
                  </span>
                )}
                <div className={`inline-flex p-3 rounded-lg ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </a>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Recent News */}
          <div className="bg-[#1a1f3a] rounded-lg border border-gray-800/50 p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Recent News</h2>
            {recentNews && recentNews.length > 0 ? (
              <div className="space-y-3">
                {recentNews.map((article) => (
                  <a
                    key={article.id}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-lg hover:bg-purple-500/10 transition-colors border border-gray-800/30 hover:border-purple-500/30"
                  >
                    <h3 className="text-sm font-medium text-white line-clamp-2 mb-1">
                      {article.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{new Date(article.published_at).toLocaleDateString()}</span>
                    </div>
                  </a>
                ))}
                <a
                  href="/dashboard/news"
                  className="block text-center text-sm text-purple-400 hover:text-purple-300 font-medium pt-2"
                >
                  View all news →
                </a>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                Latest tech news articles will appear here. Visit the{' '}
                <a href="/dashboard/news" className="text-purple-400 hover:text-purple-300 font-medium">
                  News Feed
                </a>{' '}
                to explore.
              </p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-[#1a1f3a] rounded-lg border border-gray-800/50 p-5">
            <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <a
                href="/dashboard/news"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Newspaper className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Browse News</p>
                  <p className="text-xs text-gray-400">Discover trending tech articles</p>
                </div>
              </a>
              <a
                href="/dashboard/generate"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-500/20 transition-colors"
              >
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Generate Content</p>
                  <p className="text-xs text-gray-400">Create social media posts with AI</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
