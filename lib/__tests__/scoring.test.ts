import { describe, it, expect } from 'vitest'
import { calculateScore } from '../scoring'

describe('calculateScore', () => {
  it('correct at 8s remaining with streak 3 → 182 points', () => {
    const result = calculateScore(true, 8, 3)
    expect(result.points).toBe(182)
    expect(result.newStreak).toBe(4)
  })

  it('correct at full time (15s) with no streak → 175 points', () => {
    const result = calculateScore(true, 15, 0)
    expect(result.points).toBe(175)
    expect(result.newStreak).toBe(1)
  })

  it('correct at 0s remaining with streak 5 → 150 points', () => {
    const result = calculateScore(true, 0, 5)
    expect(result.points).toBe(150)
    expect(result.newStreak).toBe(6)
  })

  it('wrong answer → 0 points, streak resets', () => {
    const result = calculateScore(false, 10, 5)
    expect(result.points).toBe(0)
    expect(result.newStreak).toBe(0)
  })

  it('timer expiry (0s, isCorrect false) → 0 points, streak resets', () => {
    const result = calculateScore(false, 0, 3)
    expect(result.points).toBe(0)
    expect(result.newStreak).toBe(0)
  })
})
