import { useState, useMemo, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  Search01Icon,
  Cancel01Icon,
  ShoppingBag01Icon,
} from '@hugeicons/core-free-icons'
import { PRODUCTS_DATABASE, type ProductDetailData } from '../utils/productsData'
import { useCart } from '../context/CartContext'

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
  const { addToCart, cartCount } = useCart()
  const [query, setQuery] = useState(initialQuery)
  const [addedId, setAddedId] = useState<string | null>(null)
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

  const productsList = useMemo(() => Object.values(PRODUCTS_DATABASE), [])

  const filteredProducts = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (!trimmed) return []

    return productsList.filter((product) => {
      return (
        product.name.toLowerCase().includes(trimmed) ||
        product.category.toLowerCase().includes(trimmed) ||
        product.subtitle.toLowerCase().includes(trimmed) ||
        product.details.some((d) => d.toLowerCase().includes(trimmed))
      )
    })
  }, [query, productsList])

  const handleQuickAdd = (product: ProductDetailData, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      mrp: product.mrp,
      size: product.sizes[0] || 'M',
      color: product.colors[0] || { name: 'Default', hex: '#000000' },
      image: product.images[0],
      quantity: 1,
    })
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1400)
  }

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
              className="w-full rounded-full border border-black/15 bg-neutral-100 py-2.5 pl-10 pr-9 text-sm font-semibold text-black placeholder-transparent focus:border-black focus:bg-white focus:outline-none transition-all"
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
                    className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-xs font-bold text-black/80 hover:border-black hover:text-black active:scale-95 transition-all shadow-2xs cursor-pointer"
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
                {filteredProducts.length} {filteredProducts.length === 1 ? 'Result' : 'Results'} found
              </span>
              {filteredProducts.length > 0 && (
                <span className="text-[11px] font-semibold text-black/40">Showing top matches</span>
              )}
            </div>

            {filteredProducts.length === 0 ? (
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
                      className="rounded-full border border-black/15 bg-white px-3 py-1 text-xs font-bold text-black/80 hover:border-black"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="flex gap-3 rounded-2xl border border-black/10 bg-white p-2.5 transition-all hover:shadow-md"
                  >
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-black text-black leading-tight">{product.name}</h4>
                          <span className="text-[10px] font-bold text-black/50 shrink-0 uppercase tracking-wider">
                            {product.category}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-black/50 line-clamp-1 mt-0.5">
                          {product.subtitle}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-black/5">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xs font-black text-black">
                            ₹{product.price.toLocaleString()}
                          </span>
                          {product.mrp > product.price && (
                            <span className="text-[10px] text-black/40 line-through">
                              ₹{product.mrp.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleQuickAdd(product, e)}
                          className={`rounded-full px-3 py-1 text-[11px] font-black transition-all ${
                            addedId === product.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-black text-white hover:bg-neutral-800'
                          }`}
                        >
                          {addedId === product.id ? 'Added ✓' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
