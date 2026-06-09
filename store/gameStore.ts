import { create } from 'zustand'
import { calculateScore } from '@/lib/scoring'
import { computeCodeBotDecision } from '@/lib/codebot'

export interface Snippet {
  id: string
  snippet: string
  language: 'javascript' | 'python' | 'sql' | 'java'
  is_good: boolean
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
export type Phase = 'idle' | 'playing' | 'revealing' | 'gameover'

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
}

interface GameActions {
  startGame: (language: Language, difficulty: Difficulty, codeBotMode: boolean) => void
  setCurrentSnippet: (snippet: Snippet) => void
  setNextSnippet: (snippet: Snippet | null) => void
  swipe: (approved: boolean, secondsRemaining: number) => void
  advanceCard: () => void
  addLeaderboardEntry: (name: string) => void
  setFetching: (v: boolean) => void
  resetGame: () => void
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
}

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...initial,

  startGame(language, difficulty, codeBotMode) {
    set({ ...initial, language, difficulty, phase: 'playing', isCodeBotMode: codeBotMode })
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
    const { currentSnippet, phase, score, streak, history, cardIndex, correctCount, difficulty } = get()
    if (!currentSnippet || phase !== 'playing') return

    const isCorrect = approved === currentSnippet.is_good
    const { points, newStreak } = calculateScore(isCorrect, secondsRemaining, streak)
    const newCardIndex = cardIndex + 1
    const newCorrectCount = correctCount + (isCorrect ? 1 : 0)

    const newHistory = [
      ...history,
      { snippetId: currentSnippet.id, isCorrect, timeUsed: 15 - secondsRemaining },
    ]

    let newDifficulty = difficulty
    if (newCardIndex % DIFFICULTY_WINDOW === 0) {
      const windowCorrect = newHistory.slice(-DIFFICULTY_WINDOW).filter((h) => h.isCorrect).length
      const accuracy = windowCorrect / DIFFICULTY_WINDOW
      if (accuracy > 0.8 && difficulty !== 'senior') {
        newDifficulty = difficulty === 'junior' ? 'mid' : 'senior'
      } else if (accuracy < 0.4 && difficulty !== 'junior') {
        newDifficulty = difficulty === 'senior' ? 'mid' : 'junior'
      }
    }

    set({
      score: score + points,
      streak: newStreak,
      history: newHistory,
      cardIndex: newCardIndex,
      correctCount: newCorrectCount,
      difficulty: newDifficulty,
      phase: 'revealing',
      lastAnswer: { isCorrect, pointsEarned: points },
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
