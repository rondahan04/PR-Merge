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

function BotIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M8 8V6a4 4 0 018 0v2" />
      <circle cx="9" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.5" fill="currentColor" stroke="none" />
      <line x1="12" y1="2" x2="12" y2="4" />
    </svg>
  )
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
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.3)',
      }}
      onClick={onContinue}
    >
      {/* result banner */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: isCorrect ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)' }}
      >
        <span className="font-bold text-xl tracking-wide" style={{ color: isCorrect ? '#22c55e' : '#ef4444' }}>
          {isCorrect ? '✓ CORRECT' : '✗ WRONG'}
        </span>
        <span className="font-mono font-bold text-white">
          {pointsEarned > 0 ? `+${pointsEarned}` : '0'}
        </span>
      </div>

      {/* verdict */}
      <div className="px-4 py-3 border-b border-white/8">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1 font-medium">Verdict</p>
        <p className="text-sm text-white/90 font-light leading-relaxed">
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
      <div className="px-4 py-3 border-b border-white/8">
        <p className="text-xs text-white/40 uppercase tracking-widest mb-1 font-medium">Why</p>
        <p className="text-sm text-white/75 leading-relaxed font-light">{snippet.explanation}</p>
      </div>

      {/* codebot result */}
      {isCodeBotMode && (
        <div className="px-4 py-3 border-b border-white/8 flex items-center gap-3">
          <span style={{ color: botCorrect ? '#a5b4fc' : 'rgba(255,255,255,0.3)' }}>
            <BotIcon />
          </span>
          <div>
            <p className="text-xs text-white/40 mb-0.5 font-medium uppercase tracking-widest">CodeBot said</p>
            <p className="text-sm font-semibold" style={{ color: botCorrect ? '#22c55e' : '#ef4444' }}>
              {codebotDecision ? '✓ Approve' : '✗ Reject'} — {botCorrect ? 'Correct' : 'Wrong'}
            </p>
          </div>
        </div>
      )}

      <div className="px-4 py-3 text-center">
        <p className="text-xs text-white/25 font-light tracking-wide">tap to continue</p>
      </div>
    </motion.div>
  )
}
