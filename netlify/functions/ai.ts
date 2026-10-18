/**
 * Secure proxy to OpenAI Chat Completions.
 * - API key only on the server (process.env.OPENAI_API_KEY)
 * - Model from process.env.OPENAI_MODEL, default gpt-4o-mini
 * - In-memory per-IP rate limit, input length cap, JSON responses
 * - fetch only, no SDK
 */

type NetlifyEvent = {
  httpMethod: string
  body: string | null
  headers: Record<string, string | undefined>
}
type NetlifyResponse = { statusCode: number; headers?: Record<string, string>; body: string }

const RATE_WINDOW_MS = 60_000
const RATE_MAX = 20
const MAX_INPUT_CHARS = 6000
const MAX_TOKENS = 700

const buckets = new Map<string, { count: number; resetAt: number }>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const b = buckets.get(ip)
  if (!b || b.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  b.count += 1
  return b.count > RATE_MAX
}

function json(statusCode: number, body: unknown): NetlifyResponse {
  return { statusCode, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: JSON.stringify(body) }
}

export const handler = async (event: NetlifyEvent): Promise<NetlifyResponse> => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' })
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return json(503, { error: 'AI is not configured', configured: false })

  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim()
  if (rateLimited(ip)) return json(429, { error: 'Too many requests. Try again in a minute.' })

  let payload: { system?: string; prompt?: string; temperature?: number }
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'Invalid JSON' })
  }
  const system = typeof payload.system === 'string' ? payload.system.slice(0, 2000) : 'You are a helpful assistant for a construction business portal.'
  const prompt = typeof payload.prompt === 'string' ? payload.prompt : ''
  if (!prompt.trim()) return json(400, { error: 'Missing prompt' })
  if (prompt.length > MAX_INPUT_CHARS) return json(413, { error: `Prompt too long (max ${MAX_INPUT_CHARS} characters)` })
  const temperature = typeof payload.temperature === 'number' ? Math.max(0, Math.min(1, payload.temperature)) : 0.5

  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
      }),
    })
    if (!res.ok) {
      const text = await res.text()
      return json(502, { error: `Upstream error ${res.status}`, detail: text.slice(0, 300) })
    }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const text = data.choices?.[0]?.message?.content?.trim() ?? ''
    if (!text) return json(502, { error: 'Empty response from model' })
    return json(200, { text, model, live: true })
  } catch (err) {
    return json(502, { error: 'Could not reach the AI provider', detail: err instanceof Error ? err.message : String(err) })
  }
}
