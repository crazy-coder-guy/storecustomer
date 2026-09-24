import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { Cancel01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'
import { useAuth } from '../context/AuthContext'

export function GoogleOneTapPrompt() {
  const { user, isLoading, signInWithGoogle } = useAuth()
  const [isVisible, setIsVisible] = useState(false)
  const [isSigningIn, setIsSigningIn] = useState(false)

  useEffect(() => {
    // If auth is still checking or user is already signed in, don't show
    if (isLoading || user) {
      setIsVisible(false)
      return
    }

    // Check if user dismissed it in this session
    const dismissed = sessionStorage.getItem('kaira_google_onetap_dismissed')
    if (dismissed) {
      return
    }

    // Delay prompt slightly (1.2s) so page finishes initial mount smoothly
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1200)

    return () => clearTimeout(timer)
  }, [user, isLoading])

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('kaira_google_onetap_dismissed', 'true')
  }

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signInWithGoogle()
      setIsVisible(false)
    } catch {
      // User closed popup or cancelled
    } finally {
      setIsSigningIn(false)
    }
  }

  if (!isVisible || user) return null

  return createPortal(
    <aside
      aria-label="Google Sign-In Prompt"
      className="fixed top-4 right-4 sm:top-5 sm:right-6 z-[990] w-[calc(100vw-2rem)] sm:w-[380px] rounded-3xl bg-white/95 backdrop-blur-xl text-black border border-black/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18),0_0_0_1px_rgba(0,0,0,0.03)] p-5 animate-butter-slide transition-all select-none font-sans"
    >
      {/* Top Header: Official Google Badge & Clean Dismiss */}
      <div className="flex items-center justify-between pb-3.5 border-b border-black/10">
        <div className="flex items-center gap-2.5">
          {/* Authentic Google "G" logo container */}
          <div className="h-7 w-7 rounded-full bg-white shadow-xs border border-black/10 flex items-center justify-center shrink-0">
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-black">
              Sign in with Google
            </span>
            <span className="text-xs font-medium text-black/50">
              Secure 1-tap authentication
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="h-7 w-7 rounded-full flex items-center justify-center text-black/40 hover:text-black hover:bg-black/5 transition-all cursor-pointer"
          aria-label="Dismiss Sign-In Prompt"
        >
          <HugeiconsIcon icon={Cancel01Icon} size={15} />
        </button>
      </div>

      {/* Main Body (No All-Caps) */}
      <div className="py-4 space-y-1">
        <h4 className="text-lg font-black text-black tracking-tight leading-snug">
          Welcome to Kaira
        </h4>
        <p className="text-xs sm:text-sm font-medium text-black/60 leading-relaxed">
          Access your shopping bag, wishlist, and real-time order tracking instantly.
        </p>
      </div>

      {/* Primary Action Button (No All-Caps) */}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={isSigningIn}
        className="group relative w-full flex items-center justify-between rounded-2xl bg-black hover:bg-neutral-800 text-white px-5 py-3.5 text-xs sm:text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 active:scale-[0.98]"
      >
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center shrink-0">
            <svg className="h-3 w-3" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>
          <span>{isSigningIn ? 'Connecting…' : 'Continue with Google'}</span>
        </div>

        <span className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all">
          <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
        </span>
      </button>

      {/* Subtle Google Disclaimer */}
      <div className="pt-3 text-xs font-normal text-black/50 text-center leading-normal">
        <span>To continue, Google shares your profile and email with Kaira.</span>
      </div>
    </aside>,
    document.body
  )
}
