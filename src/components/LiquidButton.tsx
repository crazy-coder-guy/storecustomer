import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

interface LiquidButtonProps {
  children: ReactNode
  onClick?: () => void
  href?: string
  variant?: 'primary' | 'outline'
  className?: string
}

export function LiquidButton({
  children,
  onClick,
  href,
  variant = 'primary',
  className = '',
}: LiquidButtonProps) {
  const isPrimary = variant === 'primary'

  const content = (
    <>
      {/* Liquid Fill Overlay */}
      <span
        className={`absolute inset-0 translate-y-full rounded-full transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 ${
          isPrimary ? 'bg-white' : 'bg-black'
        }`}
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

        {/* Opposite Color Circle with Right Arrow */}
        <span
          className={`flex h-9 w-9 sm:h-9.5 sm:w-9.5 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 group-hover:scale-105 ${
            isPrimary
              ? 'bg-white text-black group-hover:bg-black group-hover:text-white'
              : 'bg-black text-white group-hover:bg-white group-hover:text-black'
          }`}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={2.4} />
        </span>
      </div>
    </>
  )

  const baseClasses = `group relative inline-flex items-center justify-between overflow-hidden rounded-full border border-black pl-6 pr-2.5 py-2.5 sm:pl-8 sm:pr-3 sm:py-3 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer select-none ${
    isPrimary ? 'bg-black text-white' : 'bg-white text-black'
  } ${className}`

  if (href) {
    return (
      <a href={href} className={baseClasses}>
        {content}
      </a>
    )
  }

  return (
    <button type="button" onClick={onClick} className={baseClasses}>
      {content}
    </button>
  )
}
