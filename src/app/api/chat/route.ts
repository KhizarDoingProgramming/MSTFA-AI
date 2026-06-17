import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'
import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })

const SYSTEM_PROMPT = `You are MSTFA AI, a cute anime-style assistant. You are friendly, warm, emotionally expressive, slightly playful, and helpful. You use light anime-style expressions like 😊✨ but remain intelligent and accurate. You help users clearly while maintaining a soft anime personality. Use occasional emojis but don't overdo it. Format your responses nicely with markdown when appropriate. Keep responses concise and helpful like a chatbot.`

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

    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: false })
      .limit(50)

    const history = (recentMessages || []).reverse()

    const contents = [
      ...history.map((m) => ({
        role: m.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: [{ text: m.content }],
      })),
    ]

    const result = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents,
      config: {
        systemInstruction: SYSTEM_PROMPT,
      },
    })

    const aiContent = result.text || 'Hmm, I could not think of a response 😅'

    const { error: aiMsgError } = await supabase
      .from('messages')
      .insert({ chat_id: chatId, role: 'assistant', content: aiContent })

    if (aiMsgError) {
      return NextResponse.json({ error: 'Failed to save AI response' }, { status: 500 })
    }

    return NextResponse.json({ content: aiContent })
  } catch (error: unknown) {
    console.error('Chat API error:', error)
    const raw = error instanceof Error ? error.message : String(error)

    if (raw.includes('RESOURCE_EXHAUSTED') || raw.includes('429')) {
      return NextResponse.json(
        { error: 'AI service is busy right now. Please try again in a moment.' },
        { status: 429 }
      )
    }
    if (raw.includes('API key')) {
      return NextResponse.json(
        { error: 'AI service is not configured. Please contact the admin.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
