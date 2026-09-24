import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from './SmoothScroll'

/**
 * React Router only swaps components on navigation — it doesn't touch scroll
 * position (that's a browser behavior tied to full page loads, which SPA
 * navigation intentionally skips). Without this, navigating to a new page
 * keeps whatever scroll offset the previous page was left at, and a link
 * like "/#shop" never scrolls to its target since there's no full reload for
 * the browser to resolve the hash against.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const previousPathname = useRef(pathname)

  useLayoutEffect(() => {
    if (hash) return
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname

    const lenis = getLenis()
    if (lenis) {
      lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo({ top: 0, left: 0 })
    }
  }, [pathname, hash])

  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    // Give the destination page a moment to render before measuring it.
    const timer = setTimeout(() => {
      const target = document.getElementById(id)
      if (!target) return
      const lenis = getLenis()
      if (lenis) {
        lenis.scrollTo(target, { offset: 0 })
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 80)
    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}
