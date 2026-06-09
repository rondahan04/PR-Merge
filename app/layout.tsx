import type { Metadata, Viewport } from 'next'
import AnimatedBackground from '@/components/AnimatedBackground'
import './globals.css'

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
      <body>
        <AnimatedBackground />
        {children}
      </body>
    </html>
  )
}
