import { useEffect, useState } from "react"

/**
 * Pretends a request is in flight whenever `key` changes.
 *
 * The data here is computed locally and is ready at once; a real backend
 * would not be. Returning `true` for a moment lets the UI show the same
 * loading skeleton it would need in production.
 */
export function useSimulatedLatency(key: string, delayMs = 420): boolean {
  const [settledKey, setSettledKey] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => setSettledKey(key), delayMs)
    return () => window.clearTimeout(timer)
  }, [key, delayMs])

  return settledKey !== key
}
