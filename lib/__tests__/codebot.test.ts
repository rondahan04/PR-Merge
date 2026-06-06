import { describe, it, expect } from 'vitest'
import { computeCodeBotDecision } from '../codebot'

describe('computeCodeBotDecision', () => {
  it('rejects snippet containing eval()', () => {
    expect(computeCodeBotDecision('const result = eval(userInput)')).toBe(false)
  })

  it('rejects SQL string concatenation pattern', () => {
    const bad = 'const q = "SELECT * FROM users WHERE id = " + userId'
    expect(computeCodeBotDecision(bad)).toBe(false)
  })

  it('rejects hardcoded password string literal', () => {
    expect(computeCodeBotDecision('const password = "hunter2"')).toBe(false)
  })

  it('approves clean snippet with no matching patterns', () => {
    const clean = `
function fetchUser(id: string) {
  return db.query('SELECT * FROM users WHERE id = ?', [id])
}
`
    expect(computeCodeBotDecision(clean)).toBe(true)
  })

  it('Python keyword arg set_password= is NOT rejected (string literal required)', () => {
    expect(computeCodeBotDecision('user.set_password=new_password')).toBe(true)
  })
})
