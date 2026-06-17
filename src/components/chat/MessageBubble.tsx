'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Message } from '@/types'

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div
      className={`flex items-end gap-3 px-4 py-2 message-enter ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      {!isUser && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-purple-700 dark:to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md border border-white/60 dark:border-purple-600/40">
          <span className="text-lg">🌸</span>
        </div>
      )}

      <div
        className={`max-w-[75%] lg:max-w-[65%] ${
          isUser
            ? 'bg-gradient-to-r from-pink-200 via-purple-200 to-blue-200 dark:from-purple-700 dark:via-indigo-700 dark:to-purple-600 text-purple-800 dark:text-purple-100 rounded-2xl rounded-br-sm px-4 py-3 shadow-md border border-white/40 dark:border-purple-500/20'
            : 'glass-card text-purple-700 dark:text-purple-100 rounded-2xl rounded-bl-sm px-4 py-3'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
