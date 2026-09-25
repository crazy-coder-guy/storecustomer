import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ShoppingBag01Icon,
  Search01Icon,
  FavouriteIcon,
  ArrowLeft01Icon,
  Home01Icon,
  Image01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import { KairaLogo } from './KairaLogo'
import { AccountDrawer } from './AccountDrawer'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useStorefrontSettings, useSearchProducts, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { formatCurrency } from '../utils/formatCurrency'

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
  const { user } = useAuth()
  const { cartCount: contextCartCount } = useCart()
  const { wishlistCount: contextWishlistCount, openWishlist } = useWishlist()
  const cartCount = propCartCount !== undefined ? propCartCount : contextCartCount
  const wishlistCount = propWishlistCount !== undefined ? propWishlistCount : contextWishlistCount
  const { data: settings } = useStorefrontSettings()
  const announcementText = settings?.announcementText || 'Free Express Shipping Over ₹1,999 • 7-Day Easy Exchange'
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Debounce the query before hitting the API for live suggestions.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 250)
    return () => clearTimeout(handle)
  }, [searchQuery])

  const showSuggestions = isFocused && searchQuery.trim().length > 0
  const { data: suggestionsData, isLoading: suggestionsLoading } = useSearchProducts(
    debouncedQuery,
    showSuggestions
  )
  const suggestions = suggestionsData?.items.slice(0, 6) ?? []

  // Close the suggestions dropdown when clicking outside the search bar,
  // rather than on input blur, so clicking a suggestion still registers.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsFocused(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

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
    setIsFocused(false)
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
      <div className="bg-black py-2 px-3 text-white overflow-hidden">
        {/* Mobile: continuous marquee so long copy isn't cut off / stuck behind a manual swipe */}
        <div className="sm:hidden flex w-max animate-marquee-fast space-x-10 select-none">
          <span className="text-sm font-extrabold tracking-wide uppercase whitespace-nowrap">
            {announcementText}
          </span>
          <span className="text-sm font-extrabold tracking-wide uppercase whitespace-nowrap" aria-hidden="true">
            {announcementText}
          </span>
        </div>
        {/* Desktop/tablet: centered, fits comfortably without needing to scroll */}
        <div className="hidden sm:block text-center text-xs font-extrabold tracking-wide uppercase whitespace-nowrap">
          {announcementText}
        </div>
      </div>

      <div className="kaira-container flex items-center justify-between py-3 sm:py-4 gap-4">
        {/* Left Section: Brand Logo on Home, or Back + Home Buttons on Inside Pages */}
        <div className="flex items-center gap-2 shrink-0">
          {isInsidePage ? (
            <>
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
              {/* Fixed-size placeholder reserves the collapsed footprint in the
                  flex row; the Link inside is absolutely positioned so its
                  hover-expansion overlaps forward instead of pushing the
                  search bar over. */}
              <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0">
                <Link
                  to="/"
                  className="group absolute left-0 top-0 z-20 flex h-10 sm:h-11 items-center overflow-hidden rounded-full hover:rounded-2xl border border-black/15 bg-neutral-100 px-2.5 sm:px-[13px] text-black hover:bg-black hover:text-white active:scale-95 transition-all duration-300 ease-out cursor-pointer shadow-2xs"
                  aria-label="Go to Home"
                  title="Go to Home"
                >
                  <HugeiconsIcon
                    icon={Home01Icon}
                    size={20}
                    className="shrink-0 transition-transform duration-200 group-hover:scale-110"
                  />
                  <span className="max-w-0 group-hover:max-w-[60px] group-hover:ml-1.5 overflow-hidden whitespace-nowrap text-xs sm:text-sm font-bold tracking-wide transition-all duration-300 ease-out">
                    Home
                  </span>
                </Link>
              </div>
            </>
          ) : (
            <Link
              to="/"
              className="group flex items-center hover:opacity-90 transition-opacity shrink-0"
              aria-label="Kaiira Home"
            >
              <KairaLogo
                animated={true}
                className="h-6 sm:h-7 lg:h-8 text-black transition-transform duration-300 group-hover:scale-105"
                height={28}
              />
            </Link>
          )}
        </div>

        {/* Center/Right: Prominent Blinkit-Style Animated Search Bar (Medium & Large screens) */}
        <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md lg:max-w-xl mx-4 relative">
          <form
            onSubmit={handleSearchSubmit}
            className={`relative flex items-center w-full rounded-2xl border bg-neutral-100 transition-all duration-300 ${isFocused
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
              className="w-full bg-transparent py-2.5 sm:py-3 pl-11 pr-4 text-xs sm:text-sm font-semibold text-black focus:outline-none placeholder-transparent"
              aria-label="Search store"
            />

            {/* Blinkit Animated Placeholder when input is empty */}
            {!searchQuery && (
              <div className="pointer-events-none absolute left-11 top-1/2 -translate-y-1/2 overflow-hidden h-5 flex items-center">
                <span
                  className={`text-xs sm:text-sm font-semibold text-black/45 transition-all duration-300 ease-out whitespace-nowrap ${isFading
                      ? '-translate-y-3 opacity-0'
                      : 'translate-y-0 opacity-100'
                    }`}
                >
                  {SEARCH_SUGGESTIONS[placeholderIndex]}
                </span>
              </div>
            )}
            {/* Clear Button */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setDebouncedQuery('')
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-black/60 hover:text-black transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={13} />
              </button>
            )}
          </form>

          {/* Live Suggestions Dropdown (desktop/tablet only — stays on the page, no navigation) */}
          {showSuggestions && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-2xl border border-black/10 bg-white/95 backdrop-blur-xl shadow-2xl animate-dropdown-in">
              {suggestionsLoading ? (
                <div className="flex flex-col gap-2 p-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-100/70 animate-pulse">
                      <div className="h-14 w-14 rounded-xl bg-neutral-200 shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 w-3/4 rounded bg-neutral-200" />
                        <div className="h-2.5 w-1/3 rounded bg-neutral-200" />
                      </div>
                      <div className="h-3.5 w-14 rounded bg-neutral-200 shrink-0" />
                    </div>
                  ))}
                </div>
              ) : suggestions.length === 0 ? (
                <div className="px-5 py-8 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-black/40">
                    <HugeiconsIcon icon={Search01Icon} size={18} />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-black/70">
                    No products found for <span className="text-black font-bold">"{searchQuery}"</span>
                  </p>
                  <p className="text-[11px] text-black/40 mt-1">
                    Try checking your spelling or searching for another keyword
                  </p>
                </div>
              ) : (
                <div className="p-2">
                  <div className="px-3 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-bold text-black/45 tracking-wider">
                    <span>Matches</span>
                    <span className="text-[10px] font-medium text-black/40">{suggestions.length} items</span>
                  </div>
                  <ul className="max-h-[400px] overflow-y-auto space-y-1 pr-0.5">
                    {suggestions.map((product) => {
                      const hasDiscount = product.mrp && product.mrp > product.basePrice
                      const discountPercent = hasDiscount
                        ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
                        : 0

                      return (
                        <li key={product.id}>
                          <Link
                            to={`/product/${product.id}`}
                            onClick={() => setIsFocused(false)}
                            className="group flex items-center gap-3.5 px-3 py-2.5 rounded-xl hover:bg-neutral-100/80 transition-all duration-200 cursor-pointer"
                          >
                            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-neutral-100 border border-black/5 group-hover:scale-105 transition-transform duration-300">
                              {product.image ? (
                                <img
                                  src={product.image || PLACEHOLDER_PRODUCT_IMAGE}
                                  alt=""
                                  className="h-full w-full object-cover object-top"
                                />
                              ) : (
                                <HugeiconsIcon icon={Image01Icon} size={18} className="text-black/30" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-xs sm:text-sm font-bold text-black group-hover:text-black transition-colors">
                                  {product.name}
                                </p>
                                {product.badge && (
                                  <span className="shrink-0 px-2 py-0.5 rounded-2xl bg-black text-[10px] font-bold text-white tracking-normal leading-tight">
                                    {product.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-medium text-black/50 truncate mt-0.5">
                                {product.categoryName}
                              </p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2.5 text-right pl-2">
                              <div className="flex flex-col items-end">
                                <span className="text-xs sm:text-sm font-black text-black">
                                  {formatCurrency(product.basePrice)}
                                </span>
                                {hasDiscount && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-black/40 line-through">
                                      {formatCurrency(product.mrp)}
                                    </span>
                                    {discountPercent > 0 && (
                                      <span className="text-[10px] font-bold text-emerald-600">
                                        {discountPercent}% off
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="h-7 w-7 rounded-full bg-black/5 flex items-center justify-center text-black/50 group-hover:bg-black group-hover:text-white transition-all duration-200">
                                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                              </div>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Action Icons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Search Button (Mobile view < 768px navigates directly to separate /search page) */}
          <Link
            to="/search"
            className="tap-press p-1.5 sm:p-2 text-black/80 hover:text-black hover:bg-black/5 rounded-full transition-colors md:hidden cursor-pointer"
            aria-label="Search"
          >
            <HugeiconsIcon icon={Search01Icon} size={22} />
          </Link>

          {/* Favourites / Wishlist Slider Trigger */}
          <button
            type="button"
            onClick={openWishlist}
            className="tap-press relative p-1.5 sm:p-2 text-black/80 hover:text-black hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            aria-label="Favourites"
            title="Saved Pieces"
          >
            <HugeiconsIcon icon={FavouriteIcon} size={22} />
            {wishlistCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Cart Trigger (Standard Bag Pill linking to /cart) */}
          {onOpenCart ? (
            <button
              type="button"
              onClick={onOpenCart}
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-2xl border border-black/15 bg-black px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-xs select-none ml-1"
              aria-label="Shopping Cart"
            >
              <span className="absolute inset-0 translate-y-full rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />
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
              className="group tap-press relative flex items-center gap-1.5 overflow-hidden rounded-2xl border border-black/15 bg-black px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-black text-white transition-all duration-300 cursor-pointer shadow-xs select-none ml-1"
              aria-label="Shopping Cart"
            >
              <span className="absolute inset-0 translate-y-full rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />
              <div className="relative z-10 flex items-center gap-1.5">
                <HugeiconsIcon icon={ShoppingBag01Icon} size={18} className="transition-colors duration-300 group-hover:text-black" />
                <span className="hidden sm:inline font-black transition-colors duration-300 group-hover:text-black">Bag</span>
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-black text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                  {cartCount}
                </span>
              </div>
            </Link>
          )}

          {/* Account Button (Opens slide-in Account Sidebar Drawer) */}
          <button
            type="button"
            onClick={() => setIsAccountOpen(true)}
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-black/15 text-xs font-black uppercase text-black hover:border-black hover:bg-black/5 transition-all cursor-pointer shadow-2xs"
            title={user ? `Signed in as ${user.email}` : 'Sign In / Account'}
            aria-label="Your account"
          >
            {user?.photoUrl ? (
              <img src={user.photoUrl} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : user ? (
              (user.name ?? user.email ?? '?').charAt(0)
            ) : (
              <HugeiconsIcon icon={UserIcon} size={16} className="text-black/70" />
            )}
          </button>
        </div>
      </div>

      {/* Slide-In Account Sidebar Drawer */}
      <AccountDrawer isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </header>
  )
}
