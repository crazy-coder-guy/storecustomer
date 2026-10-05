import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { trackPixelEvent } from '../lib/metaPixel'

// initMetaPixel() fires the first PageView on initial load; this fires one
// on every subsequent route change, since a BrowserRouter SPA never reloads
// the page for fbq's own listeners to catch.
export function PixelPageViewTracker() {
  const { pathname } = useLocation()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    trackPixelEvent('PageView')
  }, [pathname])

  return null
}
