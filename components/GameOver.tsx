'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'

export default function GameOver() {
  const { score, correctCount, history, language, leaderboard, addLeaderboardEntry, resetGame } =
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
      <div
        className="rounded-2xl p-6 text-center"
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Final Score</p>
        <motion.p
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="text-6xl font-black text-white font-mono mb-4"
        >
          {score.toLocaleString()}
        </motion.p>
        <div className="flex justify-center gap-8 text-sm text-white/60">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30">Accuracy</p>
            <p className="font-bold text-white/80">{accuracy}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30">Correct</p>
            <p className="font-bold text-white/80">{correctCount}/{history.length}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-white/30">Lang</p>
            <p className="font-bold text-white/80 capitalize">{language}</p>
          </div>
        </div>
      </div>

      {/* leaderboard entry */}
      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-4"
          style={{
            background: 'rgba(255,255,255,0.06)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Add to Leaderboard</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 20))}
              placeholder="Your nickname"
              maxLength={20}
              className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none border border-white/10 focus:border-green-400/50"
            />
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg font-bold text-sm disabled:opacity-30"
              style={{ background: '#22c55e', color: '#000' }}
            >
              Add
            </button>
          </div>
        </form>
      ) : (
        leaderboard.length > 0 && (
          <div
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Leaderboard</p>
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.timestamp} className="flex items-center gap-3 text-sm">
                  <span className="text-white/30 font-mono w-5">{i + 1}.</span>
                  <span className="flex-1 text-white/80 truncate">{entry.name}</span>
                  <span className="font-mono font-bold text-white">{entry.score.toLocaleString()}</span>
                  <span className="text-white/40 text-xs">{entry.accuracy}%</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      <button
        onClick={resetGame}
        className="w-full py-3 rounded-2xl font-black text-sm tracking-widest uppercase"
        style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
      >
        Play Again
      </button>
    </motion.div>
  )
}
