'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Menu } from 'lucide-react'
import { getSupabase } from '@/lib/supabase'
import type { Chat, Message } from '@/types'
import { generateChatTitle } from '@/lib/utils'
import ChatSidebar from '@/components/chat/ChatSidebar'
import MessageBubble from '@/components/chat/MessageBubble'
import ChatInput from '@/components/chat/ChatInput'
import TypingIndicator from '@/components/ui/TypingIndicator'
import Sparkles from '@/components/ui/Sparkles'

export default function ChatPage() {
  const router = useRouter()
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth >= 1024
    return false
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data } = await getSupabase().auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      setUserId(data.user.id)

      const { data: existingChats } = await getSupabase()
        .from('chats')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

      if (existingChats) setChats(existingChats)
    }
    init()
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  async function selectChat(chatId: string) {
    setError(null)
    setActiveChatId(chatId)
    setLoading(false)

    const { data } = await getSupabase()
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  async function createNewChat(): Promise<string | null> {
    if (!userId) return null
    const { data, error: err } = await getSupabase()
      .from('chats')
      .insert({ user_id: userId, title: 'New Chat ✨' })
      .select()
      .single()

    if (data && !err) {
      setChats((prev) => [data, ...prev])
      return data.id
    }
    return null
  }

  async function deleteChat(chatId: string) {
    await getSupabase().from('chats').delete().eq('id', chatId)
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeChatId === chatId) {
      setActiveChatId(null)
      setMessages([])
    }
  }

  async function renameChat(chatId: string, title: string) {
    await getSupabase().from('chats').update({ title }).eq('id', chatId)
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)))
  }

  async function sendMessage(content: string) {
    if (loading) return

    setError(null)
    setLoading(true)

    let chatId = activeChatId
    const isNewChat = !chatId

    try {
      if (isNewChat) {
        chatId = await createNewChat()
        if (!chatId) {
          setError('Failed to create chat. Please try again.')
          setLoading(false)
          return
        }
        setActiveChatId(chatId)
        setMessages([])
      }

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        chat_id: chatId!,
        role: 'user',
        content,
        created_at: new Date().toISOString(),
      }
      setMessages([userMsg])

      if (isNewChat) {
        const title = generateChatTitle(content)
        renameChat(chatId!, title)
        setChats((prev) =>
          prev.map((c) => (c.id === chatId ? { ...c, title } : c))
        )
      }

      const { data: sessionData } = await getSupabase().auth.getSession()
      const token = sessionData?.session?.access_token

      if (!token) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content, chatId: chatId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || `Server error (${res.status})`)
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        chat_id: chatId!,
        role: 'assistant',
        content: data.content,
        created_at: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, aiMsg])
    } catch (err) {
      console.error('Chat error:', err)
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex relative overflow-hidden bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-blue-50/50 dark:from-gray-900 dark:via-purple-950/30 dark:to-gray-900">
      <Sparkles count={10} />

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onCreateChat={async () => {
          const id = await createNewChat()
          if (id) selectChat(id)
        }}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 flex items-center gap-3 px-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-purple-100/50 dark:border-purple-900/30 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-400 transition-colors"
          >
            <Menu size={20} />
          </button>
          <button
            onClick={() => window.location.href = '/chat'}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/logo.svg" alt="MSTFA AI" className="w-7 h-7" />
            <h1 className="font-bold text-purple-700 dark:text-purple-300">MSTFA AI</h1>
          </button>
          {activeChatId && (
            <span className="text-xs text-purple-300 dark:text-purple-500 ml-2 hidden sm:inline">
              {chats.find((c) => c.id === activeChatId)?.title}
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-6xl mb-4 animate-float">🌸</div>
              <h2 className="text-xl font-bold text-purple-600 dark:text-purple-300 mb-2">
                Start a conversation!
              </h2>
              <p className="text-sm text-purple-300 dark:text-purple-500 max-w-sm">
                Say hi to MSTFA AI and begin chatting. Your conversations are saved
                automatically! ✨
              </p>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-1">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {loading && <TypingIndicator />}
          </div>

          {error && (
            <div className="max-w-4xl mx-auto px-4 mt-2">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  )
}
