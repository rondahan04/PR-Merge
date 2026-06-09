'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Language, Difficulty, Snippet } from '@/store/gameStore'
import LiquidGlass from 'liquid-glass-react'

const LANGUAGES: { value: Language; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'python', label: 'Python', icon: 'PY' },
  { value: 'sql', label: 'SQL', icon: 'SQL' },
  { value: 'java', label: 'Java', icon: 'JV' },
]

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'junior', label: 'Junior', desc: 'Obvious issues' },
  { value: 'mid', label: 'Mid', desc: 'Moderate subtlety' },
  { value: 'senior', label: 'Senior', desc: 'Nuanced, tricky' },
]

function BotIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M8 8V6a4 4 0 018 0v2" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <line x1="12" y1="2" x2="12" y2="4" />
    </svg>
  )
}

const glassAbsolute = (extraStyle: React.CSSProperties = {}): React.CSSProperties => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  width: '100%',
  ...extraStyle,
})

async function fetchSnippet(language: Language, difficulty: Difficulty): Promise<Snippet | null> {
  try {
    const res = await fetch('/api/generate-snippet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET ?? '',
      },
      body: JSON.stringify({ language, difficulty }),
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default function Home() {
  const router = useRouter()
  const { startGame, setPrefetched } = useGameStore()
  const [language, setLanguage] = useState<Language>('javascript')
  const [difficulty, setDifficulty] = useState<Difficulty>('junior')
  const [codeBotMode, setCodeBotMode] = useState(false)
  const prefetchRef = useRef<{ language: Language; difficulty: Difficulty } | null>(null)

  const prefetch = useCallback((lang: Language, diff: Difficulty) => {
    if (prefetchRef.current?.language === lang && prefetchRef.current?.difficulty === diff) return
    prefetchRef.current = { language: lang, difficulty: diff }
    Promise.all([fetchSnippet(lang, diff), fetchSnippet(lang, diff)]).then(([a, b]) => {
      if (prefetchRef.current?.language === lang && prefetchRef.current?.difficulty === diff) {
        setPrefetched([a, b])
      }
    })
  }, [setPrefetched])

  useEffect(() => {
    prefetch(language, difficulty)
  }, [language, difficulty, prefetch])

  const handleStart = () => {
    startGame(language, difficulty, codeBotMode)
    router.push('/game')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px] space-y-6"
      >
        {/* title */}
        <div className="text-center mb-8">
          <div style={{ filter: 'drop-shadow(0 0 32px rgba(124,58,237,0.5))' }}>
            <h1
              className="text-6xl font-bold tracking-tight mb-3"
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #ede9fe 0%, #c4b5fd 35%, #a78bfa 65%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
              }}
            >
              PR-Merge
            </h1>
          </div>
          <p className="text-white/35 text-xs font-light tracking-wider uppercase whitespace-nowrap">
            Swipe right to approve · left to reject
          </p>
        </div>

        {/* language selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Language</p>
          <div className="grid grid-cols-4 gap-2">
            {LANGUAGES.map(({ value, label, icon }) => (
              <motion.div key={value} whileTap={{ scale: 0.97 }} className="relative" style={{ minHeight: '72px' }}>
                <LiquidGlass
                  cornerRadius={10}
                  onClick={() => setLanguage(value)}
                  padding="12px 6px"
                  className="[&_.glass]:w-full [&_.glass]:flex [&_.glass]:justify-center [&_.glass]:items-center cursor-pointer"
                  style={glassAbsolute()}
                >
                  <div className="text-center w-full">
                    <span
                      className="block text-base font-bold font-mono"
                      style={{ color: language === value ? '#c4b5fd' : 'rgba(255,255,255,0.5)' }}
                    >
                      {icon}
                    </span>
                    <span
                      className="block text-xs mt-0.5 font-light"
                      style={{ color: language === value ? '#c4b5fd' : 'rgba(255,255,255,0.4)' }}
                    >
                      {label}
                    </span>
                  </div>
                </LiquidGlass>
                {language === value && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ borderRadius: '10px', background: 'rgba(139,92,246,0.22)' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* difficulty selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Difficulty</p>
          <div className="space-y-2">
            {DIFFICULTIES.map(({ value, label, desc }) => (
              <motion.div key={value} whileTap={{ scale: 0.97 }} className="relative" style={{ minHeight: '48px' }}>
                <LiquidGlass
                  cornerRadius={10}
                  onClick={() => setDifficulty(value)}
                  padding="10px 14px"
                  className="[&_.glass]:w-full [&_.glass]:flex [&_.glass]:justify-center [&_.glass]:items-center cursor-pointer"
                  style={glassAbsolute()}
                >
                  <div className="flex items-center justify-center gap-2 w-full">
                    <span
                      className="font-semibold text-sm"
                      style={{ color: difficulty === value ? '#c4b5fd' : 'rgba(255,255,255,0.65)' }}
                    >
                      {label}
                    </span>
                    <span className="text-xs text-white/30 font-light">{desc}</span>
                  </div>
                </LiquidGlass>
                {difficulty === value && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ borderRadius: '10px', background: 'rgba(139,92,246,0.22)' }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* codebot toggle */}
        <div className="relative" style={{ minHeight: '64px' }}>
          {codeBotMode && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ borderRadius: '10px', background: 'rgba(139,92,246,0.22)', zIndex: 1 }}
            />
          )}
          <LiquidGlass
            cornerRadius={10}
            onClick={() => setCodeBotMode((v) => !v)}
            padding="10px 14px"
            className="[&_.glass]:w-full [&_.glass]:flex [&_.glass]:justify-center [&_.glass]:items-center cursor-pointer"
            style={glassAbsolute()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-left">
                <span style={{ color: codeBotMode ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                  <BotIcon />
                </span>
                <div>
                  <p className="font-semibold text-sm" style={{ color: codeBotMode ? '#a78bfa' : 'rgba(255,255,255,0.6)' }}>
                    Battle Royale
                  </p>
                  <p className="text-xs text-white/30 mt-0.5 font-light">Battle an AI opponent</p>
                </div>
              </div>
              <div
                className="w-10 h-6 rounded-full relative transition-all"
                style={{ background: codeBotMode ? '#8b5cf6' : 'rgba(255,255,255,0.1)' }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: codeBotMode ? '1.5rem' : '0.25rem' }}
                />
              </div>
            </div>
          </LiquidGlass>
        </div>

        {/* start */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="relative cursor-pointer"
          style={{ minHeight: '56px' }}
        >
          <LiquidGlass
            cornerRadius={14}
            padding="14px"
            className="[&_.glass]:w-full [&_.glass]:flex [&_.glass]:justify-center [&_.glass]:items-center"
            style={glassAbsolute()}
          >
            <span
              className="block text-center font-semibold text-base tracking-widest uppercase"
              style={{ color: '#ddd6fe' }}
            >
              Start Review
            </span>
          </LiquidGlass>
        </motion.div>

        <p className="text-center text-xs text-white/20 font-light tracking-wide">10 cards · 15 seconds each</p>
      </motion.div>
    </div>
  )
}
