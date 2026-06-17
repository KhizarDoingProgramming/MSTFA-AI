import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '🌸 MSTFA AI — Your Cute Anime Assistant',
  description: 'A friendly anime-style AI chatbot assistant. Chat with MSTFA AI for help, fun conversations, and cute interactions! ✨',
  keywords: ['AI chatbot', 'anime assistant', 'AI companion', 'MSTFA AI', 'chat AI'],
  icons: {
    icon: '/favicon.svg',
  },
  openGraph: {
    title: '🌸 MSTFA AI',
    description: 'Your cute anime-style AI assistant',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-quicksand antialiased">
        {children}
      </body>
    </html>
  )
}
