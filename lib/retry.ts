/**
 * Retry an async operation that signals failure by resolving to null.
 * Waits baseDelayMs * 2^attempt between attempts (1s, 2s, 4s by default).
 */
export async function withRetry<T>(
  fn: () => Promise<T | null>,
  retries = 3,
  baseDelayMs = 1000,
): Promise<T | null> {
  for (let attempt = 0; ; attempt++) {
    const result = await fn()
    if (result !== null) return result
    if (attempt >= retries) return null
    await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt))
  }
}
