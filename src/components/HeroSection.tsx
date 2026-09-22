import { LiquidButton } from './LiquidButton'
import bannerImg from '../assets/banner.png'

interface HeroSectionProps {
  onShopClick?: () => void
}

export function HeroSection({ onShopClick }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-white py-2 sm:py-4 lg:py-6">
      <div className="kaira-container">
        <div className="grid grid-cols-1 gap-2 sm:gap-4 lg:gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5 sm:space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-3.5 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-semibold text-black shadow-2xs">
              <span>New Season Collection</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-8xl leading-[1.06] sm:leading-[1.05]">
              Modern Essentials for Everyday Style
            </h1>
            <p className="text-lg text-black/80 sm:text-2xl max-w-2xl font-medium leading-relaxed">
              Discover refined apparel crafted with exceptional fabrics and minimal aesthetics. Designed by Kaira.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 pt-2 sm:pt-3">
              <LiquidButton
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
          </div>

          {/* Hero Banner Image */}
          <div className="relative overflow-hidden">
            <img
              src={bannerImg}
              alt="Kaira Fashion Banner"
              className="w-full h-auto object-contain max-w-full"
            />
            {/* Bottom White Linear Gradient Fade Out */}
            <div className="absolute inset-x-0 bottom-0 h-24 sm:h-36 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
