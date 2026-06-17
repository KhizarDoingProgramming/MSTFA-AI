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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeChatIdRef = useRef<string | null>(null)
  const loadingRef = useRef(false)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id)
        loadChats(data.user.id)
      } else {
        router.push('/login')
      }
    })
  }, [router])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  useEffect(() => {
    activeChatIdRef.current = activeChatId
  }, [activeChatId])

  useEffect(() => {
    loadingRef.current = loading
  }, [loading])

  async function loadChats(uid: string) {
    const { data } = await getSupabase()
      .from('chats')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    if (data) setChats(data)
  }

  async function fetchMessages(chatId: string) {
    const { data } = await getSupabase()
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  async function selectChat(chatId: string) {
    setActiveChatId(chatId)
    activeChatIdRef.current = chatId
    await fetchMessages(chatId)
  }

  async function createChat(): Promise<string | null> {
    if (!userId) return null
    const { data, error } = await getSupabase()
      .from('chats')
      .insert({ user_id: userId, title: 'New Chat ✨' })
      .select()
      .single()

    if (data && !error) {
      setChats((prev) => [data, ...prev])
      return data.id
    }
    return null
  }

  async function deleteChat(chatId: string) {
    await getSupabase().from('chats').delete().eq('id', chatId)
    setChats((prev) => prev.filter((c) => c.id !== chatId))
    if (activeChatId === chatId) {
      const remaining = chats.filter((c) => c.id !== chatId)
      if (remaining.length > 0) {
        selectChat(remaining[0].id)
      } else {
        setActiveChatId(null)
        setMessages([])
      }
    }
  }

  async function renameChat(chatId: string, title: string) {
    await getSupabase().from('chats').update({ title }).eq('id', chatId)
    setChats((prev) => prev.map((c) => (c.id === chatId ? { ...c, title } : c)))
  }

  async function sendMessage(content: string) {
    if (loadingRef.current) return
    setLoading(true)

    let currentChatId = activeChatIdRef.current
    const isNewChat = !currentChatId

    if (isNewChat) {
      currentChatId = await createChat()
      if (!currentChatId) {
        setLoading(false)
        return
      }
      setActiveChatId(currentChatId)
      activeChatIdRef.current = currentChatId
      setMessages([])
    }

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      chat_id: currentChatId!,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMsg])

    if (isNewChat) {
      const title = generateChatTitle(content)
      renameChat(currentChatId!, title)
      setChats((prev) =>
        prev.map((c) => (c.id === currentChatId ? { ...c, title } : c))
      )
    }

    try {
      const { data: sessionData } = await getSupabase().auth.getSession()
      const token = sessionData?.session?.access_token

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: content, chatId: currentChatId }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to get response')

      setMessages((prev) => [
        ...prev.filter((m) => !m.id.startsWith('temp-')),
        { ...tempUserMsg, id: `user-${Date.now()}` },
        {
          id: `ai-${Date.now()}`,
          chat_id: currentChatId!,
          role: 'assistant',
          content: data.content,
          created_at: new Date().toISOString(),
        },
      ])
    } catch (error) {
      console.error('Send error:', error)
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex relative overflow-hidden bg-gradient-to-br from-pink-50/50 via-purple-50/50 to-blue-50/50">
      <Sparkles count={10} />

      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={selectChat}
        onCreateChat={createChat}
        onDeleteChat={deleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 flex items-center gap-3 px-4 bg-white/60 backdrop-blur-xl border-b border-purple-100/50 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-xl hover:bg-purple-50 text-purple-400 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="MSTFA AI" className="w-7 h-7" />
            <h1 className="font-bold text-purple-700">MSTFA AI</h1>
          </div>
          {activeChatId && (
            <span className="text-xs text-purple-300 ml-2 hidden sm:inline">
              {chats.find((c) => c.id === activeChatId)?.title}
            </span>
          )}
        </header>

        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="text-6xl mb-4 animate-float">🌸</div>
              <h2 className="text-xl font-bold text-purple-600 mb-2">
                Start a conversation!
              </h2>
              <p className="text-sm text-purple-300 max-w-sm">
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

          <div ref={messagesEndRef} />
        </div>

        <ChatInput onSend={sendMessage} disabled={loading} />
      </div>
    </div>
  )
}
