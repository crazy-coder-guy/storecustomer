import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/HeroSection'
import { TopSellingSection } from '../components/TopSellingSection'
import { VelocityScroll } from '../components/VelocityScroll'
import { Footer } from '../components/Footer'

export function HomePage() {
  const [cartCount, setCartCount] = useState(0)

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        {/* Top Navbar */}
        <Navbar
          cartCount={cartCount}
          onOpenCart={() => alert('Shopping bag clicked')}
        />

        {/* Hero Section */}
        <main>
          <HeroSection onShopClick={() => setCartCount((c) => c + 1)} />

          {/* Top Selling T-Shirts Cards Section */}
          <TopSellingSection onAddToCart={() => setCartCount((c) => c + 1)} />

          {/* Velocity Scroll Marquee */}
          <VelocityScroll text="KAIRA • MODERN ESSENTIALS • NEW SEASON COLLECTION • PREMIUM QUALITY • MINIMALIST APPAREL • EXPRESS SHIPPING •" />
        </main>
      </div>

      <Footer />
    </div>
  )
}
