'use client'

import Link from 'next/link'
import { HyperspeedBackground } from '../effects/HyperspeedBackground'

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-16 px-6 bg-[#0a0e27] overflow-hidden">
      {/* 3D Background Animation */}
      <HyperspeedBackground />
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Get <span className="text-blue-400">AI News</span> turned into
          <br />
          ready-to-post content for
          <br />
          every major platform.
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
          The only platform to turn the latest news into ready-to-share posts every day.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="bg-transparent border border-gray-600 text-white px-8 py-3 rounded-lg hover:border-gray-500 transition-colors font-medium"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  )
}
