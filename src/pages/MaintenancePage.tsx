import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { KairaLogo } from '../components/KairaLogo'
import { useSeoMeta } from '../hooks/useSeoMeta'
import type { StorefrontSettings } from '../types'

interface MaintenancePageProps {
  settings?: StorefrontSettings | null
}

export function MaintenancePage({ settings }: MaintenancePageProps) {
  useSeoMeta({
    title: 'We\'re Upgrading Your Experience | KAIIRA',
    description: 'We are currently making improvements to elevate your shopping experience. We\'ll be back shortly.',
    robots: 'noindex, nofollow',
  })

  const queryClient = useQueryClient()

  // Background timer to trigger auto-unlock when expected time arrives
  useEffect(() => {
    if (!settings?.maintenanceUntil) return

    const targetTime = new Date(settings.maintenanceUntil).getTime()
    const diff = targetTime - Date.now()

    if (diff <= 0) {
      queryClient.invalidateQueries({ queryKey: ['storefront-settings'] })
      return
    }

    const timer = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['storefront-settings'] })
    }, diff + 500)

    return () => clearTimeout(timer)
  }, [settings?.maintenanceUntil, queryClient])

  // Periodic background check every 15s to detect if admin turned off maintenance early
  useEffect(() => {
    const pollInterval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['storefront-settings'] })
    }, 15000)
    return () => clearInterval(pollInterval)
  }, [queryClient])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-white selection:text-black font-sans">
      {/* Top Header with Brand Logo */}
      <header className="w-full px-6 py-12 flex items-center justify-center">
        <KairaLogo className="h-8 sm:h-10 text-white" height={36} animated={false} />
      </header>

      {/* Main Minimalist Message */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-xl w-full text-center space-y-5">
          <h1 className="text-3xl sm:text-5xl font-light tracking-tight text-white leading-tight">
            We&apos;re Upgrading Your Experience
          </h1>

          <p className="text-sm sm:text-base text-neutral-400 font-normal leading-relaxed max-w-md mx-auto">
            {settings?.maintenanceNotice ||
              "We are currently making improvements to elevate your shopping experience. We'll be back shortly."}
          </p>
        </div>
      </main>

      {/* Minimal Footer Support Info */}
      <footer className="py-8 px-6 text-center text-xs text-neutral-500 space-y-2">
        <p>
          Need urgent assistance with an active order? Reach us at{' '}
          <a
            href="mailto:hello.kaiiraofficial@gmail.com"
            className="text-neutral-300 hover:text-white underline underline-offset-4 transition-colors font-medium"
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
