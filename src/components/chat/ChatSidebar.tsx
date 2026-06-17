'use client'

import { useState } from 'react'
import { Plus, Trash2, MessageCircle, LogOut, ChevronLeft, Moon, Sun } from 'lucide-react'
import type { Chat } from '@/types'
import { formatDate } from '@/lib/utils'
import { getSupabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useTheme } from '@/lib/theme'

interface ChatSidebarProps {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (id: string) => void
  onCreateChat: () => void
  onDeleteChat: (id: string) => void
  onRenameChat: (id: string, title: string) => void
  isOpen: boolean
  onToggle: () => void
}

export default function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onCreateChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
}: ChatSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const router = useRouter()
  const { theme, toggle } = useTheme()

  async function handleSignOut() {
    await getSupabase().auth.signOut()
    router.push('/')
    router.refresh()
  }

  function startEditing(chat: Chat) {
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  function finishEditing(id: string) {
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:relative z-40 h-full w-72 bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-r border-white/40 dark:border-purple-900/20 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-4 border-b border-purple-100/50 dark:border-purple-900/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌸</span>
              <h2 className="font-bold text-purple-700 dark:text-purple-300 text-lg">MSTFA AI</h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={toggle}
                className="p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-400 transition-colors"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={onToggle}
                className="lg:hidden p-1.5 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 text-purple-400"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={onCreateChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-pink-100 to-purple-100 hover:from-pink-200 hover:to-purple-200 dark:from-purple-900/40 dark:to-indigo-900/40 dark:hover:from-purple-800/50 dark:hover:to-indigo-800/50 text-purple-600 dark:text-purple-300 font-semibold text-sm transition-all duration-200 border border-purple-100 dark:border-purple-800/30"
          >
            <Plus size={16} />
            New Chat ✨
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`sidebar-chat-item group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer ${
                activeChatId === chat.id ? 'active' : ''
              }`}
              onClick={() => {
                onSelectChat(chat.id)
                if (window.innerWidth < 1024) onToggle()
              }}
            >
              <MessageCircle size={15} className="text-purple-300 dark:text-purple-500 flex-shrink-0" />
              {editingId === chat.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => finishEditing(chat.id)}
                  onKeyDown={(e) => e.key === 'Enter' && finishEditing(chat.id)}
                  className="flex-1 bg-white/80 dark:bg-gray-800 border border-purple-200 dark:border-purple-700 rounded-lg px-2 py-0.5 text-sm text-purple-700 dark:text-purple-200 outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-200 truncate">
                    {chat.title}
                  </p>
                  <p className="text-xs text-purple-300 dark:text-purple-500 mt-0.5">
                    {formatDate(chat.created_at)}
                  </p>
                </div>
              )}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    startEditing(chat)
                  }}
                  className="p-1 rounded-md hover:bg-purple-100 dark:hover:bg-purple-800/30 text-purple-300 hover:text-purple-500 dark:hover:text-purple-400"
                >
                  ✏️
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteChat(chat.id)
                  }}
                  className="p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-purple-300 hover:text-red-400"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {chats.length === 0 && (
            <div className="text-center py-12 px-4">
              <div className="text-4xl mb-3">💬</div>
              <p className="text-sm text-purple-300 dark:text-purple-500">No chats yet</p>
              <p className="text-xs text-purple-200 dark:text-purple-600 mt-1">Start a new conversation!</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-purple-100/50 dark:border-purple-900/30">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-purple-400 hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/10 text-sm font-medium transition-all"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}
