import { useMemo, useSyncExternalStore } from "react"

const TICK_MS = 15_000
const MINUTE_MS = 60_000

function subscribe(onChange: () => void): () => void {
  const timer = window.setInterval(onChange, TICK_MS)
  // Catch up straight away when the tab comes back to the foreground.
  document.addEventListener("visibilitychange", onChange)
  return () => {
    window.clearInterval(timer)
    document.removeEventListener("visibilitychange", onChange)
  }
}

function getSnapshot(): number {
  return Math.floor(Date.now() / MINUTE_MS) * MINUTE_MS
}

function getServerSnapshot(): null {
  return null
}

/**
 * The current time, rounded down to the minute and refreshed as it changes.
 *
 * Returns `null` while the page is prerendered and hydrating: the HTML is
 * built ahead of time, so the only honest clock is the visitor's. Components
 * render a skeleton until this resolves.
 */
export function useNow(): Date | null {
  const minute = useSyncExternalStore<number | null>(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )
  return useMemo(() => (minute === null ? null : new Date(minute)), [minute])
}
