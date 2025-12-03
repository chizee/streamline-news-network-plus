'use client'

import { useState, useEffect } from 'react'

export function HyperspeedBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Generate deterministic positions based on index
  const getParticlePosition = (index: number) => {
    const seed = index * 137.508 // Golden angle for better distribution
    return {
      left: `${(seed % 100)}%`,
      top: `${((seed * 1.618) % 100)}%`,
      animationDelay: `${(index % 10) * 0.3}s`,
      animationDuration: `${3 + (index % 3)}s`,
    }
  }

  if (!mounted) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0f1435] to-[#0a0e27]" />
      </div>
    )
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27] via-[#0f1435] to-[#0a0e27] animate-pulse-slow" />
      
      {/* Moving lines effect */}
      <div className="hyperspeed-lines">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="hyperspeed-line"
            style={{
              left: `${(i * 5) + (i % 2 === 0 ? 2 : 0)}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${2 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Particle effect */}
      <div className="hyperspeed-particles">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="hyperspeed-particle"
            style={getParticlePosition(i)}
          />
        ))}
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
    </div>
  )
}
