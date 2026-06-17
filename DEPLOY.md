# MSTFA AI — Deployment Guide

## Quick Deploy to Vercel

### 1. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. Go to **SQL Editor** → Run the contents of `supabase/schema.sql`
3. Copy your project credentials:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Get Gemini API Key (FREE)

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click **Create API Key**
3. Copy it → `GEMINI_API_KEY`
4. Free tier: 15 requests/min, 1M tokens/day

### 3. Deploy to Vercel

1. Push this project to GitHub
2. Go to [vercel.com](https://vercel.com) → Import your GitHub repo
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   GEMINI_API_KEY=AIza...
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

## Environment Variables

| Variable | Description | Where to get |
|----------|-------------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | Google Gemini API key (free) | aistudio.google.com/apikey |

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL + RLS)
- **Auth:** Supabase Auth
- **AI:** Google Gemini 1.5 Flash (free tier)
- **Deployment:** Vercel

---

Built with love — MSTFA AI
