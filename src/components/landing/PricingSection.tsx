'use client'

import { Check } from 'lucide-react'

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 bg-[#0a0e27]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-400">
            Start free and scale as you grow
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative p-8 rounded-2xl border-2 border-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl">
            {/* Coming Soon Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold">
                Coming Soon
              </span>
            </div>

            {/* Plan Name */}
            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">
                Free Beta Access
              </h3>
              <p className="text-gray-400">
                Get early access to all features
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="text-5xl font-bold text-white mb-2">
                $0
                <span className="text-2xl text-gray-400 font-normal">/month</span>
              </div>
              <p className="text-sm text-gray-500">
                During beta period
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {[
                'Unlimited news article access',
                'AI content generation for all platforms',
                'Content library and management',
                'Bookmark and save articles',
                'Multiple AI providers (OpenAI, Anthropic, Gemini)',
                'Export content (CSV, JSON)',
                'Email support',
              ].map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-blue-400" />
                  </div>
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <a
              href="/signup"
              className="block w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Join Beta Waitlist
            </a>

            {/* Note */}
            <p className="text-center text-sm text-gray-500 mt-4">
              No credit card required
            </p>
          </div>
        </div>

        {/* Future Plans Note */}
        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-gray-400">
            Paid plans with advanced features like social media scheduling, analytics, and team collaboration will be available after beta.
          </p>
        </div>
      </div>
    </section>
  )
}
