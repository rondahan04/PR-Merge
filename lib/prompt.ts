type Language = 'javascript' | 'python' | 'sql' | 'java'
type Difficulty = 'junior' | 'mid' | 'senior'

const DIFFICULTY_DESC: Record<Difficulty, string> = {
  junior: 'obvious, well-known vulnerability (e.g. hardcoded password, eval, innerHTML)',
  mid: 'moderate subtlety (e.g. SQL injection via ORM misuse, improper error exposure, race condition)',
  senior: 'subtle, nuanced issue (e.g. TOCTOU race, timing attack, improper HMAC comparison, prototype pollution)',
}

const GOOD_DIFFICULTY_DESC: Record<Difficulty, string> = {
  junior: 'simple, clean code with clear best practices (e.g. parameterized query, input validation)',
  mid: 'well-structured code with proper error handling and security patterns',
  senior: 'sophisticated, idiomatic code with security-conscious design decisions',
}

export function buildPrompt(language: Language, difficulty: Difficulty, isGood: boolean): string {
  const lang = language === 'javascript' ? 'JavaScript/TypeScript' : language === 'python' ? 'Python' : language === 'sql' ? 'SQL' : 'Java'
  const desc = isGood ? GOOD_DIFFICULTY_DESC[difficulty] : DIFFICULTY_DESC[difficulty]
  const target = isGood ? 'CLEAN, correct, secure' : 'BAD, containing a real security flaw or bug'

  return `You are generating code snippets for a code review training game.

Generate ONE ${lang} code snippet that is ${target}.
Difficulty level: ${difficulty.toUpperCase()} — ${desc}

Requirements:
- Length: 5 to 20 lines maximum
- Must be realistic, plausible production code (not toy examples)
- The snippet should stand alone and be easy to read quickly
- is_good: ${isGood}
- If is_good is false: the snippet must contain exactly ONE clear issue
- If is_good is true: the snippet must have NO security flaws or bugs

Respond with a JSON object matching this exact schema:
{
  "snippet": "the code as a string",
  "language": "${language}",
  "is_good": ${isGood},
  "issues": ["list of issues, empty array if is_good is true"],
  "explanation": "1-3 sentence explanation of why this code is good or bad"
}`
}
