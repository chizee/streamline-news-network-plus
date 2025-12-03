'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle, Mail } from 'lucide-react'

const faqs = [
  {
    question: 'How does the AI content generation work?',
    answer: 'Our AI analyzes news articles and generates platform-optimized social media posts using advanced language models (OpenAI GPT-4, Anthropic Claude, Google Gemini). Each post is tailored to the specific platform\'s character limits, tone, and best practices.',
  },
  {
    question: 'Which social media platforms are supported?',
    answer: 'We currently support LinkedIn, Twitter/X, Instagram, Facebook, and Threads. Each platform has custom formatting rules to ensure your content looks perfect and follows best practices.',
  },
  {
    question: 'Where does the news content come from?',
    answer: 'We aggregate tech news from 5+ trusted sources including Serper, NewsAPI, Mediastack, GNews, and HackerNews. Our AI filters and ranks articles based on relevance and quality.',
  },
  {
    question: 'Can I customize the tone and style of generated content?',
    answer: 'Yes! You can choose from multiple tones (Professional, Friendly, Witty, Formal) and the AI will adapt the content to match your preferred style while maintaining platform-specific best practices.',
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use enterprise-grade encryption for all data, implement Row Level Security (RLS) in our database, and follow industry best practices for data protection. Your content and credentials are always secure.',
  },
  {
    question: 'Can I schedule posts for later?',
    answer: 'Content scheduling is coming soon! During beta, you can generate and save content to your library, then manually post it to your social media accounts.',
  },
  {
    question: 'What happens after the beta period?',
    answer: 'Beta users will get special pricing and early access to new features. We\'ll announce pricing plans well in advance, and you\'ll have the option to continue with a paid plan or export your data.',
  },
  {
    question: 'Do I need API keys for the AI providers?',
    answer: 'No! We provide access to multiple AI providers (OpenAI, Anthropic, Gemini) as part of the service. You don\'t need to manage any API keys or worry about usage limits.',
  },
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="py-24 bg-[#0a0e27]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-gray-700 bg-gray-800/50 mb-6">
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-white">Frequently Asked</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed">
            Everything you need to know about SNN+
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index
            
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl overflow-hidden transition-all duration-300 hover:border-purple-500"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left group"
                >
                  <span className="text-lg font-semibold text-white pr-8 group-hover:text-blue-400 transition-all duration-300">
                    {faq.question}
                  </span>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-purple-500/20 rotate-180' : 'group-hover:bg-gray-600'
                  }`}>
                    <ChevronDown className={`w-5 h-5 transition-colors ${
                      isOpen ? 'text-purple-400' : 'text-gray-400'
                    }`} />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-6 pb-5 border-t border-gray-700">
                    <p className="text-gray-300 leading-relaxed pt-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Contact CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 p-8 rounded-2xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">Still have questions?</h3>
            <p className="text-gray-400 mb-6">
              Our support team is here to help you get the most out of SNN+
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-700 bg-gray-800 text-white hover:bg-gray-700 hover:border-purple-500 transition-all duration-300 group">
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
