export interface User {
  id: string
  email: string
  created_at: string
}

export interface Chat {
  id: string
  user_id: string
  title: string
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatWithMessages extends Chat {
  messages: Message[]
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
