import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, ArrowRight01Icon, Share01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons'
import { usePromptSlot } from '../context/PromptSlotContext'

const DISMISSED_KEY = 'kaiira_install_prompt_dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallMode = 'native' | 'ios-manual' | 'android-manual'

function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = window.navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function detectPlatform(): 'ios' | 'android' | 'other' {
  const ua = window.navigator.userAgent
  // iPadOS 13+ reports as "Macintosh" but is touch-capable, unlike a real Mac.
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
  if (isIOS) return 'ios'
  if (/Android/.test(ua)) return 'android'
  return 'other'
}

export function InstallAppPrompt() {
  const { isActive, activePrompt, claim, release } = usePromptSlot('install')
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [mode, setMode] = useState<InstallMode | null>(null)
  const [wantsToShow, setWantsToShow] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)

  // iOS and some Android browsers never fire beforeinstallprompt at all, so
  // this only relies on that event for the browsers that actually support
  // it (mainly Chromium) — everyone else still gets the popover, just with
  // manual "here's how" instructions instead of a one-tap install button.
  useEffect(() => {
    if (isRunningStandalone() || localStorage.getItem(DISMISSED_KEY)) return

    const platform = detectPlatform()

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setMode('native')
    }

    function handleAppInstalled() {
      localStorage.setItem(DISMISSED_KEY, 'true')
      setWantsToShow(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    let fallbackTimer: ReturnType<typeof setTimeout> | undefined
    if (platform === 'ios') {
      // No install API exists on iOS at all — go straight to instructions.
      setMode('ios-manual')
    } else if (platform === 'android') {
      // Give beforeinstallprompt a chance to fire first (real one-tap
      // install is the better experience where it's supported); fall back
      // to manual instructions if it doesn't show up in time.
      fallbackTimer = setTimeout(() => {
        setMode((current) => current ?? 'android-manual')
      }, 2500)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      if (fallbackTimer) clearTimeout(fallbackTimer)
    }
  }, [])

  useEffect(() => {
    if (!mode) return
    // Let the page settle before asking — same reasoning as the other
    // floating prompts, and it also gives the higher-priority ones (Google
    // sign-in, notifications) first crack at the shared slot.
    const timer = setTimeout(() => setWantsToShow(true), 5000)
    return () => clearTimeout(timer)
  }, [mode])

  // Lowest priority of the three floating prompts — keeps retrying the
  // shared slot so this only appears once Google sign-in and the
  // notification prompt are dismissed/handled, never stacked on them.
  useEffect(() => {
    if (wantsToShow) claim()
  }, [wantsToShow, activePrompt, claim])

  useEffect(() => () => release(), [release])

  function handleDismiss() {
    setWantsToShow(false)
    release()
    localStorage.setItem(DISMISSED_KEY, 'true')
  }

  async function handleInstall() {
    if (!deferredPrompt || isInstalling) return
    setIsInstalling(true)
    try {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === 'accepted') {
        localStorage.setItem(DISMISSED_KEY, 'true')
      }
      setWantsToShow(false)
      release()
      setDeferredPrompt(null)
    } finally {
      setIsInstalling(false)
    }
  }

  const isVisible = wantsToShow && isActive && mode !== null

  if (!isVisible) return null

  return createPortal(
    <div className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 sm:left-auto z-[990] flex justify-center sm:justify-end animate-pill-float-up pointer-events-none pb-[env(safe-area-inset-bottom,0px)]">
      <div className="pointer-events-auto w-full max-w-[380px] bg-white text-black rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,0,0,0.06)] border border-black/10 relative overflow-hidden backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-black/[0.03] blur-2xl" />

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Close"
          className="tap-press absolute top-2.5 right-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full text-black/40 hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} />
        </button>

        <div className="flex items-start gap-3 pr-7">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl border border-black/10 shadow-inner overflow-hidden bg-black">
            <img src="/icon-192.png" alt="" className="h-full w-full object-cover" />
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-sm sm:text-base font-black text-black tracking-tight leading-snug">
              Install the Kaiira App
            </h4>
            <p className="text-[11px] sm:text-xs text-black/60 mt-0.5 sm:mt-1 leading-snug sm:leading-relaxed">
              Add Kaiira to your home screen for a faster, full-screen shopping experience — no browser tabs needed.
            </p>
          </div>
        </div>

        {mode === 'ios-manual' && (
          <div className="mt-2.5 pt-2.5 border-t border-black/10 text-[11px] sm:text-xs text-black/70 leading-relaxed flex items-center gap-2">
            <HugeiconsIcon icon={Share01Icon} size={16} className="shrink-0" />
            <span>
              Tap the <span className="font-bold">Share</span> icon in Safari's toolbar, then choose{' '}
              <span className="font-bold">Add to Home Screen</span>.
            </span>
          </div>
        )}

        {mode === 'android-manual' && (
          <div className="mt-2.5 pt-2.5 border-t border-black/10 text-[11px] sm:text-xs text-black/70 leading-relaxed flex items-center gap-2">
            <HugeiconsIcon icon={MoreVerticalIcon} size={16} className="shrink-0" />
            <span>
              Tap your browser's <span className="font-bold">menu</span>, then choose{' '}
              <span className="font-bold">Add to Home screen</span> or <span className="font-bold">Install app</span>.
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 mt-3">
          {mode === 'native' ? (
            <button
              type="button"
              onClick={handleInstall}
              disabled={isInstalling}
              className="tap-press flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-3.5 py-2 sm:py-2.5 text-xs font-black text-white hover:bg-neutral-800 transition-all cursor-pointer disabled:opacity-60 shadow-md active:scale-95"
            >
              <span>{isInstalling ? 'Installing…' : 'Install App'}</span>
              {!isInstalling && <HugeiconsIcon icon={ArrowRight01Icon} size={14} />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDismiss}
              className="tap-press flex-1 inline-flex items-center justify-center rounded-xl bg-black px-3.5 py-2 sm:py-2.5 text-xs font-black text-white hover:bg-neutral-800 transition-all cursor-pointer active:scale-95"
            >
              Got it
            </button>
          )}
          {mode === 'native' && (
            <button
              type="button"
              onClick={handleDismiss}
              className="tap-press px-3.5 py-2 sm:py-2.5 text-xs font-bold text-black/50 hover:text-black transition-colors cursor-pointer rounded-xl hover:bg-black/5 active:scale-95"
            >
              Later
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
