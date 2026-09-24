import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Notification03Icon } from '@hugeicons/core-free-icons'
import { usePushNotifications } from '../hooks/usePushNotifications'

const DISMISSED_KEY = 'kaira_push_prompt_dismissed'

export function NotificationPermissionPrompt() {
  const { permission, isSubscribing, enableNotifications } = usePushNotifications()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (permission !== 'default') {
      setIsVisible(false)
      return
    }
    if (sessionStorage.getItem(DISMISSED_KEY)) return

    // Let the page settle before asking — a prompt that appears the instant
    // the site loads reads as spammy and gets reflexively dismissed.
    const timer = setTimeout(() => setIsVisible(true), 3500)
    return () => clearTimeout(timer)
  }, [permission])

  function handleDismiss() {
    setIsVisible(false)
    sessionStorage.setItem(DISMISSED_KEY, 'true')
  }

  async function handleEnable() {
    const success = await enableNotifications()
    if (success) setIsVisible(false)
  }

  if (!isVisible) return null

  return createPortal(
    <div className="fixed bottom-20 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:left-auto z-[990] flex justify-center sm:justify-end animate-pill-float-up pointer-events-none">
      <div className="pointer-events-auto w-full max-w-[380px] bg-neutral-950 text-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.12)] border border-white/10 relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/5 blur-2xl" />

        {/* Absolute Dismiss cross top-right */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="tap-press absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} />
        </button>

        {/* Content row with animated Bell icon */}
        <div className="flex items-start gap-3 pr-7">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-900 text-white border border-white/15 shadow-inner">
            <HugeiconsIcon icon={Notification03Icon} size={22} className="animate-[wiggle_1.2s_ease-in-out_infinite]" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-neutral-950" />
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-black text-white tracking-tight leading-snug">
              Allow Notifications?
            </h4>
            <p className="text-[11px] sm:text-xs text-neutral-300/85 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">
              Get real-time alerts for price drops, limited restocks, and order delivery status.
            </p>
          </div>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-2 border-t border-white/10">
          <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            ⚡ Instant Restocks
          </span>
          <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            🏷️ Exclusive Deals
          </span>
          <span className="text-[10px] font-bold text-neutral-300 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
            📦 Order Status
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={handleEnable}
            disabled={isSubscribing}
            className="tap-press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-white px-3.5 py-2 sm:py-2.5 text-xs font-black text-neutral-950 hover:bg-neutral-100 transition-all cursor-pointer disabled:opacity-60 shadow-md active:scale-95"
          >
            <HugeiconsIcon icon={Notification03Icon} size={14} />
            <span>{isSubscribing ? 'Allowing…' : 'Allow Notifications'}</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="tap-press px-3.5 py-2 sm:py-2.5 text-xs font-bold text-neutral-400 hover:text-white transition-colors cursor-pointer rounded-xl hover:bg-white/5 active:scale-95"
          >
            Later
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
