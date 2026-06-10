import { describe, it, expect } from 'vitest'
import { isValidElement } from 'react'
import type { ReactElement } from 'react'
import { tokenizeSnippet, tokenizeLines, renderTokens, LANG_LABELS } from '@/lib/prism'
import type { Language } from '@/store/gameStore'

const SAMPLES: Record<Language, string> = {
  javascript: 'const x = users.filter(u => u.active)',
  python: 'def get_user(user_id):\n    return db.query(user_id)',
  java: 'public User getUser(String userId) throws SQLException {\n  return mapRow(rs);\n}',
  sql: "SELECT * FROM users WHERE id = '42'",
}

describe('tokenizeSnippet', () => {
  it.each(Object.keys(SAMPLES) as Language[])(
    'tokenizes %s with a statically loaded grammar',
    (lang) => {
      const tokens = tokenizeSnippet(SAMPLES[lang], lang)
      // a loaded grammar produces structured tokens, not just the raw string back
      expect(tokens.some((t) => typeof t !== 'string')).toBe(true)
    }
  )

  it('falls back to the raw code when no grammar exists', () => {
    const tokens = tokenizeSnippet('hello', 'nope' as Language)
    expect(tokens).toEqual(['hello'])
  })
})

describe('tokenizeLines', () => {
  it('returns one token array per source line', () => {
    const code = 'SELECT *\nFROM users\n\nWHERE id = 1'
    const lines = tokenizeLines(code, 'sql')
    expect(lines).toHaveLength(4)
  })

  it('normalizes CRLF line endings', () => {
    expect(tokenizeLines('a = 1\r\nb = 2', 'python')).toHaveLength(2)
  })
})

describe('renderTokens', () => {
  it('renders plain strings as-is and tokens as span elements', () => {
    const nodes = renderTokens(tokenizeSnippet(SAMPLES.java, 'java'))
    const spans = nodes.filter((n) => isValidElement(n)) as ReactElement<{ className: string }>[]
    expect(spans.length).toBeGreaterThan(0)
    for (const span of spans) {
      expect(span.type).toBe('span')
      expect(span.props.className).toMatch(/^token /)
    }
  })
})

describe('LANG_LABELS', () => {
  it('covers every supported language', () => {
    expect(LANG_LABELS).toEqual({
      javascript: 'JavaScript',
      python: 'Python',
      java: 'Java',
      sql: 'SQL',
    })
  })
})
