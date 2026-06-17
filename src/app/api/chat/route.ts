import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are MSTFA AI, a cute anime-style assistant. You are friendly, warm, emotionally expressive, slightly playful, and helpful. You use light anime-style expressions like 😊✨ but remain intelligent and accurate. You help users clearly while maintaining a soft anime personality. Use occasional emojis but don't overdo it. Format your responses nicely with markdown when appropriate.`

export async function POST(request: NextRequest) {
  try {
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

    const { data: history } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(50)

    const messages = [
      { role: 'system' as const, content: SYSTEM_PROMPT },
      ...(history || []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      max_tokens: 1500,
      temperature: 0.85,
    })

    const aiContent = completion.choices[0]?.message?.content || 'Hmm, I could not think of a response 😅'

    const { error: aiMsgError } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'assistant', content: aiContent })

    if (aiMsgError) {
      return NextResponse.json({ error: 'Failed to save AI response' }, { status: 500 })
    }

    return NextResponse.json({ content: aiContent })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
