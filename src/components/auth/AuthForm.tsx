'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import PastelInput from '@/components/ui/PastelInput'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isLogin = mode === 'login'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error: authError } = await getSupabase().auth.signInWithPassword({
          email,
          password,
        })
        if (authError) throw authError
      } else {
        const { error: authError } = await getSupabase().auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
        })
        if (authError) throw authError
      }
      router.push('/chat')
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card-strong p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center shadow-lg mb-4 animate-float">
            <span className="text-4xl">🌸</span>
          </div>
          <h1 className="text-2xl font-bold text-purple-800">
            {isLogin ? 'Welcome Back!' : 'Join MSTFA AI!'}
          </h1>
          <p className="text-purple-400 mt-2 text-sm">
            {isLogin
              ? 'So happy to see you again ✨'
              : 'Create your account and start chatting 🌸'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PastelInput
            label="Email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <PastelInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-pastel w-full py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Please wait...
              </span>
            ) : isLogin ? (
              'Login ✨'
            ) : (
              'Sign Up 🌸'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-purple-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <Link
              href={isLogin ? '/signup' : '/login'}
              className="text-purple-600 font-semibold hover:text-purple-800 transition-colors"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
