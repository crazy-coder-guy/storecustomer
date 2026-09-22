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
  const [searchQuery, setSearchQuery] = useState('')

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'New Arrivals', href: '/#new-arrivals' },
    { label: 'Shop', href: '/#shop' },
    { label: 'Categories', href: '/#categories' },
    { label: 'About', href: '/about' },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/10 bg-white/90 backdrop-blur-md">
      {/* Top Banner Announcement */}
      <div className="bg-black py-2.5 px-4 text-center text-base font-semibold text-white tracking-wide">
        Free shipping on all orders over $100 • Express Checkout Available
      </div>

      <div className="kaira-container flex items-center justify-between py-4">
        {/* Left: Mobile Menu Button & Logo */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-black/80 hover:text-black lg:hidden cursor-pointer"
            aria-label="Toggle Navigation"
          >
            <HugeiconsIcon icon={mobileMenuOpen ? Cancel01Icon : Menu01Icon} size={24} />
          </button>

          {/* Brand Logo (Pure Code SVG Vector) */}
          <a href="#" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <KairaLogo className="h-5 sm:h-7 lg:h-8 text-black" height={30} />
          </a>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 xl:gap-10 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-base xl:text-lg font-bold text-black/80 hover:text-black transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right: Search Input & Action Icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Search Bar (Desktop) */}
          <div className="relative hidden w-56 sm:w-72 lg:w-96 lg:flex">
            <input
              type="text"
              placeholder="Search Kaira..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-black/15 bg-gray-50 py-2 pl-9 pr-4 text-sm sm:text-base font-medium text-black placeholder:text-black/40 focus:border-black focus:bg-white focus:outline-none transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/40">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </div>
          </div>

          {/* Search Button (Mobile) */}
          <button
            type="button"
            className="p-1.5 text-black/80 hover:text-black lg:hidden cursor-pointer"
            aria-label="Search"
          >
            <HugeiconsIcon icon={Search01Icon} size={22} />
          </button>

          {/* Wishlist Button */}
          <button
            type="button"
            className="relative p-1.5 text-black/80 hover:text-black transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={22} />
            {wishlistCount > 0 && (
              <span className="absolute right-0 top-0 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-black text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* User Account */}
          <button
            type="button"
            className="p-1.5 text-black/80 hover:text-black transition-colors cursor-pointer"
            aria-label="Account"
          >
            <HugeiconsIcon icon={UserIcon} size={22} />
          </button>

          {/* Shopping Cart Drawer Trigger */}
          <button
            type="button"
            onClick={onOpenCart}
            className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-black/15 bg-black px-3.5 py-2 sm:px-5 sm:py-2.5 text-sm sm:text-base font-bold text-white transition-all duration-300 cursor-pointer shadow-xs select-none"
            aria-label="Shopping Cart"
          >
            {/* Liquid Fill Overlay */}
            <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />

            <div className="relative z-10 flex items-center gap-2">
              <HugeiconsIcon icon={ShoppingBag01Icon} size={18} className="transition-colors duration-300 group-hover:text-black" />
              <span className="hidden font-bold sm:inline transition-all duration-300 group-hover:text-black group-hover:-translate-x-0.5">Bag</span>
              <span className="flex h-4.5 w-4.5 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-white text-[10px] sm:text-xs font-bold text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                {cartCount}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-black/10 bg-white px-5 py-5 lg:hidden">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-black/80 hover:text-black py-2 border-b border-black/5 last:border-none"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
