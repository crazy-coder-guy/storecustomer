import { useEffect, useRef } from 'react'

interface VelocityScrollProps {
  text?: string
  className?: string
  defaultVelocity?: number
}

export function VelocityScroll({
  text = 'KAIIRA • MODERN ESSENTIALS • NEW SEASON COLLECTION • PREMIUM QUALITY • MINIMALIST APPAREL • EXPRESS SHIPPING •',
  className = '',
  defaultVelocity = 1.2,
}: VelocityScrollProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const velocityRef = useRef(defaultVelocity)
  const targetVelocityRef = useRef(defaultVelocity)
  const lastScrollYRef = useRef(0)
  const scrollTimeoutRef = useRef<number | null>(null)
  const animFrameIdRef = useRef<number | null>(null)

  useEffect(() => {
    lastScrollYRef.current = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const deltaY = currentScrollY - lastScrollYRef.current
      lastScrollYRef.current = currentScrollY

      if (Math.abs(deltaY) > 0.5) {
        // When scrolling down, deltaY > 0 -> targetVelocity is positive (moving left)
        // When scrolling up, deltaY < 0 -> targetVelocity is negative (moving right)
        const direction = deltaY > 0 ? 1 : -1
        const speedBoost = Math.min(Math.abs(deltaY) * 0.45, 12)
        targetVelocityRef.current = direction * (defaultVelocity + speedBoost)

        if (scrollTimeoutRef.current) {
          window.clearTimeout(scrollTimeoutRef.current)
        }

        // Return gracefully to default idle drift when scrolling settles
        scrollTimeoutRef.current = window.setTimeout(() => {
          targetVelocityRef.current = defaultVelocity
        }, 150)
      }
    }

    const animate = () => {
      // Smooth interpolation (lerp) toward target velocity
      velocityRef.current += (targetVelocityRef.current - velocityRef.current) * 0.1

      offsetRef.current -= velocityRef.current

      if (contentRef.current) {
        // Reset seamlessly when half the duplicated content width is passed
        const halfWidth = contentRef.current.scrollWidth / 2
        if (halfWidth > 0) {
          if (offsetRef.current <= -halfWidth) {
            offsetRef.current += halfWidth
          } else if (offsetRef.current >= 0) {
            offsetRef.current -= halfWidth
          }
        }
        contentRef.current.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`
      }

      animFrameIdRef.current = requestAnimationFrame(animate)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    animFrameIdRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [defaultVelocity])

  // Repeated phrases to ensure dense content across all screen sizes
  const repeatedText = `${text} `.repeat(4)

  return (
    <div className={`relative w-full overflow-hidden bg-black py-4 sm:py-5 text-white select-none ${className}`}>
      <div
        ref={contentRef}
        className="flex w-max whitespace-nowrap will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)' }}
      >
        <span className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-widest px-4">
          {repeatedText}
        </span>
        <span className="text-xl sm:text-3xl lg:text-4xl font-black uppercase tracking-widest px-4" aria-hidden="true">
          {repeatedText}
        </span>
      </div>
    </div>
  )
}
