import { useEffect, useState, useRef } from 'react'
import { KairaLogo } from './KairaLogo'
import { useFeaturedProducts, useStorefrontSettings } from '../hooks/queries'

// Ensure splash is visible for at least 800ms so the brand animation isn't jarringly brief
const MIN_SPLASH_DISPLAY_MS = 800
const FADE_DURATION_MS = 400

export function SplashScreen() {
  const [isFadingOut, setIsFadingOut] = useState(false)
  const [isMounted, setIsMounted] = useState(true)
  const mountTimeRef = useRef(Date.now())

  // Core endpoints that must be settled before removing the splash
  const { isLoading: settingsLoading, isFetched: settingsFetched } = useStorefrontSettings()
  const { isLoading: featuredLoading, isFetched: featuredFetched } = useFeaturedProducts()

  // Ready when both endpoints have either loaded (or failed/cached)
  const isDataReady = (!settingsLoading || settingsFetched) && (!featuredLoading || featuredFetched)

  useEffect(() => {
    if (!isDataReady) return

    const elapsed = Date.now() - mountTimeRef.current
    const remainingDelay = Math.max(0, MIN_SPLASH_DISPLAY_MS - elapsed)

    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
      const htmlSplash = document.getElementById('pwa-instant-splash')
      if (htmlSplash) htmlSplash.classList.add('hidden-splash')
    }, remainingDelay)

    const removeTimer = setTimeout(() => {
      setIsMounted(false)
      const htmlSplash = document.getElementById('pwa-instant-splash')
      if (htmlSplash) htmlSplash.remove()
    }, remainingDelay + FADE_DURATION_MS)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [isDataReady])

  if (!isMounted) return null

  return (
    <div
      className={`fixed inset-0 z-[99999] flex items-center justify-center bg-white transition-opacity duration-[400ms] ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <KairaLogo animated variant="draw-in" className="h-10 sm:h-12 text-black" height={44} />
    </div>
  )
}

