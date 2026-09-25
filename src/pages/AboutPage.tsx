import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { VelocityScroll } from '../components/VelocityScroll'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle02Icon,
  GlobeIcon,
  SparklesIcon,
  PackageIcon,
} from '@hugeicons/core-free-icons'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        {/* Top Navbar */}
        <Navbar />

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-12 sm:py-20 lg:py-24">
          <div className="kaira-container">
            <div className="max-w-4xl space-y-6">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-black/15 bg-gray-50 px-4 py-1.5 text-xs sm:text-sm font-semibold text-black">
                <HugeiconsIcon icon={SparklesIcon} size={16} />
                <span>Our Story & Philosophy</span>
              </div>

              <h1 className="text-4xl font-black tracking-tight text-black sm:text-6xl lg:text-7xl leading-[1.08]">
                Crafting Timeless Essentials for the Modern Wardrobe.
              </h1>

              <p className="text-lg sm:text-2xl text-black/75 font-medium leading-relaxed max-w-3xl">
                Founded on the belief that everyday clothing should combine quiet luxury, sustainable craftsmanship, and effortless comfort.
              </p>
            </div>
          </div>
        </section>

        {/* Brand Image Banner Section */}
        <section className="relative kaira-container pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="overflow-hidden rounded-2xl border border-black/10 shadow-lg">
              <img
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop"
                alt="Kaiira Studio Workshop"
                className="w-full h-80 sm:h-96 md:h-[450px] object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black text-black">
                Designed in Minimal Tones. Built to Last.
              </h2>
              <p className="text-base sm:text-lg text-black/75 leading-relaxed">
                At Kaiira, we eliminate unnecessary clutter. Every seam, cut, and fabric choice is engineered to offer unmatched durability and effortless aesthetic harmony.
              </p>
              <p className="text-base sm:text-lg text-black/75 leading-relaxed">
                We work directly with certified organic cotton mills and ethical artisans across the globe to guarantee transparent sourcing and zero-compromise quality.
              </p>
              <div className="pt-2">
                <LiquidButton href="/#shop" variant="primary">
                  Explore The Collection
                </LiquidButton>
              </div>
            </div>
          </div>
        </section>

        {/* Velocity Text Ticker */}
        <VelocityScroll text="SUSTAINABLE MATERIALS • ETHICAL CRAFTSMANSHIP • TIMELESS SILHOUETTES • ZERO WASTE PACKAGING • DESIGNED BY KAIIRA •" />

        {/* Core Values Grid */}
        <section className="py-20 bg-gray-50/50">
          <div className="kaira-container">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-5xl font-black text-black">Our Core Pillars</h2>
              <p className="text-base sm:text-lg text-black/70">
                The standard that defines every garment we create at Kaiira.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="rounded-2xl border border-black/10 bg-white p-8 space-y-4 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={24} />
                </div>
                <h3 className="text-xl font-bold text-black">100% Organic Cotton</h3>
                <p className="text-sm text-black/70 leading-relaxed">
                  Sourced exclusively from certified organic farmers using zero synthetic pesticides or harmful dyes.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-8 space-y-4 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <HugeiconsIcon icon={SparklesIcon} size={24} />
                </div>
                <h3 className="text-xl font-bold text-black">Precision Tailoring</h3>
                <p className="text-sm text-black/70 leading-relaxed">
                  Engineered with double-stitched hems and drop-shoulder silhouettes for a flattering, relaxed fit.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-8 space-y-4 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <HugeiconsIcon icon={GlobeIcon} size={24} />
                </div>
                <h3 className="text-xl font-bold text-black">Ethical Production</h3>
                <p className="text-sm text-black/70 leading-relaxed">
                  Partnering only with Fair-Trade certified facilities providing safe conditions and living wages.
                </p>
              </div>

              <div className="rounded-2xl border border-black/10 bg-white p-8 space-y-4 shadow-2xs hover:shadow-md transition-shadow">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                  <HugeiconsIcon icon={PackageIcon} size={24} />
                </div>
                <h3 className="text-xl font-bold text-black">Express Shipping</h3>
                <p className="text-sm text-black/70 leading-relaxed">
                  Carbon-neutral worldwide shipping with plastic-free, recyclable packaging on every order.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Numbers Stats Section */}
        <section className="py-16 bg-black text-white">
          <div className="kaira-container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/10">
              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black">50K+</div>
                <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider font-semibold">Worldwide Customers</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black">100%</div>
                <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider font-semibold">Organic Fabrics</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black">35+</div>
                <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider font-semibold">Global Stockists</div>
              </div>
              <div className="space-y-1">
                <div className="text-4xl sm:text-6xl font-black">4.9/5</div>
                <div className="text-xs sm:text-sm text-white/70 uppercase tracking-wider font-semibold">Average Rating</div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
