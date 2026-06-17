'use client'

import { useEffect, useState } from 'react'

interface Sparkle {
  id: number
  x: number
  y: number
  size: number
  color: string
  delay: number
  duration: number
}

const COLORS = ['#f8bbd0', '#d1a4e8', '#b3d4fc', '#c8e6c9', '#ffe0b2', '#fff9c4']

function randomBetween(a: number, b: number) {
  return Math.random() * (b - a) + a
}

export default function Sparkles({ count = 20 }: { count?: number }) {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const generated: Sparkle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(0, 100),
      y: randomBetween(0, 100),
      size: randomBetween(4, 10),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: randomBetween(0, 8),
      duration: randomBetween(3, 7),
    }))
    setSparkles(generated)
  }, [count])

  return (
    <div className="sparkle-container">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            backgroundColor: s.color,
            animation: `sparkleFloat ${s.duration}s ease-in-out ${s.delay}s infinite`,
            opacity: 0,
            filter: 'blur(0.5px)',
            boxShadow: `0 0 ${s.size * 2}px ${s.color}`,
          }}
        />
      ))}
    </div>
  )
}
