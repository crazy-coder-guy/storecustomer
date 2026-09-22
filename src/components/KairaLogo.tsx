interface KairaLogoProps {
  className?: string
  height?: number
}

export function KairaLogo({ className = 'h-7 sm:h-9 text-black', height = 36 }: KairaLogoProps) {
  return (
    <svg
      viewBox="0 0 220 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: `${height}px`, width: 'auto' }}
      aria-label="Kaira Logo"
    >
      {/* K */}
      <path
        d="M10 8V36M32 8L11 22L32 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* A (Minimalist Crossbar-less Lambda Accent) */}
      <path
        d="M48 36L64 8L80 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* I */}
      <path
        d="M96 8V36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
      />

      {/* R (Futuristic Curved R) */}
      <path
        d="M112 36V8H132C142 8 142 22 132 22H112M125 22C132 22 137 27 141 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* A (Matching Accent Lambda) */}
      <path
        d="M156 36L172 8L188 36"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
