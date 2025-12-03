'use client'

import { useState } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    rating: 5,
    text: 'SNN+ has completely transformed how I create content. I can now turn any tech news into engaging posts for all my social channels in minutes. The AI-generated content is spot-on and saves me hours every week!',
    author: 'Sarah Chen',
    role: 'Tech Content Creator',
    image: 'https://i.pravatar.cc/150?img=5',
  },
  {
    rating: 5,
    text: 'As a social media manager handling multiple clients, SNN+ is a game-changer. The ability to generate platform-specific content from news articles has increased my productivity by 10x. Highly recommend!',
    author: 'Marcus Johnson',
    role: 'Social Media Manager',
    image: 'https://i.pravatar.cc/150?img=12',
  },
  {
    rating: 5,
    text: 'I love how SNN+ keeps me updated with the latest tech news and helps me share it with my audience instantly. The multi-platform support is fantastic, and the content quality is consistently excellent.',
    author: 'Emily Rodriguez',
    role: 'Digital Marketing Specialist',
    image: 'https://i.pravatar.cc/150?img=9',
  },
  {
    rating: 5,
    text: 'The AI-powered content generation is incredible! I can maintain a consistent posting schedule across LinkedIn, Twitter, and Instagram without spending hours writing. SNN+ understands my brand voice perfectly.',
    author: 'David Park',
    role: 'Startup Founder & Influencer',
    image: 'https://i.pravatar.cc/150?img=13',
  },
  {
    rating: 5,
    text: 'Finally, a tool that actually delivers on its promise. The news aggregation is spot-on, and the AI-generated posts are so good that my engagement rates have doubled. Worth every penny!',
    author: 'Jessica Williams',
    role: 'Brand Strategist',
    image: 'https://i.pravatar.cc/150?img=10',
  },
  {
    rating: 5,
    text: 'SNN+ has become an essential part of my content workflow. The ability to customize tone and style for different platforms is brilliant. My followers love the consistent, high-quality content I\'m now able to share.',
    author: 'Alex Thompson',
    role: 'Tech Blogger',
    image: 'https://i.pravatar.cc/150?img=15',
  },
  {
    rating: 5,
    text: 'As a freelance content creator, time is money. SNN+ has cut my content creation time in half while improving quality. The multi-AI provider support ensures I always get the best results.',
    author: 'Priya Patel',
    role: 'Freelance Content Creator',
    image: 'https://i.pravatar.cc/150?img=16',
  },
  {
    rating: 5,
    text: 'I was skeptical at first, but SNN+ exceeded all my expectations. The platform is intuitive, the content is authentic, and my audience engagement has never been better. This is the future of content creation!',
    author: 'Michael Chang',
    role: 'Growth Marketing Lead',
    image: 'https://i.pravatar.cc/150?img=14',
  },
  {
    rating: 5,
    text: 'SNN+ is a must-have for anyone serious about social media. The news curation saves me hours of research, and the AI content generation is remarkably accurate. My content calendar has never looked better!',
    author: 'Rachel Green',
    role: 'Community Manager',
    image: 'https://i.pravatar.cc/150?img=20',
  },
  {
    rating: 5,
    text: 'The best investment I\'ve made for my content business. SNN+ helps me stay on top of tech trends and share valuable insights with my audience effortlessly. The ROI is incredible!',
    author: 'James Anderson',
    role: 'Tech Consultant',
    image: 'https://i.pravatar.cc/150?img=18',
  },
  {
    rating: 5,
    text: 'I manage content for multiple tech companies, and SNN+ has been a lifesaver. The platform-specific optimization ensures every post performs well. My clients are thrilled with the results!',
    author: 'Lisa Martinez',
    role: 'Content Marketing Manager',
    image: 'https://i.pravatar.cc/150?img=23',
  },
  {
    rating: 5,
    text: 'SNN+ combines the best of AI and human creativity. The content it generates gives me a perfect starting point that I can quickly refine. It\'s like having a content assistant that never sleeps!',
    author: 'Tom Wilson',
    role: 'Digital Content Producer',
    image: 'https://i.pravatar.cc/150?img=17',
  },
]

const ITEMS_PER_PAGE = 3

export function Testimonials() {
  const [currentPage, setCurrentPage] = useState(0)
  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE)

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev === 0 ? totalPages - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => (prev === totalPages - 1 ? 0 : prev + 1))
  }

  const handleDotClick = (page: number) => {
    setCurrentPage(page)
  }

  const startIndex = currentPage * ITEMS_PER_PAGE
  const visibleTestimonials = testimonials.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  return (
    <section className="py-16 px-6 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-white text-center text-3xl font-bold mb-12">
          Loved by hundreds of creators worldwide
        </h2>

        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors border border-gray-700 hover:border-purple-500"
            aria-label="Previous testimonials"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors border border-gray-700 hover:border-purple-500"
            aria-label="Next testimonials"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {visibleTestimonials.map((testimonial, idx) => (
              <div
                key={startIndex + idx}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6 hover:border-purple-500 transition-colors"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>

                <p className="text-gray-300 mb-6 leading-relaxed">{testimonial.text}</p>

                <div className="flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.author}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{testimonial.author}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(totalPages)].map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleDotClick(idx)}
              className={`w-2 h-2 rounded-full transition-colors ${
                idx === currentPage ? 'bg-blue-500' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Go to testimonial page ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
