const CLARITY_PROJECT_ID = 'yod6xt7527'

// Microsoft Clarity session recording — production only. `import.meta.env.PROD`
// is false for `vite dev` (localhost) and true for a production build, so
// this never records local development sessions.
export function initClarity() {
  if (!import.meta.env.PROD) return

  type ClarityFn = { (...args: unknown[]): void; q?: unknown[] }
  const w = window as unknown as { clarity?: ClarityFn }

  w.clarity =
    w.clarity ||
    ((...args: unknown[]) => {
      ;(w.clarity!.q = w.clarity!.q || []).push(args)
    })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${CLARITY_PROJECT_ID}`
  const firstScript = document.getElementsByTagName('script')[0]
  firstScript.parentNode?.insertBefore(script, firstScript)
}
