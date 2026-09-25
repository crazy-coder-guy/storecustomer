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
      </div>
    </section>
  )
}
