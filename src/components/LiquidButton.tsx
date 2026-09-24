import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

interface LiquidButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'outline'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  /** Shows a left-to-right progress fill + spinner while a backend request is in flight. */
  isLoading?: boolean
}

export function LiquidButton({
  children,
  onClick,
  href,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled = false,
  isLoading = false,
}: LiquidButtonProps) {
  const isPrimary = variant === 'primary'

  const content = (
    <>
      {/* Liquid Fill Overlay (hover-only affordance, paused while loading) */}
      {!isLoading && (
        <span
          className={`absolute inset-0 translate-y-full rounded-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 ${
            isPrimary ? 'bg-white' : 'bg-black'
          }`}
        />
      )}

      {/* Waiting-for-backend fill: slides left → right while a request is in
          flight, easing toward (not all the way to) full so it never looks
          "stuck" on a slow response — the button's real end state takes over
          the instant the request resolves. */}
      <span
        className={`absolute inset-y-0 left-0 rounded-2xl transition-[width] ease-out ${isPrimary ? 'bg-white/25' : 'bg-black/10'}`}
        style={{ width: isLoading ? '92%' : '0%', transitionDuration: isLoading ? '1600ms' : '0ms' }}
      />

      {/* Button Content */}
      <div className="relative z-10 flex items-center justify-between gap-4 w-full">
        {/* Text moving smoothly to the left */}
        <span
          className={`whitespace-nowrap font-extrabold text-sm sm:text-base tracking-wide transition-all duration-300 ease-out group-hover:-translate-x-1 ${
            isPrimary
              ? 'text-white group-hover:text-black'
              : 'text-black group-hover:text-white'
          }`}
        >
          {children}
        </span>

        {/* Opposite Color Circle with Right Arrow (or spinner while loading) */}
        <span
          className={`flex h-9 w-9 sm:h-9.5 sm:w-9.5 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105 ${
            isPrimary
              ? 'bg-white text-black group-hover:bg-black group-hover:text-white'
              : 'bg-black text-white group-hover:bg-white group-hover:text-black'
          }`}
        >
          {isLoading ? (
            <span className="h-4 w-4 rounded-full border-2 border-current/25 border-t-current animate-spin" />
          ) : (
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2.4} />
          )}
        </span>
      </div>
    </>
  )

  const baseClasses = `group tap-press relative inline-flex items-center justify-between overflow-hidden rounded-2xl border border-black pl-6 pr-2.5 py-2.5 sm:pl-8 sm:pr-3 sm:py-3 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer select-none ${
    isPrimary ? 'bg-black text-white' : 'bg-white text-black'
  } ${className}`

  if (href) {
    // Same-page hash anchors (e.g. "#categories") just scroll — no routing
    // needed. Everything else is an in-app route, so it goes through
    // react-router's Link to avoid a full page reload.
    if (href.startsWith('#')) {
      return (
        <a href={href} className={baseClasses}>
          {content}
        </a>
      )
    }

    return (
      <Link to={href} className={baseClasses}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`${baseClasses} disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-sm ${isLoading ? '!cursor-wait !opacity-100' : ''}`}
    >
      {content}
    </button>
  )
}
