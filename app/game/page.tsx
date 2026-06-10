'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { useGameStore } from '@/store/gameStore'
import { withRetry } from '@/lib/retry'
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
    sandboxJudgeResult,
    setCurrentSnippet,
    setNextSnippet,
    swipe,
    advanceCard,
    setFetching,
    selectSandboxLine,
    submitSandboxAnswer,
    timeout,
  } = useGameStore(
    useShallow((s) => ({
      phase: s.phase,
      score: s.score,
      streak: s.streak,
      cardIndex: s.cardIndex,
      currentSnippet: s.currentSnippet,
      nextSnippet: s.nextSnippet,
      lastAnswer: s.lastAnswer,
      difficulty: s.difficulty,
      language: s.language,
      codebotDecision: s.codebotDecision,
      isCodeBotMode: s.isCodeBotMode,
      isFetching: s.isFetching,
      sandboxJudgeResult: s.sandboxJudgeResult,
      setCurrentSnippet: s.setCurrentSnippet,
      setNextSnippet: s.setNextSnippet,
      swipe: s.swipe,
      advanceCard: s.advanceCard,
      setFetching: s.setFetching,
      selectSandboxLine: s.selectSandboxLine,
      submitSandboxAnswer: s.submitSandboxAnswer,
      timeout: s.timeout,
    }))
  )

  const [isJudging, setIsJudging] = useState(false)
  const [fetchFailed, setFetchFailed] = useState(false)
  const [retryNonce, setRetryNonce] = useState(0)
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

  // Initial fetch: card 1 + card 2 in parallel, with bounded retry + backoff.
  // If everything fails (rate limit, network down), surface the retry button
  // instead of hanging on the loading card forever.
  useEffect(() => {
    if (phase !== 'playing' || currentSnippet !== null) return
    let cancelled = false

    Promise.all([withRetry(fetchSnippet), withRetry(fetchSnippet)]).then(([first, second]) => {
      if (cancelled) return
      const got = [first, second].filter((s): s is Snippet => s !== null)
      if (got[0]) setCurrentSnippet(got[0])
      if (got[1]) setNextSnippet(got[1])
      if (got.length === 0) setFetchFailed(true)
    })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, retryNonce])

  // Prefetch N+2 whenever cardIndex changes and we have a currentSnippet
  useEffect(() => {
    if (phase !== 'playing' || !currentSnippet) return
    if (fetchedForCardRef.current === cardIndex) return
    fetchedForCardRef.current = cardIndex

    withRetry(fetchSnippet).then((snippet) => {
      setNextSnippet(snippet)
      // If the player is already waiting on this fetch (advanceCard found no
      // prefetched card), a null result would strand them — show retry UI.
      if (!snippet && useGameStore.getState().isFetching) setFetchFailed(true)
    })
  }, [cardIndex, phase, currentSnippet, fetchSnippet, setNextSnippet, retryNonce])

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

  const handleRetryFetch = useCallback(() => {
    setFetchFailed(false)
    fetchedForCardRef.current = -1
    setRetryNonce((n) => n + 1)
  }, [])

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
              {fetchFailed ? (
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <p className="text-white/40 text-sm font-light tracking-wide">
                    Couldn&apos;t load the next card.
                  </p>
                  <button
                    onClick={handleRetryFetch}
                    className="px-5 py-2 rounded-lg text-sm font-semibold tracking-widest uppercase cursor-pointer"
                    style={{
                      background: 'rgba(139,92,246,0.32)',
                      border: '1px solid rgba(167,139,250,0.45)',
                      color: '#ddd6fe',
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <p className="text-white/30 text-sm font-light tracking-wide">Fetching next card...</p>
              )}
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
              sandboxJudgeResult={sandboxJudgeResult}
              onContinue={handleRevealContinue}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
