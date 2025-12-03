'use client'

import { Sparkles, Target, TrendingUp } from 'lucide-react'

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Content',
    description: 'Transform any news article into engaging content for your audience.',
    highlights: [
      'AI-Powered Content',
      'Automated Post Generation',
      'Combines Relevant Content',
    ],
  },
  {
    icon: Target,
    title: 'Stay Focused',
    description: 'Stop wasting time researching and start creating content.',
    highlights: [
      'Personalized News Filtering',
      'Curated Industry News',
      'Relevant Topics Suggestions',
    ],
  },
  {
    icon: TrendingUp,
    title: 'Content Growth Tools',
    description: 'Everything you need to grow your content presence.',
    highlights: [
      'Content growth strategies',
      'Performance analytics',
      'Engagement optimization',
    ],
  },
]

export function FeaturesGrid() {
  return (
    <section id="features" className="py-16 px-6 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-white text-center text-3xl font-bold mb-12">
          Everything you need to dominate AI content
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-purple-500 transition-colors"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-white text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 mb-4">{feature.description}</p>

                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Highlights:</p>
                  {feature.highlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-purple-500 rounded-full mt-2" />
                      <p className="text-sm text-gray-300">{highlight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
