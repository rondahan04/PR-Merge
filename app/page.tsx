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
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: '#0d0d0d' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[340px] space-y-6"
      >
        {/* title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tight text-white mb-2">
            PR-Merge
          </h1>
          <p className="text-white/40 text-sm">
            Swipe right to approve · left to reject
          </p>
        </div>

        {/* language selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Language</p>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setLanguage(value)}
                className="py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: language === value ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${language === value ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                  color: language === value ? '#22c55e' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span className="block text-lg font-black">{icon}</span>
                <span className="block text-xs mt-0.5">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* difficulty selector */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Difficulty</p>
          <div className="space-y-2">
            {DIFFICULTIES.map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => setDifficulty(value)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
                style={{
                  background: difficulty === value ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${difficulty === value ? '#22c55e' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                <span
                  className="font-bold text-sm"
                  style={{ color: difficulty === value ? '#22c55e' : 'rgba(255,255,255,0.7)' }}
                >
                  {label}
                </span>
                <span className="text-xs text-white/30">{desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* codebot toggle */}
        <div>
          <button
            onClick={() => setCodeBotMode((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all"
            style={{
              background: codeBotMode ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${codeBotMode ? '#8b5cf6' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <div className="text-left">
              <p
                className="font-bold text-sm"
                style={{ color: codeBotMode ? '#a78bfa' : 'rgba(255,255,255,0.6)' }}
              >
                🤖 vs CodeBot
              </p>
              <p className="text-xs text-white/30 mt-0.5">Battle an AI opponent</p>
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
          whileTap={{ scale: 0.97 }}
          onClick={handleStart}
          className="w-full py-4 rounded-2xl font-black text-lg tracking-wide"
          style={{ background: '#22c55e', color: '#000' }}
        >
          Start Review
        </motion.button>

        <p className="text-center text-xs text-white/20">10 cards · 15 seconds each</p>
      </motion.div>
    </div>
  )
}
