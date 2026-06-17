'use client'

import Link from 'next/link'
import AuthForm from '@/components/auth/AuthForm'
import Sparkles from '@/components/ui/Sparkles'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      <Sparkles count={15} />

      <div className="absolute top-20 right-20 w-72 h-72 bg-pink-200/30 dark:bg-pink-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-purple-200/25 dark:bg-purple-900/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <img src="/logo.svg" alt="MSTFA AI" className="w-10 h-10" />
          <span className="font-bold text-2xl text-purple-700 dark:text-purple-300">MSTFA AI</span>
        </Link>

        <AuthForm mode="login" />
      </div>
    </div>
  )
}
