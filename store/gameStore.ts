import { create } from 'zustand'
import { calculateScore } from '@/lib/scoring'
import { computeCodeBotDecision } from '@/lib/codebot'

export interface JudgeResult {
  isCorrect: boolean
  feedback: string
  explanation: string
}

export interface Snippet {
  id: string
  snippet: string
  language: 'javascript' | 'python' | 'sql' | 'java'
  is_good: boolean
  bugLines: number[]
  issues: string[]
  explanation: string
  recycled?: boolean
}

export interface LeaderboardEntry {
  name: string
  score: number
  accuracy: number
  language: 'javascript' | 'python' | 'sql' | 'java'
  timestamp: number
}

export type Difficulty = 'junior' | 'mid' | 'senior'
export type Language = 'javascript' | 'python' | 'sql' | 'java'
export type Phase = 'idle' | 'playing' | 'sandboxing' | 'revealing' | 'gameover'

interface GameState {
  score: number
  streak: number
  cardIndex: number
  correctCount: number
  history: Array<{ snippetId: string; isCorrect: boolean; timeUsed: number }>
  currentSnippet: Snippet | null
  nextSnippet: Snippet | null
  difficulty: Difficulty
  language: Language
  phase: Phase
  codebotDecision: boolean | null
  lastAnswer: { isCorrect: boolean; pointsEarned: number } | null
  leaderboard: LeaderboardEntry[]
  isFetching: boolean
  isCodeBotMode: boolean
  sandboxSelectedLine: number | null
  sandboxJudgeResult: JudgeResult | null
  sandboxSecondsRemaining: number
}

interface GameActions {
  startGame: (language: Language, difficulty: Difficulty, codeBotMode: boolean) => void
  setCurrentSnippet: (snippet: Snippet) => void
  setNextSnippet: (snippet: Snippet | null) => void
  setPrefetched: (snippets: [Snippet | null, Snippet | null]) => void
  swipe: (approved: boolean, secondsRemaining: number) => void
  advanceCard: () => void
  addLeaderboardEntry: (name: string) => void
  setFetching: (v: boolean) => void
  resetGame: () => void
  selectSandboxLine: (line: number) => void
  submitSandboxAnswer: (judgeResult: JudgeResult) => void
  timeout: () => void
}

const CARDS_PER_ROUND = 10
const DIFFICULTY_WINDOW = 5

const initial: GameState = {
  score: 0,
  streak: 0,
  cardIndex: 0,
  correctCount: 0,
  history: [],
  currentSnippet: null,
  nextSnippet: null,
  difficulty: 'junior',
  language: 'javascript',
  phase: 'idle',
  codebotDecision: null,
  lastAnswer: null,
  leaderboard: [],
  isFetching: false,
  isCodeBotMode: false,
  sandboxSelectedLine: null,
  sandboxJudgeResult: null,
  sandboxSecondsRemaining: 0,
}

