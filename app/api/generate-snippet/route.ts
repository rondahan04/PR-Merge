import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rateLimit'
import { getFromFallbackBank, type FallbackLanguage } from '@/lib/fallback'
import { buildPrompt } from '@/lib/prompt'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.5'

const SnippetSchema = z.object({
  snippet: z.string(),
  language: z.enum(['javascript', 'python', 'sql', 'java']),
  is_good: z.boolean(),
  issues: z.array(z.string()),
  explanation: z.string(),
})

export async function POST(req: NextRequest) {
  // Auth: shared-secret header
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 20 req/min per IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const language = body.language ?? 'javascript'
  const difficulty = body.difficulty ?? 'junior'
  const isGood: boolean = Math.random() < 0.5

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    const completion = await getClient().chat.completions.parse({
      model: MODEL,
      messages: [{ role: 'user', content: buildPrompt(language, difficulty, isGood) }],
      response_format: zodResponseFormat(SnippetSchema, 'snippet'),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout))

    const parsed = completion.choices[0]?.message?.parsed
    if (!parsed) throw new Error('No parsed response')

    return NextResponse.json({
      ...parsed,
      id: `ai-${Date.now()}`,
      recycled: false,
    })
  } catch {
    const fallback = getFromFallbackBank(language as FallbackLanguage)
    return NextResponse.json(fallback)
  }
}
