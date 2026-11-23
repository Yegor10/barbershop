"use client"

import { useEffect, useRef, useState } from "react"

interface NetworkInformation {
  saveData?: boolean
}

function prefersLightweightPage(): boolean {
  const { connection } = navigator as Navigator & {
    connection?: NetworkInformation
  }
  return connection?.saveData === true
}

function isLowPowerDevice(): boolean {
  const { deviceMemory } = navigator as Navigator & { deviceMemory?: number }
  return (
    navigator.hardwareConcurrency <= 4 ||
    (deviceMemory !== undefined && deviceMemory <= 4)
  )
}

/**
 * Fixed neon backdrop with the 3D clipper. It is purely decorative: hidden
 * from assistive technology, never focusable and transparent to clicks.
 * three.js loads after the page is idle, so content and booking are usable
 * first. Without WebGL, or with Save-Data, the CSS glow stays on its own.
 */
export function ClipperBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersLightweightPage()) return

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let cancelled = false
    let dispose: (() => void) | undefined
    let setReducedMotion: ((reduced: boolean) => void) | undefined

    const handleMotion = () => setReducedMotion?.(motion.matches)

    const load = async () => {
      try {
        const { createClipperScene } = await import(
          "@/components/landing/clipper-scene"
        )
        if (cancelled) return
        const clipper = createClipperScene(canvas, {
          reducedMotion: motion.matches,
          lowPower: isLowPowerDevice(),
          onContextLost: () => setReady(false),
        })
        dispose = clipper.dispose
        setReducedMotion = clipper.setReducedMotion
        motion.addEventListener("change", handleMotion)
        setReady(true)
      } catch {
        // No WebGL or the chunk failed to load: the CSS backdrop remains.
        setReady(false)
      }
    }

    const idle = window.requestIdleCallback?.(() => void load(), { timeout: 1800 })
    const timer =
      idle === undefined ? window.setTimeout(() => void load(), 300) : undefined

    return () => {
      cancelled = true
      if (idle !== undefined) window.cancelIdleCallback(idle)
      if (timer !== undefined) window.clearTimeout(timer)
      motion.removeEventListener("change", handleMotion)
      dispose?.()
    }
  }, [])

  return (
    <div aria-hidden className="neon-backdrop">
      <canvas
        ref={canvasRef}
        tabIndex={-1}
        className="size-full data-[ready=false]:invisible"
        data-ready={ready}
      />
    </div>
  )
}
