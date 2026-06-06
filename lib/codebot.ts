const SIMPLE_PATTERNS = [
  /eval\s*\(/,
  /password\s*=\s*["'`]/i,
  /secret\s*=\s*["'`]/i,
  /api[_-]?key\s*=\s*["'`]/i,
  /innerHTML\s*=/,
  /document\.write\s*\(/,
  /os\.system\s*\(/,
  /exec\s*\(\s*f?["'`]/,
]

const SQL_KEYWORDS = /\b(?:SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|WHERE|FROM|JOIN)\b/i
const STRING_CONCAT = /["'`]\s*\+\s*[a-zA-Z_$]|[a-zA-Z_$\d]\s*\+\s*["'`]/

export function computeCodeBotDecision(snippet: string): boolean {
  if (SIMPLE_PATTERNS.some((p) => p.test(snippet))) return false
  if (SQL_KEYWORDS.test(snippet) && STRING_CONCAT.test(snippet)) return false
  return true
}
