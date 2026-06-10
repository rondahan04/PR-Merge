import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod'
import { checkRateLimit } from '@/lib/rateLimit'

let _client: OpenAI | null = null
function getClient() {
  if (!_client) _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  return _client
}
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4.5'

const RequestSchema = z.object({
  snippetId: z.string().optional(),
  snippet: z.string().min(1).max(4000),
  language: z.enum(['javascript', 'python', 'sql', 'java']),
  issues: z.array(z.string()),
  bugLines: z.array(z.number().int().positive()),
  selectedLine: z.number().int().positive(),
})

const JudgeSchema = z.object({
  feedback: z.string(),
  explanation: z.string(),
})

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-api-secret')
  if (!secret || secret !== process.env.API_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { snippet, language, issues, bugLines, selectedLine } = parsed.data
  const lines = snippet.replace(/\r\n/g, '\n').split('\n')

  // Fast path: correct line — no OpenAI call needed
  if (bugLines.includes(selectedLine)) {
    const bugLineContent = lines[selectedLine - 1]?.trim() ?? ''
    return NextResponse.json({
      isCorrect: true,
      feedback: `Line ${selectedLine} is the bug: "${bugLineContent}"`,
      explanation: issues[0] ?? 'Bug identified correctly.',
    })
  }

  // Slow path: wrong line — OpenAI explains why and nudges toward the real bug
  const selectedContent = lines[selectedLine - 1]?.trim() ?? ''
  const bugLineDescriptions = bugLines
    .map((n) => `line ${n}: "${lines[n - 1]?.trim() ?? ''}"`)
    .join('; ')

  const prompt = `You are a code review judge. A developer tried to find a bug in this ${language} snippet.

\`\`\`${language}
${snippet}
\`\`\`

Known issue: ${issues[0] ?? 'a security bug'}

Developer selected line ${selectedLine}: "${selectedContent}"
Actual bug location: ${bugLineDescriptions}

Respond with:
- "feedback": One sentence — explain specifically why line ${selectedLine} is NOT the problem (what it does that is fine).
- "explanation": One sentence — give a conceptual hint that guides the developer toward the real bug without revealing the exact line number.`

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const completion = await getClient().chat.completions.parse({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      response_format: zodResponseFormat(JudgeSchema, 'judge'),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId))

    const result = completion.choices[0]?.message?.parsed
    if (!result) throw new Error('No parsed response')

    return NextResponse.json({
      isCorrect: false,
      feedback: result.feedback,
      explanation: result.explanation,
    })
  } catch {
    return NextResponse.json({
      isCorrect: false,
      feedback: `Line ${selectedLine} isn't the bug — look at what each line actually does to the data.`,
      explanation: issues[0] ?? 'The vulnerability is elsewhere in the snippet.',
    })
  }
}
