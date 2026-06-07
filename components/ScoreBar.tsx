'use client'

import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  score: number
  streak: number
  cardIndex: number
  total?: number
}

export default function ScoreBar({ score, streak, cardIndex, total = 10 }: Props) {
  return (
    <div className="w-[340px] flex items-center justify-between mb-4">
      <div className="text-left">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Score</p>
        <AnimatePresence mode="wait">
          <motion.p
            key={score}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white font-mono"
          >
            {score.toLocaleString()}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="text-center">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Card</p>
        <p className="text-lg font-semibold text-white/60 font-mono">
          {cardIndex + 1}/{total}
        </p>
      </div>

      <div className="text-right">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Streak</p>
        <p
          className="text-2xl font-bold font-mono"
          style={{ color: streak > 0 ? '#f97316' : 'rgba(255,255,255,0.3)' }}
        >
          {streak > 0 ? `${streak}×` : '—'}
        </p>
      </div>
    </div>
  )
}
