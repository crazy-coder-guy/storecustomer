import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Ensures scrolling resets to top on navigation or moves to target element on hash.
 */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const previousPathname = useRef(pathname)

  useLayoutEffect(() => {
    if (hash) return
    if (previousPathname.current === pathname) return
    previousPathname.current = pathname

    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, hash])

  useEffect(() => {
    if (!hash) return
    const id = hash.slice(1)
    const timer = setTimeout(() => {
      const target = document.getElementById(id)
      if (!target) return
      target.scrollIntoView({ behavior: 'auto', block: 'start' })
    }, 80)
    return () => clearTimeout(timer)
  }, [pathname, hash])

  return null
}
