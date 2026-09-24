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

    // Trigger vibration only when an explicit click/tap action is confirmed
    // (never on hover, touch contact, or swipe/scroll contact).
    function handleClick(e: MouseEvent) {
      const target = e.target as Element | null
      const buttonOrLink = target?.closest('button:not(:disabled), .tap-press, a[href]')
      if (!buttonOrLink) return

      try {
        navigator.vibrate(10)
      } catch {
        // Ignore devices that block vibration
      }
    }

    document.addEventListener('click', handleClick, { capture: true })
    return () => document.removeEventListener('click', handleClick, { capture: true })
  }, [])

  return null
}
