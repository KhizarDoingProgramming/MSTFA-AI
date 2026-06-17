'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import Sparkles from '@/components/ui/Sparkles'
import { useTheme } from '@/lib/theme'
import { Moon, Sun } from 'lucide-react'

export default function LandingPage() {
  const [user, setUser] = useState<unknown>(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    setMounted(true)
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) setUser(data.user)
    })
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Sparkles count={30} />

      <div className="absolute top-20 left-10 w-72 h-72 bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-96 h-96 bg-purple-200/25 dark:bg-purple-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-blue-200/25 dark:bg-blue-900/10 rounded-full blur-3xl" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="MSTFA AI" className="w-8 h-8" />
          <span className="font-bold text-xl text-purple-700 dark:text-purple-300">MSTFA AI</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-400 transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {user ? (
            <button
              onClick={() => router.push('/chat')}
              className="btn-pastel text-sm"
            >
              Open Chat
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-pastel-outline text-sm px-5 py-2"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-pastel text-sm px-5 py-2"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
        <div
          className={`transition-all duration-1000 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 dark:from-purple-700 dark:via-indigo-600 dark:to-purple-500 flex items-center justify-center shadow-2xl border-4 border-white/60 dark:border-purple-500/30 animate-float">
            <span className="text-6xl">🌸</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 dark:from-pink-300 dark:via-purple-300 dark:to-blue-300 bg-clip-text text-transparent mb-4 leading-tight">
            MSTFA AI
          </h1>

          <p className="text-lg md:text-xl text-purple-400/80 dark:text-purple-300/70 max-w-lg mx-auto mb-3 font-medium">
            Your cute anime-style AI assistant
          </p>
          <p className="text-sm text-purple-300/70 dark:text-purple-500/60 max-w-md mx-auto mb-10">
            Friendly, warm, and always ready to help. Chat with MSTFA AI for conversations
            filled with personality and care
          </p>

          <button
            onClick={() => router.push(user ? '/chat' : '/signup')}
            className="btn-pastel text-base px-10 py-4 shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            <span className="flex items-center gap-2">
              Start Chatting
              <span className="group-hover:translate-x-1 transition-transform">✨</span>
            </span>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-12">
            {[
              { emoji: '💬', text: 'Persistent Chats' },
              { emoji: '🧠', text: 'Made by MUSTAFA' },
              { emoji: '🔒', text: 'Secure & Private' },
              { emoji: '🌸', text: 'Anime Personality' },
              { emoji: '📱', text: 'Mobile Friendly' },
            ].map((feature) => (
              <span
                key={feature.text}
                className="glass-card px-4 py-2 text-sm text-purple-600 dark:text-purple-300 font-medium flex items-center gap-2"
              >
                <span>{feature.emoji}</span>
                {feature.text}
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 text-center py-6 text-xs text-purple-300/60 dark:text-purple-600/40">
        MSTFA AI — Made with love
      </footer>
    </div>
  )
}
