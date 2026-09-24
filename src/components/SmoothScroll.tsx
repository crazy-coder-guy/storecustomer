import { useEffect } from 'react'
import Lenis from 'lenis'

// Lenis runs its own rAF loop that continuously drives the page toward an
// internal target scroll position — a plain `window.scrollTo()` from outside
// gets overridden on the very next frame. Anything that needs to move the
// scroll position programmatically (e.g. resetting to top on route change)
// has to go through this instance instead.
let activeLenis: Lenis | null = null

export function getLenis(): Lenis | null {
  return activeLenis
}

export function SmoothScroll() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
    activeLenis = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      activeLenis = null
    }
  }, [])

  return null
}
