interface KairaLogoProps {
  className?: string
  height?: number
  animated?: boolean
}

export function KairaLogo({ className = 'h-7 sm:h-9 text-black', height = 36, animated = false }: KairaLogoProps) {
  return (
    <svg
      viewBox="0 0 236 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${animated ? 'kaira-logo-animated' : ''}`}
      style={{ height: `${height}px`, width: 'auto' }}
      aria-label="Kaiira Logo"
    >
      {/* K */}
      <path
        d="M10 8V36M32 8L11 22L32 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'kaira-letter-path kaira-path-1' : ''}
      />

      {/* A (Minimalist Crossbar-less Lambda Accent) */}
      <path
        d="M48 36L64 8L80 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'kaira-letter-path kaira-path-2' : ''}
      />

      {/* I */}
      <path
        d="M96 8V36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        className={animated ? 'kaira-letter-path kaira-path-3' : ''}
      />

      {/* I */}
      <path
        d="M112 8V36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        className={animated ? 'kaira-letter-path kaira-path-4' : ''}
      />

      {/* R (Futuristic Curved R) */}
      <path
        d="M128 36V8H148C158 8 158 22 148 22H128M141 22C148 22 153 27 157 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'kaira-letter-path kaira-path-5' : ''}
      />

      {/* A (Matching Accent Lambda) */}
      <path
        d="M172 36L188 8L204 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'kaira-letter-path kaira-path-6' : ''}
      />
    </svg>
  )
}
