import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import AnimatedBackground from '@/components/AnimatedBackground'
import './globals.css'

const plex = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PR-Merge — Tinder for Code Review',
  description: 'Swipe right to approve, left to reject. Sharpen your code review instincts.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={plex.className}>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  )
}
