import { useEffect, useState, useTransition } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { KairaLogo } from '../components/KairaLogo'
import { useSeoMeta } from '../hooks/useSeoMeta'
import type { StorefrontSettings } from '../types'

interface MaintenancePageProps {
  settings?: StorefrontSettings | null
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalMs: number
}

function calculateTimeRemaining(targetDateStr: string | null | undefined): TimeRemaining {
  if (!targetDateStr) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
  }
  const target = new Date(targetDateStr).getTime()
  const now = Date.now()
  const diff = target - now

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, totalMs: diff }
}

function padZero(num: number): string {
  return String(num).padStart(2, '0')
}

export function MaintenancePage({ settings }: MaintenancePageProps) {
  useSeoMeta({
    title: 'Scheduled Maintenance | KAIIRA',
    description: 'We are performing scheduled maintenance to enhance your shopping experience.',
    robots: 'noindex, nofollow',
  })

  const queryClient = useQueryClient()
  const [isChecking, startTransition] = useTransition()
  const [lastChecked, setLastChecked] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(settings?.maintenanceUntil)
  )

  // Live countdown ticker
  useEffect(() => {
    if (!settings?.maintenanceUntil) return

    const updateCountdown = () => {
      const remaining = calculateTimeRemaining(settings.maintenanceUntil)
      setTimeRemaining(remaining)

      // When countdown reaches 0, trigger a refresh to fetch updated status
      if (remaining.totalMs <= 0) {
        queryClient.invalidateQueries({ queryKey: ['storefront-settings'] })
      }
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [settings?.maintenanceUntil, queryClient])

  // Periodic background check every 20s to detect if admin turned off maintenance early
  useEffect(() => {
    const pollInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['storefront-settings'] })
    }, 20000)
    return () => clearInterval(pollInterval)
  }, [queryClient])

  const handleManualCheck = () => {
    startTransition(async () => {
      await queryClient.invalidateQueries({ queryKey: ['storefront-settings'] })
      await queryClient.refetchQueries({ queryKey: ['storefront-settings'] })
      const now = new Date()
      setLastChecked(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    })
  }

  const formattedTargetDate = settings?.maintenanceUntil
    ? new Date(settings.maintenanceUntil).toLocaleString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
      })
    : null

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-amber-400 selection:text-black font-sans relative overflow-hidden">
      {/* Ambient background lighting */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/10 rounded-full blur-[140px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-40 right-1/4 w-[500px] h-[400px] bg-amber-600/5 rounded-full blur-[120px]"
        aria-hidden="true"
      />

      {/* Top Bar with brand logo */}
      <header className="relative z-10 w-full px-6 py-8 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <KairaLogo className="h-7 sm:h-8 text-white" height={32} animated variant="draw-in" />
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-400/10 text-amber-300 border border-amber-400/20">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Maintenance Mode
        </div>
      </header>

      {/* Main Content Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* Status Icon & Header */}
          <div className="space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-xl text-amber-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 animate-spin-slow"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              We&apos;re Upgrading Your Experience
            </h1>

            <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto font-normal leading-relaxed">
              KAIIRA is currently undergoing scheduled platform updates to bring you improved performance, fresh
              collections, and a smoother checkout experience.
            </p>
          </div>

          {/* Admin Custom Notice (if set) */}
          {settings?.maintenanceNotice && (
            <div className="relative p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm max-w-lg mx-auto backdrop-blur-md">
              <div className="flex items-start gap-3 text-left">
                <span className="text-lg">📢</span>
                <div className="space-y-1">
                  <div className="text-xs font-bold tracking-wider uppercase text-amber-400">Notice from Store</div>
                  <p className="text-sm leading-relaxed text-amber-100">{settings.maintenanceNotice}</p>
                </div>
              </div>
            </div>
          )}

          {/* Countdown Display */}
          {settings?.maintenanceUntil ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
                Estimated Time Remaining
              </div>

              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                {/* Days */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
                  <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                    {padZero(timeRemaining.days)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-neutral-400 uppercase mt-1">
                    Days
                  </span>
                </div>

                {/* Hours */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
                  <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                    {padZero(timeRemaining.hours)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-neutral-400 uppercase mt-1">
                    Hours
                  </span>
                </div>

                {/* Minutes */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-md shadow-inner">
                  <span className="text-2xl sm:text-4xl font-extrabold text-white font-mono tracking-tight">
                    {padZero(timeRemaining.minutes)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-neutral-400 uppercase mt-1">
                    Mins
                  </span>
                </div>

                {/* Seconds */}
                <div className="flex flex-col items-center justify-center p-3 sm:p-5 rounded-2xl bg-white/[0.04] border border-amber-400/30 bg-amber-400/[0.03] backdrop-blur-md shadow-inner">
                  <span className="text-2xl sm:text-4xl font-extrabold text-amber-300 font-mono tracking-tight">
                    {padZero(timeRemaining.seconds)}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-amber-400 uppercase mt-1">
                    Secs
                  </span>
                </div>
              </div>

              {formattedTargetDate && (
                <div className="text-xs text-neutral-500 font-medium">
                  Expected Reopening: <span className="text-neutral-300 font-semibold">{formattedTargetDate}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Store access will automatically resume as soon as updates are complete.
            </div>
          )}

          {/* Action Button: Check Status */}
          <div className="pt-2 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleManualCheck}
              disabled={isChecking}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wide bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all shadow-lg hover:shadow-white/10 disabled:opacity-60 cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>{isChecking ? 'Checking Store Status...' : 'Check Status Now'}</span>
            </button>

            {lastChecked && (
              <p className="text-[11px] text-neutral-500">
                Last checked at {lastChecked} • Store is still in maintenance
              </p>
            )}
          </div>
        </div>
      </main>

      {/* Footer Support Info */}
      <footer className="relative z-10 border-t border-white/10 py-6 px-6 text-center text-xs text-neutral-400 space-y-2">
        <p>
          Need urgent assistance with an active order? Reach us directly at{' '}
          <a
            href="mailto:hello.kaiiraofficial@gmail.com"
            className="text-white hover:text-amber-300 underline underline-offset-4 transition-colors font-medium"
          >
            hello.kaiiraofficial@gmail.com
          </a>
        </p>
        <p className="text-[11px] text-neutral-600">
          &copy; {new Date().getFullYear()} KAIIRA. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
