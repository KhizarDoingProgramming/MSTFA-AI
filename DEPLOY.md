# 🌸 MSTFA AI — Deployment Guide

## Quick Deploy to Vercel

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → Run the contents of `supabase/schema.sql`
3. Copy your project credentials:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Get OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy it → `OPENAI_API_KEY`

### 3. Deploy to Vercel

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   OPENAI_API_KEY=sk-...
   ```
4. Click **Deploy**

### 4. Configure Supabase Auth

In your Supabase dashboard:
1. Go to **Authentication** → **Providers** → **Email**
2. Enable Email provider
3. Set the Site URL to your Vercel domain: `https://your-app.vercel.app`
4. Add Redirect URLs: `https://your-app.vercel.app/auth/callback`

### 5. Local Development

```bash
# Install dependencies
npm install

# Copy env file and fill in your keys
cp .env.example .env.local

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
mstfa-ai/
├── src/
│   ├── app/
│   │   ├── api/chat/route.ts       # OpenAI API endpoint
│   │   ├── auth/callback/route.ts  # Supabase auth callback
│   │   ├── chat/page.tsx           # Main chat interface
│   │   ├── login/page.tsx          # Login page
│   │   ├── signup/page.tsx         # Signup page
│   │   ├── page.tsx                # Landing page
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── auth/AuthForm.tsx       # Auth form component
│   │   ├── chat/ChatSidebar.tsx    # Chat history sidebar
│   │   ├── chat/ChatInput.tsx      # Message input bar
│   │   ├── chat/MessageBubble.tsx  # Chat message bubble
│   │   ├── ui/Sparkles.tsx         # Animated sparkles
│   │   ├── ui/TypingIndicator.tsx  # Bouncing dots loader
│   │   ├── ui/AnimeAvatar.tsx      # Avatar component
│   │   └── ui/PastelInput.tsx      # Styled input component
│   ├── lib/
│   │   ├── supabase.ts             # Client Supabase
│   │   ├── supabase-admin.ts       # Admin Supabase
│   │   ├── supabase-server.ts      # Server Supabase
│   │   └── utils.ts                # Utility functions
│   ├── types/
│   │   ├── index.ts                # App types
│   │   └── database.ts             # Supabase DB types
│   └── middleware.ts               # Route protection
├── supabase/
│   └── schema.sql                  # Database schema
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI API key | platform.openai.com → API Keys |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth
- **AI:** OpenAI GPT-4o-mini
- **Deployment:** Vercel

---

🌸 Built with love — MSTFA AI
