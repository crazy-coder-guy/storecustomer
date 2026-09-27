import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { KairaLogo } from './KairaLogo'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowRight01Icon,
  Mail01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'
import { subscribeNewsletter } from '../services/newsletter.service'
import { getErrorMessage } from '../services/api'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    if (!EMAIL_PATTERN.test(email.trim())) {
      toast.error('Enter a valid email address')
      return
    }

    setIsSubmitting(true)
    try {
      const { alreadySubscribed } = await subscribeNewsletter(email.trim())
      toast.success(alreadySubscribed ? "You're already on the list" : "You're on the list!")
      setIsSubscribed(true)
      setEmail('')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

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
              Redefining everyday essentials with heavyweight fabrics, relaxed tailored fits, and clean design.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/hello.kaiiraofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all cursor-pointer group"
                title="Instagram"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/hello.kaiiraofficia"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all cursor-pointer group"
                title="Facebook"
                aria-label="Facebook"
              >
                <svg className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* Threads */}
              <a
                href="https://www.threads.com/@hello.kaiiraofficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all cursor-pointer group"
                title="Threads"
                aria-label="Threads"
              >
                <svg className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M12.786 21.6c-4.228 0-7.641-3.005-7.641-7.498 0-4.6 3.513-7.55 7.91-7.55 4.383 0 7.426 3.01 7.426 7.214 0 3.79-2.482 6.136-5.46 6.136-1.127 0-2.074-.467-2.486-1.272l.067.438c.241 1.488 1.411 2.457 2.977 2.457 1.34 0 2.378-.507 3.01-1.396l1.378 1.13c-.982 1.377-2.613 2.141-4.526 2.141-2.915 0-4.996-1.802-5.385-4.482l-.088-.573C8.835 18.73 7.37 17.067 7.37 14.502c0-3.322 2.406-5.59 5.344-5.59 3.064 0 5.127 2.128 5.127 5.093 0 2.656-1.637 4.257-3.702 4.257-.798 0-1.378-.344-1.579-.905l.078.487c.219 1.408 1.258 2.256 2.637 2.256 1.464 0 2.33-.762 2.656-1.531l1.377 1.054c-.604 1.274-1.996 2.277-4.135 2.277zm-1.528-5.32c.382.723 1.042.946 1.633.946 1.306 0 2.05-.989 2.05-2.521 0-1.828-1.139-3.313-3.414-3.313-1.954 0-3.418 1.402-3.418 3.518 0 1.942 1.155 3.123 3.149 1.37z"/>
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@hello.KaiiraOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:border-white/30 transition-all cursor-pointer group"
                title="YouTube"
                aria-label="YouTube"
              >
                <svg className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Customer Support Col */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Customer Care</h4>
            <ul className="space-y-2.5 text-sm font-semibold text-white/80">
              <li><Link to="/track-order" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/shipping-info" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Shipping & Delivery Info</Link></li>
              <li><Link to="/returns-exchanges" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Exchange Policy</Link></li>
              <li><Link to="/size-guide" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Size & Fit Guide</Link></li>
              <li><Link to="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Help & Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter / Stay in the Loop Col */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white/50">Stay Connected</h4>
            <p className="text-xs text-white/60 leading-relaxed">
              Be the first to know about new arrivals, private sales, and limited releases.
            </p>
            {isSubscribed ? (
              <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2.5 text-xs font-bold text-emerald-300">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} size={15} />
                <span>You're subscribed — welcome to the list.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative flex items-center pt-1">
                <div className="relative w-full">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    className="w-full rounded-2xl border border-white/20 bg-white/5 py-2.5 pl-10 pr-24 text-xs font-semibold text-white placeholder:text-white/40 focus:border-white focus:bg-white/10 focus:outline-none transition-all disabled:opacity-60"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <HugeiconsIcon icon={Mail01Icon} size={15} />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 rounded-2xl bg-white px-3.5 py-1.5 text-xs font-black text-black hover:bg-neutral-200 transition-colors cursor-pointer shadow-xs disabled:cursor-wait disabled:opacity-70"
                >
                  <span>{isSubmitting ? 'Joining…' : 'Join'}</span>
                  {!isSubmitting && <HugeiconsIcon icon={ArrowRight01Icon} size={12} />}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/45 gap-4 font-medium">
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link to="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link to="/security" className="hover:text-white transition-colors">Security</Link>
          </div>
          <div>
            © {new Date().getFullYear()} Kaiira. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}
