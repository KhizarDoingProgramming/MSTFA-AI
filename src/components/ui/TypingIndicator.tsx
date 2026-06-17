'use client'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-3 message-enter">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 dark:from-purple-700 dark:to-indigo-700 flex items-center justify-center flex-shrink-0 shadow-md">
        <span className="text-lg">🌸</span>
      </div>
      <div className="glass-card px-5 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}
