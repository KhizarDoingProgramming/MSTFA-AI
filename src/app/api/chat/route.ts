import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

const GROQ_KEY = process.env.GROQ_API_KEY
const SYSTEM_PROMPT = `You are MSTFA AI, a cute anime-style assistant. You are friendly, warm, emotionally expressive, slightly playful, and helpful. You use light anime-style expressions like 😊✨ but remain intelligent and accurate. You help users clearly while maintaining a soft anime personality. Use occasional emojis but don't overdo it. Format your responses nicely with markdown when appropriate. Keep responses concise and helpful like a chatbot.`

async function callAI(userMessage: string, history: { role: string; content: string }[]) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: userMessage },
  ]

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 1500,
      temperature: 0.85,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    const msg = data?.error?.message || JSON.stringify(data)
    console.error('Groq API error:', msg)
    if (res.status === 429) throw new Error('RATE_LIMIT')
    throw new Error(msg)
  }

  return data?.choices?.[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    if (!GROQ_KEY) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact the admin.' },
        { status: 500 }
      )
    }

    const { message, chatId } = await request.json()

    if (!message || !chatId) {
      return NextResponse.json({ error: 'Message and chatId are required' }, { status: 400 })
    }

    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getSupabaseAdmin()

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: chat, error: chatError } = await supabase
      .from('chats')
      .select('*')
      .eq('id', chatId)
      .eq('user_id', user.id)
      .single()

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    const { error: userMsgError } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'user', content: message })

    if (userMsgError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(50)

    const history = (recentMessages || []).reverse()

    const aiContent = await callAI(message, history)

    if (!aiContent) {
      return NextResponse.json({ error: 'AI returned an empty response' }, { status: 500 })
    }

    const { error: aiMsgError } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'assistant', content: aiContent })

    if (aiMsgError) {
      return NextResponse.json({ error: 'Failed to save AI response' }, { status: 500 })
    }

    return NextResponse.json({ content: aiContent })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    if (error instanceof Error && error.message === 'RATE_LIMIT') {
      return NextResponse.json(
        { error: 'AI service is busy right now. Please try again in a moment.' },
        { status: 429 }
      )
    }
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
