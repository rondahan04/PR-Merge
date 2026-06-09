'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import SwipeCard from '@/components/SwipeCard'
import DeepDiveSandbox from '@/components/DeepDiveSandbox'
import Timer from '@/components/Timer'
import ScoreBar from '@/components/ScoreBar'
import RevealPanel from '@/components/RevealPanel'
import GameOver from '@/components/GameOver'
import type { Snippet, JudgeResult } from '@/store/gameStore'

const TIMER_SECONDS = 15

export default function GamePage() {
  const router = useRouter()
  const {
    phase,
    score,
    streak,
    cardIndex,
    currentSnippet,
    nextSnippet,
    lastAnswer,
    difficulty,
    language,
    codebotDecision,
    isCodeBotMode,
    isFetching,
    setCurrentSnippet,
    setNextSnippet,
    swipe,
    advanceCard,
    setFetching,
    selectSandboxLine,
    submitSandboxAnswer,
    timeout,
  } = useGameStore()

  const [isJudging, setIsJudging] = useState(false)
  const timerSecondsRef = useRef(TIMER_SECONDS)
  const fetchedForCardRef = useRef(-1)

  const fetchSnippet = useCallback(async (): Promise<Snippet | null> => {
    try {
      const res = await fetch('/api/generate-snippet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET ?? '',
        },
        body: JSON.stringify({ language, difficulty }),
      })
      if (!res.ok) throw new Error('API error')
      return res.json()
    } catch {
      return null
    }
  }, [language, difficulty])

  // Initial fetch: card 1 + card 2 in parallel
  useEffect(() => {
    if (phase !== 'playing' || currentSnippet !== null) return

    Promise.all([fetchSnippet(), fetchSnippet()]).then(([first, second]) => {
      if (first) setCurrentSnippet(first)
      if (second) setNextSnippet(second)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  // Prefetch N+2 whenever cardIndex changes and we have a currentSnippet
  useEffect(() => {
    if (phase !== 'playing' || !currentSnippet) return
    if (fetchedForCardRef.current === cardIndex) return
    fetchedForCardRef.current = cardIndex

    fetchSnippet().then((snippet) => {
      setNextSnippet(snippet)
    })
  }, [cardIndex, phase, currentSnippet, fetchSnippet, setNextSnippet])

  // When isFetching and nextSnippet arrives, advance
  useEffect(() => {
    if (isFetching && nextSnippet) {
      setCurrentSnippet(nextSnippet)
      setNextSnippet(null)
      setFetching(false)
    }
  }, [isFetching, nextSnippet, setCurrentSnippet, setNextSnippet, setFetching])

  const handleSwipe = useCallback(
    (approved: boolean) => {
      swipe(approved, timerSecondsRef.current)
    },
    [swipe]
  )

  const handleTimerTick = useCallback((remaining: number) => {
    timerSecondsRef.current = remaining
  }, [])

  const handleTimerExpire = useCallback(() => {
    timeout()
  }, [timeout])

  const handleSandboxSubmit = useCallback(async (line: number) => {
    if (!currentSnippet) return
    selectSandboxLine(line)
    setIsJudging(true)
    try {
      const res = await fetch('/api/judge-line', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': process.env.NEXT_PUBLIC_API_SECRET ?? '',
        },
        body: JSON.stringify({
          snippetId: currentSnippet.id,
          snippet: currentSnippet.snippet,
          language: currentSnippet.language,
          issues: currentSnippet.issues,
          bugLines: currentSnippet.bugLines,
          selectedLine: line,
        }),
      })
      if (!res.ok) throw new Error('API unavailable')
      const result: JudgeResult = await res.json()
      submitSandboxAnswer(result)
    } catch {
      // Fallback: resolve locally from bugLines until /api/judge-line is implemented
      const isCorrect = currentSnippet.bugLines.includes(line)
      submitSandboxAnswer({
        isCorrect,
        feedback: isCorrect
          ? 'Correct — that line contains the bug.'
          : `Not quite. The bug is on line ${currentSnippet.bugLines[0] ?? '?'}.`,
        explanation: currentSnippet.explanation,
      })
    } finally {
      setIsJudging(false)
    }
  }, [currentSnippet, selectSandboxLine, submitSandboxAnswer])

  const handleRevealContinue = useCallback(() => {
    advanceCard()
  }, [advanceCard])

  // Auto-advance revealing phase after 2000ms
  useEffect(() => {
    if (phase !== 'revealing') return
    const t = setTimeout(handleRevealContinue, 2000)
    return () => clearTimeout(t)
  }, [phase, handleRevealContinue])

  useEffect(() => {
    if (phase === 'idle') router.replace('/')
  }, [phase, router])

  if (phase === 'idle') return null

  if (phase === 'gameover') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <GameOver />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <ScoreBar score={score} streak={streak} cardIndex={cardIndex} />

      <div className="flex flex-col items-center gap-6">
        {/* timer */}
        <Timer
          duration={TIMER_SECONDS}
          running={phase === 'playing' && !!currentSnippet && !isFetching}
          onExpire={handleTimerExpire}
          onTick={handleTimerTick}
        />

        {/* card / reveal */}
        <AnimatePresence mode="wait">
          {phase === 'playing' && currentSnippet && !isFetching && (
            <SwipeCard
              key={currentSnippet.id}
              snippet={currentSnippet}
              onSwipe={handleSwipe}
              disabled={false}
            />
          )}

          {phase === 'sandboxing' && currentSnippet && (
            <DeepDiveSandbox
              key={`sandbox-${currentSnippet.id}`}
              snippet={currentSnippet}
              onSubmit={handleSandboxSubmit}
              isJudging={isJudging}
            />
          )}

          {phase === 'playing' && (!currentSnippet || isFetching) && (
            <div
              key="loading"
              className="w-[340px] h-48 rounded-2xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <p className="text-white/30 text-sm font-light tracking-wide">Fetching next card...</p>
            </div>
          )}

          {phase === 'revealing' && currentSnippet && lastAnswer && (
            <RevealPanel
              key={`reveal-${currentSnippet.id}`}
              snippet={currentSnippet}
              isCorrect={lastAnswer.isCorrect}
              pointsEarned={lastAnswer.pointsEarned}
              codebotDecision={codebotDecision}
              isCodeBotMode={isCodeBotMode}
              onContinue={handleRevealContinue}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
