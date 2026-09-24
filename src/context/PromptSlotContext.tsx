import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface PromptSlotContextValue {
  activePrompt: string | null
  claimPrompt: (id: string) => boolean
  releasePrompt: (id: string) => void
}

const PromptSlotContext = createContext<PromptSlotContextValue | null>(null)

export function PromptSlotProvider({ children }: { children: ReactNode }) {
  const [activePrompt, setActivePrompt] = useState<string | null>(null)

  const claimPrompt = useCallback((id: string) => {
    let claimed = false
    setActivePrompt((current) => {
      if (current === null || current === id) {
        claimed = true
        return id
      }
      return current
    })
    return claimed
  }, [])

  const releasePrompt = useCallback((id: string) => {
    setActivePrompt((current) => (current === id ? null : current))
  }, [])

  return (
    <PromptSlotContext.Provider value={{ activePrompt, claimPrompt, releasePrompt }}>
      {children}
    </PromptSlotContext.Provider>
  )
}

/**
 * Only one registered prompt can hold the slot at a time, so floating
 * overlays (Google one-tap, notification permission, etc.) queue instead
 * of stacking on top of each other. Lower-priority callers should keep
 * retrying `claim()` — it re-succeeds once the current holder releases.
 */
export function usePromptSlot(id: string) {
  const ctx = useContext(PromptSlotContext)
  if (!ctx) throw new Error('usePromptSlot must be used within PromptSlotProvider')
  const { activePrompt, claimPrompt, releasePrompt } = ctx
  return {
    isActive: activePrompt === id,
    activePrompt,
    claim: useCallback(() => claimPrompt(id), [claimPrompt, id]),
    release: useCallback(() => releasePrompt(id), [releasePrompt, id]),
  }
}
