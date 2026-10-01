import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { useSeoMeta } from '../hooks/useSeoMeta'

export function NotFoundPage() {
  useSeoMeta({
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist.',
    robots: 'noindex, follow',
  })

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between selection:bg-black selection:text-white font-sans">
      <div>
        <Navbar />
        <main className="py-24 sm:py-32 text-center max-w-md mx-auto px-4 space-y-5">
          <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tight leading-tight">404</h1>
          <p className="text-sm sm:text-base font-semibold text-black/60">
            This page doesn't exist or may have been moved.
          </p>
          <LiquidButton href="/" variant="primary" className="mx-auto">
            Back to Home
          </LiquidButton>
          <p className="text-xs text-black/40">
            Looking for a product?{' '}
            <Link to="/products" className="underline underline-offset-2 hover:text-black">
              Browse the shop
            </Link>
            .
          </p>
        </main>
      </div>
      <Footer />
    </div>
  )
}
