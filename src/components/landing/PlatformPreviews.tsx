'use client'

import { Instagram, Linkedin, Twitter, Facebook, AtSign } from 'lucide-react'

const platforms = [
  { name: 'Instagram', icon: Instagram, color: 'from-purple-500 to-pink-500' },
  { name: 'LinkedIn', icon: Linkedin, color: 'from-blue-600 to-blue-700' },
  { name: 'X', icon: Twitter, color: 'from-gray-800 to-black' },
  { name: 'Facebook', icon: Facebook, color: 'from-blue-500 to-blue-600' },
  { name: 'Threads', icon: AtSign, color: 'from-gray-900 to-black' },
]

export function PlatformPreviews() {
  return (
    <section className="py-16 px-6 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl p-8">
          <h2 className="text-white text-center text-3xl font-bold mb-8">
            Create content for every platform
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {platforms.map((platform) => {
              const Icon = platform.icon
              return (
                <div
                  key={platform.name}
                  className="bg-white rounded-xl p-6 shadow-lg transform hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5 text-gray-800" />
                    <span className="text-sm font-medium text-gray-800">{platform.name}</span>
                  </div>
                  
                  <div className={`aspect-square bg-gradient-to-br ${platform.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
