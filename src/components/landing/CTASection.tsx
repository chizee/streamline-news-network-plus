'use client'

import Link from 'next/link'

export function CTASection() {
  return (
    <section className="py-16 px-6 bg-[#0a0e27]">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-white text-3xl font-bold mb-6">
          Ready to transform your AI content strategy?
        </h2>

        <Link 
          href="/signup"
          className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
        >
          Start Creating Content Now
        </Link>
      </div>
    </section>
  )
}
