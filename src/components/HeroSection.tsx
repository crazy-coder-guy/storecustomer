import { LiquidButton } from './LiquidButton'
import { Reveal } from './Reveal'
import bannerImg from '../assets/banner.png'
import { useStorefrontSettings } from '../hooks/queries'

interface HeroSectionProps {
  onShopClick?: () => void
}

export function HeroSection({ onShopClick }: HeroSectionProps) {
  const { data: settings } = useStorefrontSettings()
  const heroTitle = settings?.heroTitle || 'Modern Essentials for Everyday Style'
  const heroSubtitle =
    settings?.heroSubtitle ||
    'Discover refined apparel crafted with exceptional fabrics and minimal aesthetics. Designed by Kaiira.'

  return (
    <section className="relative overflow-hidden bg-white pt-4 pb-2 sm:py-6 lg:py-8">
      <div className="kaira-container">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-2 lg:items-center">
          <Reveal animation="fade-right" duration={800} className="space-y-4 sm:space-y-6 lg:space-y-7">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-black/15 bg-white px-4 py-1.5 text-xs sm:text-sm font-bold text-black shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-black animate-pulse" />
              <span>New Season Collection</span>
            </div>
            <h1 className="text-4xl xs:text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-black leading-[1.08] sm:leading-[1.05]">
              {heroTitle}
            </h1>
            <p className="text-base sm:text-xl lg:text-2xl text-black/75 max-w-2xl font-medium leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-1 sm:pt-2">
              <LiquidButton
                href="/products"
                onClick={onShopClick}
                variant="primary"
                className="w-full sm:w-auto"
              >
                Shop New Arrivals
              </LiquidButton>
              <LiquidButton
                href="#categories"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Explore Categories
              </LiquidButton>
            </div>
          </Reveal>

          {/* Hero Banner Image */}
          <Reveal animation="fade-left" duration={900} delay={150} className="relative overflow-hidden">
            <img
              src={bannerImg}
              alt="Kaiira Fashion Banner"
              className="w-full h-auto object-contain max-w-full"
            />
            {/* Bottom White Linear Gradient Fade Out */}
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
