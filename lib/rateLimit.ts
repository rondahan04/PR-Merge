interface Entry {
  count: number
  reset: number
}

const ipMap = new Map<string, Entry>()

export function checkRateLimit(ip: string, limit = 20, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = ipMap.get(ip)

  if (!entry || now > entry.reset) {
    ipMap.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
