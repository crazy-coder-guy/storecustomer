import { Link } from 'react-router-dom'
import { KairaLogo } from './KairaLogo'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  Mail01Icon,
} from '@hugeicons/core-free-icons'

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-neutral-950 text-white font-sans">
     

      {/* Main Footer Content */}
      <div className="mx-auto max-w-[1500px] px-4 sm:px-8 lg:px-12 pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-12 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-5 space-y-4">
            <Link to="/" className="inline-block hover:opacity-90 transition-opacity">
              <KairaLogo className="h-8 text-white" height={32} />
            </Link>
            <p className="text-sm text-white/65 max-w-sm leading-relaxed font-normal">
              Redefining everyday essentials with heavyweight fabrics, relaxed tailored fits, and timeless minimalist aesthetics.
            </p>
          </div>

          {/* Customer Support Col */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Customer Care</h4>
            <ul className="space-y-2.5 text-sm font-semibold text-white/80">
              <li><Link to="/track-order" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping-info" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shipping & Delivery Info</Link></li>
              <li><Link to="/returns-exchanges" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/size-guide" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Size & Fit Guide</Link></li>
              <li><Link to="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help & Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter / Stay in the Loop Col */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Stay Connected</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Get notified first on new drop arrivals, private sales, and limited studio editions.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="relative flex items-center pt-1">
              <div className="relative w-full">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full rounded-full border border-white/20 bg-white/5 py-2.5 pl-10 pr-24 text-xs font-semibold text-white placeholder:text-white/40 focus:border-white focus:bg-white/10 focus:outline-none transition-all"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                  <HugeiconsIcon icon={Mail01Icon} size={15} />
                </div>
              </div>
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-xs font-black text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs"
              >
                <span>Join</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={12} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/45 gap-4 font-medium">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <span>•</span>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
          <div>
            © {new Date().getFullYear()} Kaira Apparel Inc. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
