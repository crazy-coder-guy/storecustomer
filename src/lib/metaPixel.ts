const META_PIXEL_ID = '1753947472423218'

type FbqFn = {
  (...args: unknown[]): void
  callMethod?: (...args: unknown[]) => void
  queue?: unknown[]
  push?: FbqFn
  loaded?: boolean
  version?: string
}

// Meta (Facebook) Pixel — production only, mirrors initClarity()'s guard so
// local dev traffic never pollutes ad-platform analytics.
export function initMetaPixel() {
  if (!import.meta.env.PROD) return

  const w = window as unknown as { fbq?: FbqFn; _fbq?: FbqFn }
  if (w.fbq) return

  const fbq: FbqFn = (...args: unknown[]) => {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
    } else {
      fbq.queue!.push(args)
    }
  }
  fbq.push = fbq
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []

  w.fbq = fbq
  w._fbq = fbq

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode?.insertBefore(script, firstScript)

  fbq('init', META_PIXEL_ID)
  fbq('track', 'PageView')
}

// Fires a standard/custom Pixel event. No-op outside production or before
// initMetaPixel() has run (fbq isn't attached to window yet).
export function trackPixelEvent(name: string, params?: Record<string, unknown>) {
  if (!import.meta.env.PROD) return
  const fbq = (window as unknown as { fbq?: FbqFn }).fbq
  if (!fbq) return
  fbq('track', name, params)
}
