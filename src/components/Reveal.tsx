import { useEffect, useRef, useState, type ReactNode } from 'react'

export type AosAnimation =
  | 'fade-up'
  | 'fade-down'
  | 'fade-left'
  | 'fade-right'
  | 'zoom-in'
  | 'fade'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  animation?: AosAnimation
  once?: boolean
  /** Backward-compatible prop with previous simple reveal */
  strength?: 'normal' | 'soft'
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Reveal({
  children,
  className = '',
  delay = 0,
  duration = 750,
  animation = 'fade-up',
  once = true,
  strength,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(prefersReducedMotion)

  useEffect(() => {
    if (prefersReducedMotion) return
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (once) {
            observer.unobserve(node)
          }
        } else if (!once) {
          setIsVisible(false)
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -6% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once])

  // Map animation style to AOS classes
  const animClass = strength === 'soft' ? 'aos-fade-up-soft' : `aos-${animation}`

  return (
    <div
      ref={ref}
      className={`aos-init ${animClass} ${isVisible ? 'aos-animate' : ''} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: isVisible ? `${delay}ms` : '0ms',
      }}
    >
      {children}
    </div>
  )
}