function adjustDifficulty(
  difficulty: Difficulty,
  history: Array<{ isCorrect: boolean }>,
  newCardIndex: number,
): Difficulty {
  if (newCardIndex % DIFFICULTY_WINDOW !== 0) return difficulty
  const windowCorrect = history.slice(-DIFFICULTY_WINDOW).filter((h) => h.isCorrect).length
  const accuracy = windowCorrect / DIFFICULTY_WINDOW
  if (accuracy > 0.8 && difficulty !== 'senior') return difficulty === 'junior' ? 'mid' : 'senior'
  if (accuracy < 0.4 && difficulty !== 'junior') return difficulty === 'senior' ? 'mid' : 'junior'
  return difficulty
}

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...initial,

  startGame(language, difficulty, codeBotMode) {
    const { currentSnippet, nextSnippet } = get()
    const matchingCurrent = currentSnippet?.language === language ? currentSnippet : null
    const matchingNext = nextSnippet?.language === language ? nextSnippet : null
    set({
      ...initial,
      language,
      difficulty,
      phase: 'playing',
      isCodeBotMode: codeBotMode,
      currentSnippet: matchingCurrent,
      nextSnippet: matchingNext,
    })
  },

  setPrefetched([first, second]) {
    set({
      currentSnippet: first,
      nextSnippet: second,
    })
  },

  setCurrentSnippet(snippet) {
    set({
      currentSnippet: snippet,
      codebotDecision: computeCodeBotDecision(snippet.snippet),
    })
  },

  setNextSnippet(snippet) {
    set({ nextSnippet: snippet })
  },

  swipe(approved: boolean, secondsRemaining: number) {
    const { currentSnippet, phase } = get()
    if (!currentSnippet || phase !== 'playing') return

    // Left swipe on buggy code → enter Deconstruction Sandbox
    if (!approved && !currentSnippet.is_good) {
      set({
        phase: 'sandboxing',
        sandboxSecondsRemaining: secondsRemaining,
        sandboxSelectedLine: null,
        sandboxJudgeResult: null,
      })
      return
    }

    const { score, streak, history, cardIndex, correctCount, difficulty } = get()
    const isCorrect = approved === currentSnippet.is_good
    const { points, newStreak } = calculateScore(isCorrect, secondsRemaining, streak)
    const newCardIndex = cardIndex + 1
    const newCorrectCount = correctCount + (isCorrect ? 1 : 0)
    const newHistory = [
      ...history,
      { snippetId: currentSnippet.id, isCorrect, timeUsed: 15 - secondsRemaining },
    ]

    set({
      score: score + points,
      streak: newStreak,
      history: newHistory,
      cardIndex: newCardIndex,
      correctCount: newCorrectCount,
      difficulty: adjustDifficulty(difficulty, newHistory, newCardIndex),
      phase: 'revealing',
      lastAnswer: { isCorrect, pointsEarned: points },
    })
  },

  selectSandboxLine(line: number) {
    set({ sandboxSelectedLine: line })
  },

  submitSandboxAnswer(judgeResult: JudgeResult) {
    const { currentSnippet, score, streak, history, cardIndex, correctCount, difficulty, sandboxSecondsRemaining } = get()
    if (!currentSnippet) return

    // Correct: left-swipe on buggy code = right call; 1.5x bonus for pinpointing the exact line
    const { points, newStreak } = calculateScore(true, sandboxSecondsRemaining, streak)
    const finalPoints = Math.round(points * (judgeResult.isCorrect ? 1.5 : 1.0))
    const newCardIndex = cardIndex + 1
    const newHistory = [
      ...history,
      { snippetId: currentSnippet.id, isCorrect: true, timeUsed: 15 - sandboxSecondsRemaining },
    ]

    set({
      score: score + finalPoints,
      streak: newStreak,
      history: newHistory,
      cardIndex: newCardIndex,
      correctCount: correctCount + 1,
      difficulty: adjustDifficulty(difficulty, newHistory, newCardIndex),
      phase: 'revealing',
      lastAnswer: { isCorrect: true, pointsEarned: finalPoints },
      sandboxJudgeResult: judgeResult,
    })
  },

  timeout() {
    // Timer expired while in playing phase: wrong answer, no sandbox
    const { currentSnippet, phase, score, streak, history, cardIndex, correctCount, difficulty } = get()
    if (!currentSnippet || phase !== 'playing') return

    const { points, newStreak } = calculateScore(false, 0, streak)
    const newCardIndex = cardIndex + 1
    const newHistory = [
      ...history,
      { snippetId: currentSnippet.id, isCorrect: false, timeUsed: 15 },
    ]

    set({
      score: score + points,
      streak: newStreak,
      history: newHistory,
      cardIndex: newCardIndex,
      correctCount,
      difficulty: adjustDifficulty(difficulty, newHistory, newCardIndex),
      phase: 'revealing',
      lastAnswer: { isCorrect: false, pointsEarned: points },
    })
  },

  advanceCard() {
    const { nextSnippet, cardIndex } = get()

    if (cardIndex >= CARDS_PER_ROUND) {
      set({ phase: 'gameover', currentSnippet: null })
      return
    }

    if (nextSnippet) {
      set({
        currentSnippet: nextSnippet,
        nextSnippet: null,
        codebotDecision: computeCodeBotDecision(nextSnippet.snippet),
        phase: 'playing',
      })
    } else {
      set({ phase: 'playing', isFetching: true })
    }
  },

  addLeaderboardEntry(name: string) {
    const { score, correctCount, history, language } = get()
    const accuracy = history.length > 0 ? Math.round((correctCount / history.length) * 100) : 0
    const entry: LeaderboardEntry = {
      name: name.slice(0, 20),
      score,
      accuracy,
      language,
      timestamp: Date.now(),
    }
    set((s) => ({
      leaderboard: [...s.leaderboard, entry].sort((a, b) => b.score - a.score),
    }))
  },

  setFetching(v: boolean) {
    set({ isFetching: v })
  },

  resetGame() {
    set(initial)
  },
}))
