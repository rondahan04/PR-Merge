import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { withRetry } from '@/lib/retry'

describe('withRetry', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns immediately on first success without waiting', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const result = await withRetry(fn)
    expect(result).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('retries after null and returns the eventual success', async () => {
    const fn = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValue('ok')
    const promise = withRetry(fn)
    await vi.runAllTimersAsync()
    expect(await promise).toBe('ok')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  it('gives up with null after exhausting retries', async () => {
    const fn = vi.fn().mockResolvedValue(null)
    const promise = withRetry(fn, 3)
    await vi.runAllTimersAsync()
    expect(await promise).toBeNull()
    // initial attempt + 3 retries
    expect(fn).toHaveBeenCalledTimes(4)
  })

  it('backs off exponentially between attempts', async () => {
    const fn = vi.fn().mockResolvedValue(null)
    const promise = withRetry(fn, 2, 1000)
    // attempt 1 fires immediately
    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)
    // attempt 2 after 1000ms
    await vi.advanceTimersByTimeAsync(999)
    expect(fn).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fn).toHaveBeenCalledTimes(2)
    // attempt 3 after another 2000ms
    await vi.advanceTimersByTimeAsync(2000)
    expect(fn).toHaveBeenCalledTimes(3)
    expect(await promise).toBeNull()
  })

  it('honors retries = 0 (single attempt)', async () => {
    const fn = vi.fn().mockResolvedValue(null)
    expect(await withRetry(fn, 0)).toBeNull()
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
