export interface ScoreResult {
  points: number
  newStreak: number
}

export function calculateScore(
  isCorrect: boolean,
  secondsRemaining: number,
  streak: number
): ScoreResult {
  if (!isCorrect) return { points: 0, newStreak: 0 }

  const base = 100
  const timeBonus = Math.round(secondsRemaining * 5)
  const multiplier = 1 + streak * 0.1
  const points = Math.round((base + timeBonus) * multiplier)

  return { points, newStreak: streak + 1 }
}
