import { useEffect, useRef, useState } from 'react'

interface ScrollWipeKairaProps {
  className?: string
  subtitle?: string
}

export function ScrollWipeKaira({
  className = '',
  subtitle = 'Everyday essentials crafted with heavyweight fabric and clean design.',
}: ScrollWipeKairaProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [revealProgress, setRevealProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight || document.documentElement.clientHeight

      // Start wiping in when container top reaches near bottom of viewport (rect.top <= windowHeight)
      // Fully wipe in (100%) when container is well within view
      const startTrigger = windowHeight * 0.95
      const endTrigger = windowHeight * 0.35

      if (rect.top >= startTrigger) {
        setRevealProgress(0)
      } else if (rect.top <= endTrigger) {
        setRevealProgress(1)
      } else {
        const progress = (startTrigger - rect.top) / (startTrigger - endTrigger)
        setRevealProgress(Math.min(1, Math.max(0, progress)))
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Percentage for mask-image or clip-path wipe effect
  const wipePercentage = Math.round(revealProgress * 100)

  return (
    <section
      ref={containerRef}
      className={`relative w-full overflow-hidden select-none py-16 sm:py-24 border-t border-black/10 bg-white ${className}`}
    >
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12 flex flex-col items-center justify-center text-center">
        {/* Subtle Eyebrow */}
        <div
          className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-neutral-400 mb-4 sm:mb-6 transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, revealProgress * 1.5),
            transform: `translateY(${(1 - revealProgress) * 16}px)`,
          }}
        >
          Studio Edition • Premium Apparel
        </div>

        {/* Big Giant "KAIIRA" Typography with Smooth Horizontal/Vertical Wipe Mask */}
        <div className="relative w-full flex items-center justify-center overflow-hidden py-2 sm:py-4">
          {/* Base Background Ghost Outline / Faint Track */}
          <div
            className="text-[18vw] sm:text-[19vw] lg:text-[21vw] font-black tracking-tighter leading-none text-neutral-100 uppercase"
            aria-hidden="true"
          >
            KAIIRA
          </div>

          {/* Foreground Active Black Text that wipes across smoothly */}
          <div
            className="absolute inset-0 flex items-center justify-center text-[18vw] sm:text-[19vw] lg:text-[21vw] font-black tracking-tighter leading-none text-black uppercase transition-all duration-150 ease-out"
            style={{
              clipPath: `polygon(0 0, ${wipePercentage}% 0, ${wipePercentage}% 100%, 0 100%)`,
              WebkitClipPath: `polygon(0 0, ${wipePercentage}% 0, ${wipePercentage}% 100%, 0 100%)`,
            }}
          >
            KAIIRA
          </div>
        </div>

        {/* Subtitle / Micro tagline with smooth fade */}
        {subtitle && (
          <p
            className="mt-4 sm:mt-6 max-w-md text-xs sm:text-sm font-medium text-neutral-500 leading-relaxed transition-all duration-700 ease-out"
            style={{
              opacity: Math.min(1, Math.max(0, (revealProgress - 0.25) * 1.33)),
              transform: `translateY(${(1 - revealProgress) * 20}px)`,
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Social Media Channels directly under subtitle */}
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 ease-out"
          style={{
            opacity: Math.min(1, Math.max(0, (revealProgress - 0.35) * 1.5)),
            transform: `translateY(${(1 - revealProgress) * 20}px)`,
          }}
        >
          {/* Instagram */}
          <a
            href="https://www.instagram.com/hello.kaiiraofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 border border-black/10 text-black hover:bg-black hover:text-white hover:scale-110 transition-all cursor-pointer shadow-2xs group"
            title="Instagram"
            aria-label="Instagram"
          >
            <svg className="h-4 w-4 fill-current transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/hello.kaiiraofficia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 border border-black/10 text-black hover:bg-black hover:text-white hover:scale-110 transition-all cursor-pointer shadow-2xs group"
            title="Facebook"
            aria-label="Facebook"
          >
            <svg className="h-4 w-4 fill-current transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </a>

          {/* Threads */}
          <a
            href="https://www.threads.com/@hello.kaiiraofficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 border border-black/10 text-black hover:bg-black hover:text-white hover:scale-110 transition-all cursor-pointer shadow-2xs group"
            title="Threads"
            aria-label="Threads"
          >
            <i className="fa-brands fa-threads text-base transition-transform group-hover:scale-105" />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@hello.KaiiraOfficial"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 border border-black/10 text-black hover:bg-black hover:text-white hover:scale-110 transition-all cursor-pointer shadow-2xs group"
            title="YouTube"
            aria-label="YouTube"
          >
            <svg className="h-4 w-4 fill-current transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
