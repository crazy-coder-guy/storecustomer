import { useEffect } from 'react'

/**
 * Fires a short real vibration (Android Chrome/Firefox) on every button/link
 * tap, on top of the CSS press-scale animation that all browsers get. The
 * Vibration API is unsupported on iOS Safari and desktop, where this is a
 * silent no-op — never throws, never blocks the click.
 */
export function HapticFeedback() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return

    function handlePointerDown(e: PointerEvent) {
      if (e.pointerType !== 'touch') return
      const target = e.target as Element | null
      if (!target?.closest('button:not(:disabled), .tap-press, a')) return
      navigator.vibrate(8)
    }

    document.addEventListener('pointerdown', handlePointerDown, { passive: true })
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return null
}
