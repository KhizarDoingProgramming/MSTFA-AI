'use client'

import { useState } from 'react'

interface AvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-lg',
  lg: 'w-14 h-14 text-2xl',
  xl: 'w-24 h-24 text-5xl',
}

export default function AnimeAvatar({ size = 'md', onClick }: AvatarProps) {
  const [hovered, setHovered] = useState(false)
  const sizeClass = sizes[size]

  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center cursor-pointer transition-all duration-300 shadow-lg border-2 border-white/60 relative overflow-hidden ${hovered ? 'scale-110 shadow-xl' : ''}`}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-purple-300/30 animate-pulse-soft" />
      <span className="relative z-10 drop-shadow-sm">🌸</span>
    </div>
  )
}
