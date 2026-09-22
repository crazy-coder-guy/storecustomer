import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ShoppingBag01Icon,
  Search01Icon,
  UserIcon,
  Menu01Icon,
  Cancel01Icon,
  FavouriteIcon,
} from '@hugeicons/core-free-icons'
import { KairaLogo } from './KairaLogo'

interface NavbarProps {
  cartCount?: number
  wishlistCount?: number
  onOpenCart?: () => void
}

export function Navbar({ cartCount = 0, wishlistCount = 0, onOpenCart }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'New Arrivals', href: '/#new-arrivals' },
    { label: 'Shop', href: '/#shop' },
    { label: 'Categories', href: '/#categories' },
    { label: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-md">
      {/* Top Banner Announcement - Single line text */}
      <div className="bg-black py-1.5 px-3 text-center text-[9px] sm:text-xs font-black text-white tracking-wider uppercase overflow-hidden whitespace-nowrap">
        Free Express Shipping Over ₹1,999 • 7-Day Easy Returns
      </div>

      <div className="kaira-container flex items-center justify-between py-3 sm:py-4">
        {/* Left Section: Mobile Menu Button & Brand Logo */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen)
              setMobileSearchOpen(false)
            }}
            className="p-1.5 text-black hover:bg-black/5 rounded-xl transition-colors xl:hidden cursor-pointer shrink-0"
            aria-label="Toggle Navigation"
          >
            <HugeiconsIcon icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon} size={22} />
          </button>

          {/* Brand Logo */}
          <a href="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
            <KairaLogo className="h-6 sm:h-7 lg:h-8 text-black" height={28} />
          </a>
        </div>

        {/* Center: Desktop Navigation Links (Visible on XL screen >= 1280px or LG screen without collision) */}
        <nav className="hidden xl:flex items-center gap-6 xl:gap-8 shrink-0">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs xl:text-sm font-black text-black/80 hover:text-black transition-colors uppercase tracking-wider whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Search Input & Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Search Bar (Visible on XL screens >= 1280px) */}
          <div className="relative hidden xl:flex w-56 lg:w-64">
            <input
              type="text"
              placeholder="Search store..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-black/15 bg-neutral-50 py-1.5 pl-9 pr-4 text-xs font-semibold text-black placeholder:text-black/40 focus:border-black focus:bg-white focus:outline-none transition-all"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-black/40">
              <HugeiconsIcon icon={Search01Icon} size={15} />
            </div>
          </div>

          {/* Search Button (Mobile & Tablet Toggle < 1280px) */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen(!mobileSearchOpen)
              setMobileMenuOpen(false)
            }}
            className="p-1.5 sm:p-2 text-black/80 hover:text-black hover:bg-black/5 rounded-full transition-colors xl:hidden cursor-pointer"
            aria-label="Search"
          >
            <HugeiconsIcon icon={Search01Icon} size={20} />
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            className="relative p-1.5 sm:p-2 text-black/80 hover:text-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={20} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Trigger (Liquid Button effect) */}
          <button
            type="button"
            onClick={onOpenCart}
            className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-black/15 bg-black px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-xs select-none ml-1"
            aria-label="Shopping Cart"
          >
            <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />

            <div className="relative z-10 flex items-center gap-1.5">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={16} className="transition-colors duration-300 group-hover:text-black" />
              <span className="hidden sm:inline font-black transition-colors duration-300 group-hover:text-black">Bag</span>
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                {cartCount}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Interactive Search Bar Dropdown */}
      {mobileSearchOpen && (
        <div className="border-t border-black/10 bg-white px-4 py-3 xl:hidden animate-fade-in-down">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products, categories, styles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full rounded-xl border border-black/20 bg-neutral-50 py-2.5 pl-10 pr-4 text-sm font-semibold text-black placeholder:text-black/40 focus:border-black focus:bg-white focus:outline-none"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </div>
          </div>
        </div>
      )}

      {/* Mobile & Tablet Slide-Down Navigation Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-black/10 bg-white/98 backdrop-blur-xl px-5 py-6 xl:hidden animate-fade-in-down shadow-xl">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-black text-black uppercase tracking-wider py-3 border-b border-black/5 last:border-none flex items-center justify-between hover:text-black/70 transition-colors"
              >
                <span>{link.label}</span>
                <span className="text-black/30">→</span>
              </a>
            ))}

            <div className="pt-4 flex items-center justify-between border-t border-black/10 mt-2 text-sm font-extrabold text-black">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={UserIcon} size={20} />
                <span>My Account</span>
              </div>
              <span className="text-xs font-bold text-black/50">Sign In</span>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

