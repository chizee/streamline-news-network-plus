'use client'

import { Zap, Lightbulb, DollarSign } from 'lucide-react'

const benefits = [
  {
    icon: Zap,
    title: 'Benefit Interior',
    description:
      'Scale your SEO blog with ease fast and without any development skills.',
  },
  {
    icon: Lightbulb,
    title: 'Easy Ideation',
    description:
      'Create content on-the-go with big data intelligence and easy.',
  },
  {
    icon: DollarSign,
    title: 'Content Savings',
    description:
      'Cut content costs without sacrificing post quality or engagement potential.',
  },
]

export function Benefits() {
  return (
    <section className="py-16 px-6 bg-[#0a0e27]">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-white text-center text-3xl font-bold mb-12">
          Why content creators choose SNN+
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-6"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>

                <h3 className="text-white text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
