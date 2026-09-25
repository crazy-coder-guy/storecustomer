import { Reveal } from './Reveal'
import { LiquidButton } from './LiquidButton'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  SparklesIcon,
  CheckmarkCircle02Icon,
  PackageIcon,
  RefreshIcon,
} from '@hugeicons/core-free-icons'

const PILLARS = [
  {
    icon: SparklesIcon,
    title: 'Premium Fabric',
    description: 'Heavyweight, breathable cotton milled for a luxury hand-feel.',
  },
  {
    icon: CheckmarkCircle02Icon,
    title: 'Quality Assured',
    description: 'Every piece inspected twice before it ever reaches your door.',
  },
  {
    icon: PackageIcon,
    title: 'Express Delivery',
    description: 'Fast, reliable shipping nationwide with real-time tracking.',
  },
  {
    icon: RefreshIcon,
    title: 'Easy Returns',
    description: '7-day hassle-free returns and exchanges, no questions asked.',
  },
]

export function IntroSection() {
  return (
    <section className="relative overflow-hidden bg-white text-black py-16 sm:py-24 border-t border-black/5">
      <div className="kaira-container">
        {/* Editorial Header */}
        <Reveal className="max-w-3xl mx-auto text-center space-y-4 mb-14 sm:mb-16">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="w-8 sm:w-12 h-px bg-black/25" />
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-black/60">
              THE KAIIRA PHILOSOPHY
            </span>
            <span className="w-8 sm:w-12 h-px bg-black/25" />
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-black leading-[1.08]">
            Crafted For Longevity. Built For Everyday.
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-black/65 font-normal leading-relaxed max-w-2xl mx-auto pt-1">
            We focus on silhouette, weight, and minimalist aesthetics — creating timeless, durable garments
            that fit effortlessly into your everyday rotation.
          </p>

          <div className="pt-3 flex justify-center">
            <LiquidButton href="/products" variant="primary">
              Discover The Collection
            </LiquidButton>
          </div>
        </Reveal>

        {/* 4 Pillars - Refined Borderless Feature Strip */}
        <Reveal delay={120} strength="soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-0 lg:divide-x lg:divide-black/10 pt-6 sm:pt-8 border-t border-black/10">
            {PILLARS.map((pillar) => (
              <div
                key={pillar.title}
                className="flex flex-col items-center text-center lg:px-6 xl:px-8 space-y-2.5 group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black group-hover:bg-black group-hover:text-white transition-all duration-300">
                  <HugeiconsIcon icon={pillar.icon} size={20} strokeWidth={2} />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-black tracking-tight pt-1">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-black/60 leading-relaxed font-normal max-w-xs">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
