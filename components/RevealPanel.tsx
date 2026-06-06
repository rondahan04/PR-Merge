'use client'

import { motion } from 'framer-motion'
import type { Snippet } from '@/store/gameStore'

interface Props {
  snippet: Snippet
  isCorrect: boolean
  pointsEarned: number
  codebotDecision: boolean | null
  isCodeBotMode: boolean
  onContinue: () => void
}

export default function RevealPanel({
  snippet,
  isCorrect,
  pointsEarned,
  codebotDecision,
  isCodeBotMode,
  onContinue,
}: Props) {
  const botCorrect = codebotDecision === snippet.is_good

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-[340px] rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
      onClick={onContinue}
    >
      {/* result banner */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: isCorrect ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)' }}
      >
        <span className="font-black text-xl" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
          {isCorrect ? '✓ CORRECT' : '✗ WRONG'}
        </span>
        <span className="font-mono font-bold text-white">
          {pointsEarned > 0 ? `+${pointsEarned}` : '0'}
        </span>
      </div>

      {/* verdict */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Verdict</p>
        <p className="text-sm text-white/90">
          This snippet was{' '}
          <span style={{ color: snippet.is_good ? '#22c55e' : '#ef4444' }} className="font-semibold">
            {snippet.is_good ? 'clean' : 'bad'}
          </span>
          {!snippet.is_good && snippet.issues.length > 0 && (
            <> — {snippet.issues[0]}</>
          )}
        </p>
      </div>

      {/* explanation */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Why</p>
        <p className="text-sm text-white/80 leading-relaxed">{snippet.explanation}</p>
      </div>

      {/* codebot result */}
      {isCodeBotMode && (
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
          <div className="text-2xl">🤖</div>
          <div>
            <p className="text-xs text-white/50 mb-0.5">CodeBot said</p>
            <p className="text-sm font-semibold" style={{ color: botCorrect ? '#22c55e' : '#ef4444' }}>
              {codebotDecision ? '✓ Approve' : '✗ Reject'} — {botCorrect ? 'Correct' : 'Wrong'}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 text-center">
        <p className="text-xs text-white/30">tap to continue</p>
      </div>
    </motion.div>
  )
}
