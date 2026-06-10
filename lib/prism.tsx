import Prism from 'prismjs'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-java'
import 'prismjs/components/prism-sql'
import type { ReactNode } from 'react'
import type { Language } from '@/store/gameStore'

// Safe per-token renderer — no dangerouslySetInnerHTML
export type PrismToken = { type: string; content: string | PrismToken[] } | string

export const LANG_LABELS: Record<Language, string> = {
  javascript: 'JavaScript',
  python: 'Python',
  java: 'Java',
  sql: 'SQL',
}

export function tokenizeSnippet(code: string, language: Language): PrismToken[] {
  const grammar = Prism.languages[language]
  if (!grammar) return [code]
  return Prism.tokenize(code, grammar) as PrismToken[]
}

export function tokenizeLines(code: string, language: Language): PrismToken[][] {
  const grammar = Prism.languages[language]
  const lines = code.replace(/\r\n/g, '\n').split('\n')
  if (!grammar) return lines.map((l) => [l])
  return lines.map((line) => Prism.tokenize(line || ' ', grammar) as PrismToken[])
}

export function renderTokens(tokens: PrismToken[]): ReactNode[] {
  return tokens.map((t, i) => {
    if (typeof t === 'string') return t
    return (
      <span key={i} className={`token ${t.type}`}>
        {Array.isArray(t.content) ? renderTokens(t.content) : t.content}
      </span>
    )
  })
}
