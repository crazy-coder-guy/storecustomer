import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ShoppingBag01Icon,
  Search01Icon,
  FavouriteIcon,
  ArrowLeft01Icon,
} from '@hugeicons/core-free-icons'
import { KairaLogo } from './KairaLogo'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'

const SEARCH_SUGGESTIONS = [
  'Search "Oversized Shirts"',
  'Search "Acid Wash Tee"',
  'Search "Hooded Shirt"',
  'Search "Drop Shoulder"',
  'Search "Heavyweight Fleece"',
  'Search "Co-ord Sets"',
]

interface NavbarProps {
  cartCount?: number
  wishlistCount?: number
  onOpenCart?: () => void
}

export function Navbar({ cartCount: propCartCount, wishlistCount: propWishlistCount, onOpenCart }: NavbarProps) {
  const navigate = useNavigate()
  const { cartCount: contextCartCount } = useCart()
  const { wishlistCount: contextWishlistCount } = useWishlist()
  const cartCount = propCartCount !== undefined ? propCartCount : contextCartCount
  const wishlistCount = propWishlistCount !== undefined ? propWishlistCount : contextWishlistCount
  const [searchQuery, setSearchQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Blinkit style rotating placeholder animation
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true)
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length)
        setIsFading(false)
      }, 300)
    }, 2800)

    return () => clearInterval(interval)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/search')
    }
  }

  const location = useLocation()
  const isInsidePage = location.pathname !== '/'

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b-0 sm:border-b border-black/10 bg-white/95 backdrop-blur-md">
      {/* Top Banner Announcement - Legible & Well Proportioned */}
      <div className="bg-black py-2 px-3 text-center text-xs font-extrabold text-white tracking-wide uppercase overflow-x-auto whitespace-nowrap no-scrollbar">
        Free Express Shipping Over ₹1,999 • 7-Day Easy Returns
      </div>

      <div className="kaira-container flex items-center justify-between py-3 sm:py-4 gap-4">
        {/* Left Section: Brand Logo on Home, or Circular Back Button on Inside Pages */}
        <div className="flex items-center shrink-0">
          {isInsidePage ? (
            <button
              type="button"
              onClick={handleBack}
              className="group flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-black/15 bg-neutral-100 text-black hover:bg-black hover:text-white active:scale-95 transition-all duration-200 cursor-pointer shadow-2xs"
              aria-label="Go Back"
              title="Go Back"
            >
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={22}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
            </button>
          ) : (
            <a href="/" className="flex items-center hover:opacity-90 transition-opacity shrink-0">
              <KairaLogo className="h-6 sm:h-7 lg:h-8 text-black" height={28} />
            </a>
          )}
        </div>

        {/* Center/Right: Prominent Blinkit-Style Animated Search Bar (Medium & Large screens) */}
        <div className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-4">
          <form
            onSubmit={handleSearchSubmit}
            className={`relative flex items-center w-full rounded-full border bg-neutral-100 transition-all duration-300 ${
              isFocused
                ? 'border-black bg-white ring-2 ring-black/5 shadow-sm'
                : 'border-black/15 hover:border-black/30'
            }`}
          >
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </div>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="w-full bg-transparent py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-black focus:outline-none placeholder-transparent"
              aria-label="Search store"
            />

            {/* Blinkit Animated Placeholder when input is empty */}
            {!searchQuery && (
              <div className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 overflow-hidden h-5 flex items-center">
                <span
                  className={`text-xs sm:text-sm font-semibold text-black/45 transition-all duration-300 ease-out whitespace-nowrap ${
                    isFading
                      ? '-translate-y-3 opacity-0'
                      : 'translate-y-0 opacity-100'
                  }`}
                >
                  {SEARCH_SUGGESTIONS[placeholderIndex]}
                </span>
              </div>
            )}
          </form>
        </div>

        {/* Right Section: Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Search Button (Mobile view < 768px navigates directly to separate /search page) */}
          <Link
            to="/search"
            className="p-1.5 sm:p-2 text-black/80 hover:text-black hover:bg-black/5 rounded-full transition-colors md:hidden cursor-pointer"
            aria-label="Search"
          >
            <HugeiconsIcon icon={Search01Icon} size={22} />
          </Link>

          {/* Wishlist Button */}
          <Link
            to="/wishlist"
            className="relative p-1.5 sm:p-2 text-black/80 hover:text-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Wishlist"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={22} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Cart Trigger (Standard Bag Pill linking to /cart) */}
          {onOpenCart ? (
            <button
              type="button"
              onClick={onOpenCart}
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-black/15 bg-black px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-xs select-none ml-1"
              aria-label="Shopping Cart"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />
              <div className="relative z-10 flex items-center gap-1.5">
                <HugeiconsIcon icon={ShoppingBag01Icon} size={18} className="transition-colors duration-300 group-hover:text-black" />
                <span className="hidden sm:inline font-black transition-colors duration-300 group-hover:text-black">Bag</span>
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                  {cartCount}
                </span>
              </div>
            </button>
          ) : (
            <Link
              to="/cart"
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-full border border-black/15 bg-black px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-xs select-none ml-1"
              aria-label="Shopping Cart"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />
              <div className="relative z-10 flex items-center gap-1.5">
                <HugeiconsIcon icon={ShoppingBag01Icon} size={18} className="transition-colors duration-300 group-hover:text-black" />
                <span className="hidden sm:inline font-black transition-colors duration-300 group-hover:text-black">Bag</span>
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                  {cartCount}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
