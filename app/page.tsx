'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import type { Language, Difficulty } from '@/store/gameStore'

const LANGUAGES: { value: Language; label: string; icon: string }[] = [
  { value: 'javascript', label: 'JavaScript', icon: 'JS' },
  { value: 'python', label: 'Python', icon: 'PY' },
  { value: 'sql', label: 'SQL', icon: 'SQL' },
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

export default function Home() {
  const router = useRouter()
  const { startGame } = useGameStore()
  const [language, setLanguage] = useState<Language>('javascript')
  const [difficulty, setDifficulty] = useState<Difficulty>('junior')
  const [codeBotMode, setCodeBotMode] = useState(false)

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
          <div style={{ filter: 'drop-shadow(0 0 32px rgba(99,102,241,0.45))' }}>
            <h1
              className="text-6xl font-bold tracking-tight mb-3"
              style={{
                background: 'linear-gradient(135deg, #e0e7ff 0%, #a5b4fc 35%, #c4b5fd 65%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: 1.1,
              }}
            >
              PR-Merge
            </h1>
          </div>
          <p className="text-white/35 text-sm font-light tracking-widest uppercase">
            Swipe right to approve · left to reject
          </p>
        </div>

        {/* language selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Language</p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                className="py-3 rounded-xl font-semibold text-sm transition-all cursor-pointer hover:scale-[1.04]"
                style={{
                  background: language === value ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${language === value ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.08)'}`,
                  color: language === value ? '#a5b4fc' : 'rgba(255,255,255,0.5)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span className="block text-base font-bold font-mono">{icon}</span>
                <span className="block text-xs mt-0.5 font-light">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* difficulty selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Difficulty</p>
          <div className="space-y-2">
            {DIFFICULTIES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer hover:scale-[1.02]"
                style={{
                  background: difficulty === value ? 'rgba(99,102,241,0.14)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${difficulty === value ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.07)'}`,
                  backdropFilter: 'blur(12px)',
                }}
              >
                <span
                  className="font-semibold text-sm"
                  style={{ color: difficulty === value ? '#a5b4fc' : 'rgba(255,255,255,0.65)' }}
                >
                  {label}
                </span>
                <span className="text-xs text-white/30 font-light">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* codebot toggle */}
        <div>
          <button
            onClick={() => setCodeBotMode((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer"
            style={{
              background: codeBotMode ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${codeBotMode ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.07)'}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-2.5 text-left">
              <span style={{ color: codeBotMode ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}>
                <BotIcon />
              </span>
              <div>
                <p
                  className="font-semibold text-sm"
                  style={{ color: codeBotMode ? '#a78bfa' : 'rgba(255,255,255,0.6)' }}
                >
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
          </button>
        </div>

        {/* start */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-semibold text-base tracking-widest uppercase cursor-pointer"
          style={{
            background: 'rgba(99,102,241,0.12)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(99,102,241,0.4)',
            color: '#c7d2fe',
            boxShadow: '0 0 24px rgba(99,102,241,0.15)',
          }}
        >
          Start Review
        </motion.button>

        <p className="text-center text-xs text-white/20 font-light tracking-wide">10 cards · 15 seconds each</p>
      </motion.div>
    </div>
  )
}
