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
    <section className="relative overflow-hidden bg-black text-white py-16 sm:py-24">
      <div className="kaira-container">
        <Reveal className="max-w-3xl mx-auto text-center space-y-5 mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-4 py-1.5 text-xs sm:text-sm font-semibold text-white/80">
            <HugeiconsIcon icon={SparklesIcon} size={16} />
            <span>Introducing Kaiira 2.0</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            A New Home For Premium Essentials.
          </h2>

          <p className="text-base sm:text-xl text-white/70 font-medium leading-relaxed max-w-2xl mx-auto">
            We've rebuilt the experience from the ground up — meticulously tailored fits, museum-grade
            fabrics, and a shopping journey as refined as the clothes themselves.
          </p>

          <div className="pt-2 flex justify-center">
            <LiquidButton href="/products" variant="outline" className="!border-white">
              Discover The Collection
            </LiquidButton>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PILLARS.map((pillar, idx) => (
            <Reveal key={pillar.title} delay={idx * 90} strength="soft">
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7 space-y-3 sm:space-y-4 hover:bg-white/[0.06] hover:border-white/20 transition-colors">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white text-black">
                  <HugeiconsIcon icon={pillar.icon} size={22} />
                </div>
                <h3 className="text-sm sm:text-lg font-bold text-white">{pillar.title}</h3>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{pillar.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
