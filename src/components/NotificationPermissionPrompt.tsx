import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, Notification03Icon, BellOffIcon } from '@hugeicons/core-free-icons'
import { usePushNotifications } from '../hooks/usePushNotifications'
import { usePromptSlot } from '../context/PromptSlotContext'

const DISMISSED_KEY = 'kaira_push_prompt_dismissed'
// Browser-level "blocked" is permanent until the shopper changes it in
// their browser settings, so remember the dismissal across sessions
// (localStorage) instead of just this tab (sessionStorage) — otherwise
// this nags on every visit with nothing new to say.
const BLOCKED_DISMISSED_KEY = 'kaira_push_blocked_dismissed'

export function NotificationPermissionPrompt() {
  const { permission, isSubscribing, enableNotifications } = usePushNotifications()
  const { isActive, activePrompt, claim, release } = usePromptSlot('notification')
  const [wantsToShow, setWantsToShow] = useState(false)
  const isBlocked = permission === 'denied'

  useEffect(() => {
    if (permission === 'unsupported' || permission === 'granted') {
      setWantsToShow(false)
      release()
      localStorage.removeItem(BLOCKED_DISMISSED_KEY)
      return
    }

    if (permission === 'denied') {
      if (localStorage.getItem(BLOCKED_DISMISSED_KEY)) return
      const timer = setTimeout(() => setWantsToShow(true), 3500)
      return () => clearTimeout(timer)
    }

    if (sessionStorage.getItem(DISMISSED_KEY)) return

    // Let the page settle before asking — a prompt that appears the instant
    // the site loads reads as spammy and gets reflexively dismissed.
    const timer = setTimeout(() => setWantsToShow(true), 3500)
    return () => clearTimeout(timer)
  }, [permission])

  // Lower priority than the Google sign-in prompt — keep retrying the
  // shared slot so this appears right after Google's is dismissed/handled,
  // instead of stacking on top of it.
  useEffect(() => {
    if (wantsToShow) claim()
  }, [wantsToShow, activePrompt, claim])

  useEffect(() => () => release(), [release])

  function handleDismiss() {
    setWantsToShow(false)
    release()
    if (isBlocked) {
      localStorage.setItem(BLOCKED_DISMISSED_KEY, 'true')
    } else {
      sessionStorage.setItem(DISMISSED_KEY, 'true')
    }
  }

  async function handleEnable() {
    const success = await enableNotifications()
    if (success) {
      setWantsToShow(false)
      release()
    }
  }

  const isVisible = wantsToShow && isActive

  if (!isVisible) return null

  return createPortal(
    <div className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:left-auto z-[990] flex justify-center sm:justify-end animate-pill-float-up pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="pointer-events-auto w-full max-w-[380px] bg-white text-black rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] border border-black/10 relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-black/[0.03] blur-2xl" />

        {/* Absolute Dismiss cross top-right */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="tap-press absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} />
        </button>

        {/* Content row with Bell icon */}
        <div className="flex items-start gap-3 pr-7">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-b from-neutral-100 to-neutral-200 text-black border border-black/10 shadow-inner">
            {isBlocked ? (
              <HugeiconsIcon icon={BellOffIcon} size={22} />
            ) : (
              <>
                <HugeiconsIcon icon={Notification03Icon} size={22} className="animate-[wiggle_1.2s_ease-in-out_infinite]" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 ring-2 ring-white" />
                </span>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-black text-black tracking-tight leading-snug">
              {isBlocked ? 'Notifications are blocked' : 'Allow Notifications?'}
            </h4>
            <p className="text-[11px] sm:text-xs text-black/60 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">
              {isBlocked
                ? "You've blocked notifications for this site in your browser, so we can't alert you about price drops or order updates."
                : 'Get real-time alerts for price drops, limited restocks, and order delivery status.'}
            </p>
          </div>
        </div>

        {isBlocked && (
          <div className="mt-2.5 pt-2.5 border-t border-black/10 text-[11px] sm:text-xs text-black/70 leading-relaxed">
            To turn them back on: click the <span className="font-bold">lock icon</span> next to the
            address bar → <span className="font-bold">Notifications</span> → <span className="font-bold">Allow</span>,
            then refresh this page.
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3">
          {!isBlocked && (
            <button
              type="button"
              onClick={handleEnable}
              disabled={isSubscribing}
              className="tap-press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-3.5 py-2 sm:py-2.5 text-xs font-black text-white hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-60 shadow-md active:scale-95"
            >
              <HugeiconsIcon icon={Notification03Icon} size={14} />
              <span>{isSubscribing ? 'Allowing…' : 'Allow Notifications'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className={
              isBlocked
                ? 'tap-press flex-1 inline-flex items-center justify-center rounded-xl bg-black/5 px-3.5 py-2 sm:py-2.5 text-xs font-bold text-black hover:bg-black/10 transition-colors cursor-pointer active:scale-95'
                : 'tap-press px-3.5 py-2 sm:py-2.5 text-xs font-bold text-black/50 hover:text-black transition-colors cursor-pointer rounded-xl hover:bg-black/5 active:scale-95'
            }
          >
            {isBlocked ? 'Got it' : 'Later'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
