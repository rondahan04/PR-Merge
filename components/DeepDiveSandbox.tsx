'use client'

import { memo, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { tokenizeLines, renderTokens, LANG_LABELS } from '@/lib/prism'
import type { Snippet } from '@/store/gameStore'

interface Props {
  snippet: Snippet
  onSubmit: (line: number) => void
  isJudging: boolean
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 8px 40px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)',
  borderRadius: '16px',
}

function DeepDiveSandbox({ snippet, onSubmit, isJudging }: Props) {
  const [selectedLine, setSelectedLine] = useState<number | null>(null)

  const renderedLines = useMemo(
    () => tokenizeLines(snippet.snippet, snippet.language).map(renderTokens),
    [snippet.snippet, snippet.language]
  )

  return (
    <motion.div
      className="w-full max-w-[420px]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <div style={glassCard}>
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
          <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{LANG_LABELS[snippet.language]}</span>
          <span className="text-xs text-purple-300/60 font-light tracking-wide">tap the buggy line</span>
        </div>

        {/* line-by-line code */}
        <div className="p-3 font-mono" style={{ fontSize: '13px', lineHeight: '1.65' }}>
          {renderedLines.map((lineNodes, idx) => {
            const lineNum = idx + 1
            const isSelected = selectedLine === lineNum
            return (
              <button
                key={lineNum}
                onClick={() => { if (!isJudging) setSelectedLine(lineNum) }}
                className="w-full text-left flex items-start gap-2 rounded-md px-2 py-0.5 transition-colors"
                style={{
                  background: isSelected ? 'rgba(139,92,246,0.22)' : 'transparent',
                  outline: isSelected ? '1px solid rgba(139,92,246,0.45)' : '1px solid transparent',
                  cursor: isJudging ? 'default' : 'pointer',
                }}
              >
                <span
                  className="shrink-0 select-none text-right"
                  style={{ width: '1.5rem', color: isSelected ? 'rgba(196,181,253,0.6)' : 'rgba(255,255,255,0.2)', fontSize: '11px', lineHeight: 'inherit' }}
                >
                  {lineNum}
                </span>
                <span className="flex-1 min-w-0 whitespace-pre-wrap break-words text-white/80">
                  {lineNodes}
                </span>
              </button>
            )
          })}
        </div>

        {/* submit button */}
        <div className="px-4 pb-4 pt-1">
          <motion.button
            whileTap={{ scale: selectedLine && !isJudging ? 0.97 : 1 }}
            onClick={() => { if (selectedLine && !isJudging) onSubmit(selectedLine) }}
            disabled={!selectedLine || isJudging}
            className="w-full py-3 rounded-xl font-semibold tracking-widest uppercase transition-all"
            style={{
              fontSize: '13px',
              background: selectedLine && !isJudging ? 'rgba(139,92,246,0.32)' : 'rgba(255,255,255,0.04)',
              border: '1px solid',
              borderColor: selectedLine && !isJudging ? 'rgba(167,139,250,0.45)' : 'rgba(255,255,255,0.08)',
              color: selectedLine && !isJudging ? '#ddd6fe' : 'rgba(255,255,255,0.22)',
              cursor: selectedLine && !isJudging ? 'pointer' : 'default',
            }}
          >
            {isJudging ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeOpacity="0.25" />
                  <path fill="currentColor" fillOpacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Judging...
              </span>
            ) : selectedLine ? (
              `Submit line ${selectedLine}`
            ) : (
              'Select a line first'
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default memo(DeepDiveSandbox)
