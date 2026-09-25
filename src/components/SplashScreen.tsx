import { useEffect, useState } from 'react'
import { KairaLogo } from './KairaLogo'

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

// The draw-in animation itself takes ~0.5s (last letter's delay) + 0.9s
// (stroke duration) to finish — hold a beat after that before fading out.
const SPLASH_DURATION_MS = 1900
const FADE_DURATION_MS = 400

// Replaces the OS's default auto-generated splash (just the app icon on a
// flat color) with the same animated wordmark used in the navbar, shown
// only when actually launched as the installed PWA — a regular browser tab
// visit never sees this.
export function SplashScreen() {
  const [shouldShow] = useState(() => isRunningStandalone())
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isMounted, setIsMounted] = useState(shouldShow)

  useEffect(() => {
    // If not standalone, dismiss the HTML instant splash immediately
    if (!shouldShow) {
      const htmlSplash = document.getElementById('pwa-instant-splash')
      if (htmlSplash) {
        htmlSplash.classList.add('hidden-splash')
        setTimeout(() => htmlSplash.remove(), 400)
      }
      return
    }

    // Standalone PWA mode: coordinate fadeout with HTML splash
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
      const htmlSplash = document.getElementById('pwa-instant-splash')
      if (htmlSplash) htmlSplash.classList.add('hidden-splash')
    }, SPLASH_DURATION_MS)

    const removeTimer = setTimeout(() => {
      setIsMounted(false)
      const htmlSplash = document.getElementById('pwa-instant-splash')
      if (htmlSplash) htmlSplash.remove()
    }, SPLASH_DURATION_MS + FADE_DURATION_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [shouldShow])

  if (!isMounted) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white transition-opacity duration-[400ms] ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <KairaLogo animated variant="draw-in" className="h-10 sm:h-12 text-black" height={44} />
    </div>
  )
}
