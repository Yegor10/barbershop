import { useCallback, useSyncExternalStore } from "react"

function subscribe(onChange: () => void): () => void {
  window.addEventListener("scroll", onChange, { passive: true })
  return () => window.removeEventListener("scroll", onChange)
}

function getServerSnapshot(): boolean {
  return false
}

/** Whether the page has been scrolled past `threshold` pixels. */
export function useScrolled(threshold = 24): boolean {
  const getSnapshot = useCallback(() => window.scrollY > threshold, [threshold])
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
