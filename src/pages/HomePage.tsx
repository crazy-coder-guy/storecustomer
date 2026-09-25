import { Navbar } from '../components/Navbar'
import { HeroSection } from '../components/HeroSection'
import { IntroSection } from '../components/IntroSection'
import { TopSellingSection } from '../components/TopSellingSection'
import { CategoriesSection } from '../components/CategoriesSection'
import { VelocityScroll } from '../components/VelocityScroll'
import { Footer } from '../components/Footer'

export function HomePage() {
  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        {/* Top Navbar */}
        <Navbar />

        {/* Hero Section */}
        <main>
          <HeroSection />

          {/* Introducing The New Site / Premium Quality Section */}
          <IntroSection />

          {/* Top Selling T-Shirts Cards Section */}
          <TopSellingSection />
          {/* Velocity Scroll Marquee */}
          <VelocityScroll text="KAIIRA • MODERN ESSENTIALS • NEW SEASON COLLECTION • PREMIUM QUALITY • MINIMALIST APPAREL • EXPRESS SHIPPING •" />
          {/* Curated Category Showcase Section */}
          <CategoriesSection />
        </main>
      </div>

      <Footer />
    </div>
  )
}
