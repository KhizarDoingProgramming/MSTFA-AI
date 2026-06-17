'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase'
import PastelInput from '@/components/ui/PastelInput'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isLogin = mode === 'login'

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })
      if (authError) throw authError
      setOtpSent(true)
      setSuccess('Code sent! Check your email ✨')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send code'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = getSupabase()
      const { error: authError } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })
      if (authError) throw authError
      window.location.replace('/chat')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid code'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="glass-card-strong p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 flex items-center justify-center shadow-lg mb-4 animate-float overflow-hidden">
            <img src="/logo.svg" alt="MSTFA AI" className="w-16 h-16" />
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

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <PastelInput
              label="Email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-2 rounded-xl">
                {success}
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
                  Sending code...
                </span>
              ) : (
                'Send Code 🌸'
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-sm text-purple-500 text-center">
              Code sent to <span className="font-semibold">{email}</span>
            </p>

            <PastelInput
              label="Enter Code"
              type="text"
              placeholder="6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
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
                  Verifying...
                </span>
              ) : (
                'Verify & Login ✨'
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false)
                setOtp('')
                setError('')
                setSuccess('')
              }}
              className="w-full text-sm text-purple-400 hover:text-purple-600 transition-colors"
            >
              ← Use a different email
            </button>
          </form>
        )}

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
