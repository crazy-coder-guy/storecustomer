import { KairaLogo } from './KairaLogo'

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-black text-white pt-16 pb-12">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 pb-12 border-b border-white/10">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <a href="/" className="inline-block">
              <KairaLogo className="h-7 text-white" height={30} />
            </a>
            <p className="text-sm text-white/70 max-w-sm leading-relaxed">
              Kaira delivers modern apparel essentials crafted with premium fabrics and minimal aesthetics for everyday confidence.
            </p>
            <div className="text-xs text-white/40 pt-2">
              © {new Date().getFullYear()} Kaira Apparel Inc. All rights reserved.
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Shop</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/#new-arrivals" className="hover:text-white transition-colors">New Arrivals</a></li>
              <li><a href="/#shop" className="hover:text-white transition-colors">T-Shirts & Tops</a></li>
              <li><a href="/#categories" className="hover:text-white transition-colors">Outerwear</a></li>
              <li><a href="/#categories" className="hover:text-white transition-colors">Accessories</a></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Company</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="/about" className="hover:text-white transition-colors">About Kaira</a></li>
              <li><a href="/about#sustainability" className="hover:text-white transition-colors">Sustainability</a></li>
              <li><a href="/about#careers" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="/about#press" className="hover:text-white transition-colors">Press & Media</a></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-white transition-colors">Order Tracking</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Size Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/50 gap-4">
          <div>Privacy Policy • Terms of Service • Security</div>
          <div>Designed for Kaira • Pure Modern Aesthetics</div>
        </div>
      </div>
    </footer>
  )
}
