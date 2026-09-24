import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  Search01Icon,
  Cancel01Icon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'
import { useCart } from '../context/CartContext'
import { useSearchProducts, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { formatCurrency } from '../utils/formatCurrency'

const POPULAR_SEARCHES = [
  'Oversized Shirts',
  'Hooded Shirt',
  'Acid Wash',
  'Co-ord Set',
  'Heavyweight Tee',
  'Desert Vibe',
  'Cargo Pants',
]

const SEARCH_SUGGESTIONS = [
  'Search "Oversized Shirts"',
  'Search "Acid Wash Tee"',
  'Search "Hooded Shirt"',
  'Search "Drop Shoulder"',
  'Search "Heavyweight Fleece"',
]

export function SearchPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  const { cartCount } = useCart()
  const [query, setQuery] = useState(initialQuery)
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [isFading, setIsFading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Rotating placeholder
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

  // Auto focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Debounce the search query ~300ms before hitting the API
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(handle)
  }, [query])

  const { data, isLoading } = useSearchProducts(debouncedQuery)
  const products = data?.items ?? []

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 font-sans text-black">
      {/* Top Search Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-black/10 px-4 py-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black hover:bg-neutral-100 active:scale-95 transition-transform cursor-pointer"
            aria-label="Go Back"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={22} />
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-2xl border border-black/15 bg-neutral-100 py-2.5 pl-10 pr-9 text-sm font-semibold text-black placeholder-transparent focus:border-black focus:bg-white focus:outline-none transition-all"
            />
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black/50 pointer-events-none">
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </div>

            {/* Rotating Placeholder */}
            {!query && (
              <div className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 overflow-hidden h-5 flex items-center">
                <span
                  className={`text-sm font-semibold text-black/40 transition-all duration-300 ease-out whitespace-nowrap ${
                    isFading ? '-translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
                  }`}
                >
                  {SEARCH_SUGGESTIONS[placeholderIndex]}
                </span>
              </div>
            )}

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 hover:text-black p-0.5 cursor-pointer"
                aria-label="Clear Search"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            )}
          </div>

          <Link
            to="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-black hover:bg-neutral-100 transition-colors"
            aria-label="Cart"
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={22} />
            {cartCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] font-black text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Main Body */}
      <div className="px-4 py-5 max-w-lg mx-auto">
        {query.trim().length === 0 ? (
          /* Empty / Default Search State: Clean & focused on Popular Searches */
          <div className="space-y-4 animate-fade-in pt-1">
            <div>
              <div className="flex items-center gap-1.5 mb-3 text-xs font-black uppercase tracking-wider text-black/60">
                <span className="inline-block h-2 w-2 rounded-full bg-black animate-pulse" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="rounded-2xl border border-black/10 bg-white px-3.5 py-1.5 text-xs font-bold text-black/80 hover:border-black hover:text-black active:scale-95 transition-all shadow-2xs cursor-pointer"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Active Results State */
          <div>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-extrabold text-black/60 uppercase tracking-wider">
                {isLoading ? 'Searching…' : `${products.length} ${products.length === 1 ? 'Result' : 'Results'} found`}
              </span>
              {!isLoading && products.length > 0 && (
                <span className="text-[11px] font-semibold text-black/40">Showing top matches</span>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-neutral-100 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-black/40 mb-3">
                  <HugeiconsIcon icon={Search01Icon} size={26} />
                </div>
                <h3 className="text-sm font-black text-black">No products found for "{query}"</h3>
                <p className="text-xs text-black/50 mt-1 max-w-xs mx-auto">
                  Try checking for typos or searching for general terms like "shirt", "hoodie", or "oversized".
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setQuery(tag)}
                      className="rounded-2xl border border-black/15 bg-white px-3 py-1 text-xs font-bold text-black/80 hover:border-black"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {products.map((product) => {
                  const hasDiscount = product.mrp && product.mrp > product.basePrice
                  const discountPercent = hasDiscount
                    ? Math.round(((product.mrp - product.basePrice) / product.mrp) * 100)
                    : 0

                  return (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="group flex items-center gap-3.5 rounded-2xl border border-black/10 bg-white p-3 transition-all duration-300 hover:shadow-md hover:border-black/20 active:scale-[0.99] cursor-pointer"
                    >
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-black/5">
                        {product.badge && (
                          <span className="absolute left-1.5 top-1.5 z-10 rounded-2xl bg-black px-2 py-0.5 text-[9px] font-bold text-white tracking-normal shadow-xs">
                            {product.badge}
                          </span>
                        )}
                        <img
                          src={product.image || PLACEHOLDER_PRODUCT_IMAGE}
                          alt={product.name}
                          className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>

                      <div className="flex flex-1 min-w-0 flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-sm font-bold text-black leading-snug truncate group-hover:text-black">
                              {product.name}
                            </h4>
                          </div>
                          <p className="text-[11px] font-medium text-black/50 truncate mt-0.5">
                            {product.categoryName}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-black/5">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-black text-black">
                              {formatCurrency(product.basePrice)}
                            </span>
                            {hasDiscount && (
                              <>
                                <span className="text-[11px] text-black/40 line-through">
                                  {formatCurrency(product.mrp)}
                                </span>
                                {discountPercent > 0 && (
                                  <span className="text-[10px] font-bold text-emerald-600">
                                    {discountPercent}% off
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/5 text-black/70 group-hover:bg-black group-hover:text-white transition-all duration-200">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
