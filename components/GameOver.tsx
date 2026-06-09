'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
  borderRadius: '16px',
  overflow: 'hidden',
}

const glassButton: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
  borderRadius: '16px',
}

export default function GameOver() {
  const router = useRouter()
  const { score, correctCount, history, language, difficulty, isCodeBotMode, leaderboard, addLeaderboardEntry, resetGame, startGame } =
    useGameStore()
  const [name, setName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    addLeaderboardEntry(name.trim())
    setSubmitted(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-[340px] space-y-4"
    >
      {/* score card */}
      <div style={{ ...glassCard, padding: '24px', textAlign: 'center' }}>
        <p className="text-xs text-white/40 uppercase tracking-widest mb-2 font-medium">Final Score</p>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl font-bold text-white font-mono mb-4"
        >
          {score.toLocaleString()}
        </motion.p>
        <div className="flex justify-center gap-8 text-sm text-white/60">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium">Accuracy</p>
            <p className="font-semibold text-white/80">{accuracy}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium">Correct</p>
            <p className="font-semibold text-white/80">{correctCount}/{history.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30 font-medium">Lang</p>
            <p className="font-semibold text-white/80 capitalize">{language}</p>
          </div>
        </div>
      </div>

      {/* leaderboard entry */}
      {!submitted ? (
        <div style={{ ...glassCard, padding: '16px' }}>
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Add to Leaderboard</p>
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                placeholder="Your nickname"
                maxLength={20}
                className="flex-1 rounded-lg px-3 py-2 text-white text-sm outline-none font-light"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
              <button
                type="submit"
                disabled={!name.trim()}
                className="px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-30 cursor-pointer transition-transform hover:scale-[1.05] active:scale-[0.97]"
                style={{ background: '#22c55e', color: '#000' }}
              >
                Add
              </button>
            </div>
          </form>
        </div>
      ) : (
        leaderboard.length > 0 && (
          <div style={{ ...glassCard, padding: '16px' }}>
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">Leaderboard</p>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.timestamp} className="flex items-center gap-3 text-sm">
                  <span className="text-white/30 font-mono w-5 font-light">{i + 1}.</span>
                  <span className="flex-1 text-white/75 truncate font-light">{entry.name}</span>
                  <span className="font-mono font-bold text-white">{entry.score.toLocaleString()}</span>
                  <span className="text-white/40 text-xs font-light">{entry.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <div className="flex gap-2">
        <button
          onClick={() => startGame(language, difficulty, isCodeBotMode)}
          className="flex-1 py-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.97]"
          style={glassButton}
        >
          <span className="block text-center font-semibold text-sm tracking-widest uppercase text-white/80">
            Play Again
          </span>
        </button>
        <button
          onClick={() => { resetGame(); router.push('/') }}
          className="flex-1 py-3 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.97]"
          style={{ ...glassButton, border: '1px solid rgba(124,58,237,0.4)' }}
        >
          <span
            className="block text-center font-semibold text-sm tracking-widest uppercase"
            style={{ color: 'rgba(196,181,253,0.9)' }}
          >
            Home
          </span>
        </button>
      </div>
    </motion.div>
  )
}
