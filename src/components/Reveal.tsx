import type { ReactNode } from 'react'

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
  strength?: 'normal' | 'soft'
}

export function Reveal({
  children,
  className = '',
}: RevealProps) {
  return <div className={className}>{children}</div>
}

