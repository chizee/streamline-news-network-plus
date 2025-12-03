'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Sparkles, Share2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Discover Trending News',
    description: 'Our AI scans 5+ trusted sources to find the most relevant tech news for your audience.',
    color: 'from-blue-500 to-cyan-500',
    features: ['Real-time aggregation', 'Smart filtering', 'Quality ranking']
  },
  {
    number: '02',
    icon: Sparkles,
    title: 'Generate Smart Content',
    description: 'Select an article and let AI create platform-optimized posts tailored to your tone and style.',
    color: 'from-purple-500 to-pink-500',
    features: ['Multi-platform support', 'Tone customization', 'Instant generation']
  },
  {
    number: '03',
    icon: Share2,
    title: 'Publish & Analyze',
    description: 'Schedule posts across all platforms and track performance with detailed analytics.',
    color: 'from-green-500 to-emerald-500',
    features: ['Smart scheduling', 'Performance tracking', 'Growth insights']
  },
]

export function HowItWorks() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([])
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            steps.forEach((_, index) => {
              setTimeout(() => {
                setVisibleSteps(prev => [...prev, index])
              }, index * 200)
            })
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how-it-works" className="py-24 bg-gradient-to-b from-background to-accent/5 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <Badge variant="secondary" className="mb-6 px-6 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            How It Works
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-foreground">From news discovery to</span>
            <br />
            <span className="text-gradient">social media success</span>
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Three simple steps to transform your content strategy
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto space-y-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isVisible = visibleSteps.includes(index)
            const isEven = index % 2 === 0

            return (
              <div
                key={index}
                className={`relative ${
                  isVisible 
                    ? 'animate-slide-up opacity-100' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-1/2 -bottom-12 w-0.5 h-12 bg-gradient-to-b from-border to-transparent transform -translate-x-1/2" />
                )}

                <div className={`glass-card p-8 rounded-3xl hover:shadow-premium-lg transition-all duration-300 group ${
                  isEven ? 'lg:mr-12' : 'lg:ml-12'
                }`}>
                  <div className="flex flex-col lg:flex-row items-center gap-8">
                    {/* Icon Section */}
                    <div className="flex-shrink-0">
                      {/* Icon Container */}
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 text-center lg:text-left">
                      <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                        <h3 className="text-2xl font-bold text-gradient">
                          {step.title}
                        </h3>
                      </div>
                      
                      <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                        {step.description}
                      </p>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                        {step.features.map((feature, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Step Number Badge */}
                    <div className="hidden lg:block">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl font-bold text-white">{index + 1}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <p className="text-lg text-muted-foreground mb-8">
            Ready to streamline your content workflow?
          </p>
          <Button size="lg" variant="default" className="group">
            Start Creating Content
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}
