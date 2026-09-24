import { useEffect, useRef, useState, type ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  /** Slightly larger initial offset/scale for hero-scale elements. */
  strength?: 'normal' | 'soft'
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function Reveal({ children, className = '', delay = 0, strength = 'normal' }: RevealProps) {
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
          observer.unobserve(node)
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${strength === 'soft' ? 'reveal-soft' : ''} ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
