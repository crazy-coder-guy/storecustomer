import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FavouriteIcon,
  ArrowRight01Icon,
  MinusSignIcon,
  Add01Icon,
} from '@hugeicons/core-free-icons'
import { formatCurrency } from '../utils/formatCurrency'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import type { ProductCardData } from '../hooks/queries'

export type ProductItem = ProductCardData

interface ProductCardProps {
  product: ProductItem
  onAddToCart?: (product: ProductItem) => void | Promise<void>
  onOpenDetail?: (productId: string) => void
  /** Shorter image + tighter spacing for dense catalog grids (e.g. All Products). */
  compact?: boolean
  /** Custom aspect ratio or height class for the image container */
  imageAspectRatio?: string
}

function getFitLabel(fit?: string | null): string {
  if (!fit) return 'Oversized'
  switch (fit.toUpperCase()) {
    case 'OVERSIZED':
      return 'Oversized'
    case 'RELAXED':
      return 'Relaxed Fit'
    case 'SLIM':
      return 'Slim Fit'
    case 'REGULAR':
      return 'Regular Fit'
    default:
      return fit
  }
}

function getSecondarySpec(product: ProductItem): string {
  if (product.fabric) return product.fabric
  const fitLower = (product.fit || '').toLowerCase()
  if (fitLower.includes('heavy') || product.name.toLowerCase().includes('heavy')) {
    return 'Relaxed Fit'
  }
  if (product.name.toLowerCase().includes('hoodie')) {
    return 'Premium Fabric'
  }
  return 'Drop Shoulder'
}

export function ProductCard({
  product,
  onAddToCart,
  onOpenDetail,
  compact = false,
  imageAspectRatio,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { items: cartItems, removeFromCart, updateQuantity } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const isWishlisted = isInWishlist(product.id)
  const cartEntries = cartItems.filter((item) => item.productId === product.id)
  const isInCart = cartEntries.length > 0
  const primaryCartEntry = cartEntries[0]

  async function handleAddClick() {
    if (isAdding) return
    setIsAdding(true)
    try {
      await onAddToCart?.(product)
    } finally {
      setIsAdding(false)
    }
  }

  function handleIncrement() {
    if (!primaryCartEntry) return
    if (primaryCartEntry.quantity >= primaryCartEntry.stockQuantity) return
    updateQuantity(primaryCartEntry.id, primaryCartEntry.quantity + 1)
  }

  function handleDecrement() {
    if (!primaryCartEntry) return
    if (primaryCartEntry.quantity <= 1) {
      removeFromCart(primaryCartEntry.id)
    } else {
      updateQuantity(primaryCartEntry.id, primaryCartEntry.quantity - 1)
    }
  }

  // Calculate discount percentage if mrp > price
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : null

  // Real color swatches only — no fabricated fallback palette.
  let swatches = product.colors ?? []
  let extraCount = 0
  if (swatches.length > 4) {
    extraCount = swatches.length - 4
    swatches = swatches.slice(0, 4)
  }

  const primaryFit = getFitLabel(product.fit)
  const secondarySpec = getSecondarySpec(product)

  const aspectClass = imageAspectRatio || (compact ? 'aspect-[3.6/3.8]' : 'aspect-[3.6/3.95]')

  return (
    <div className="group relative flex flex-col cursor-pointer select-none">
      {/* Product Image Container with modern rounded edges matching reference */}
      <Link
        to={`/product/${product.id}`}
        className={`relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#f2f2f2] block shadow-xs transition-shadow duration-300 hover:shadow-md ${aspectClass}`}
      >
        {/* Pill Badge (NEW / PREMIUM / TRENDING) */}
        {product.badge && (
          <div className="absolute left-2.5 top-2.5 sm:left-3.5 sm:top-3.5 z-10 pointer-events-none">
            <div className="bg-black/95 text-white font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
              {product.badge}
            </div>
          </div>
        )}

        {/* Wishlist Button - pure circular white pill with minimal outline/shadow */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product.id)
          }}
          className={`absolute right-2.5 top-2.5 sm:right-3.5 sm:top-3.5 z-10 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-105 ${
            isWishlisted ? 'text-red-500 fill-red-500' : 'text-neutral-700 hover:text-black'
          }`}
          aria-label="Add to Wishlist"
        >
          <HugeiconsIcon
            icon={FavouriteIcon}
            size={16}
            strokeWidth={1.8}
            fill={isWishlisted ? 'currentColor' : 'none'}
          />
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      {/* Details Container */}
      <div className="pt-3 pb-1 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          {onOpenDetail ? (
            <button
              type="button"
              onClick={() => onOpenDetail(product.id)}
              className="block text-left w-full cursor-pointer"
            >
              <h3 className="font-bold text-[14px] sm:text-[15.5px] text-neutral-900 tracking-tight leading-snug line-clamp-1 group-hover:text-black transition-colors">
                {product.name}
              </h3>
            </button>
          ) : (
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="font-bold text-[14px] sm:text-[15.5px] text-neutral-900 tracking-tight leading-snug line-clamp-1 group-hover:text-black transition-colors">
                {product.name}
              </h3>
            </Link>
          )}

          {/* Pricing Row: Price | MRP (line-through) | Soft Coral Red Pill (% OFF) */}
          <div className="flex items-center gap-2 pt-1 sm:pt-1.5 flex-wrap">
            <span className="font-black text-[15px] sm:text-[17px] text-neutral-950 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[12px] sm:text-[13px] font-semibold text-neutral-400 line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="inline-flex items-center text-[10px] sm:text-[11px] font-bold text-[#e14d4d] bg-[#fdeeee] px-2 py-0.5 rounded-md">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Color Swatches Row + count (only when the product has real configured colors) */}
          {swatches.length > 0 && (
            <div className="flex items-center gap-1.5 pt-2">
              <div className="flex items-center gap-1.5">
                {swatches.map((hex, i) => (
                  <span
                    key={i}
                    className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border border-black/10 shadow-2xs shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
              {extraCount > 0 && (
                <span className="text-[10px] sm:text-[11px] font-bold text-neutral-400 shrink-0">
                  +{extraCount}
                </span>
              )}
            </div>
          )}

          {/* Subtitle / Attributes: e.g. "Oversized | Drop Shoulder" */}
          <div className="flex items-center gap-1.5 pt-1.5 text-[11px] sm:text-[12px] text-neutral-500 font-medium tracking-tight">
            <span>{primaryFit}</span>
            <span className="text-neutral-300">|</span>
            <span>{secondarySpec}</span>
          </div>
        </div>

        {/* Site Liquid Add to Bag Button / Qty Stepper */}
        <div className="pt-3">
          <div className="relative h-10 sm:h-11">
            {/* Qty Stepper */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute inset-0 flex items-center justify-between rounded-2xl border border-black bg-white px-3 transition-opacity duration-300 ease-out shadow-xs ${
                isInCart ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {primaryCartEntry && (
                <>
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label={primaryCartEntry.quantity <= 1 ? 'Remove from Bag' : 'Decrease quantity'}
                    className="tap-press flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={2.4} />
                  </button>
                  <span className="font-extrabold text-sm sm:text-base text-black">{primaryCartEntry.quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={primaryCartEntry.quantity >= primaryCartEntry.stockQuantity}
                    aria-label="Increase quantity"
                    className="tap-press flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.4} />
                  </button>
                </>
              )}
            </div>

            {/* Liquid Add to Bag Button (matching the site's LiquidButton effect) */}
            <button
              type="button"
              disabled={isAdding || isInCart}
              onClick={(e) => {
                e.stopPropagation()
                handleAddClick()
              }}
              aria-label="Add to Bag"
              aria-busy={isAdding}
              className={`group/btn tap-press absolute inset-0 flex items-center justify-between overflow-hidden rounded-2xl border border-black bg-black pl-4 pr-1.5 sm:pl-5 sm:pr-2 transition-opacity duration-300 ease-out hover:shadow-md ${
                isInCart ? 'opacity-0 pointer-events-none' : 'opacity-100'
              } ${isAdding ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              {/* Liquid Fill Overlay (rises on hover) */}
              {!isAdding && (
                <span className="absolute inset-0 translate-y-full rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/btn:translate-y-0" />
              )}

              {/* In-flight loading progress fill */}
              <span
                className="absolute inset-y-0 left-0 bg-white/25 rounded-2xl transition-[width] ease-out"
                style={{ width: isAdding ? '92%' : '0%', transitionDuration: isAdding ? '1600ms' : '0ms' }}
              />

              {/* Button Content */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="font-extrabold text-[11px] sm:text-xs uppercase tracking-wider text-white transition-all duration-300 group-hover/btn:text-black group-hover/btn:-translate-x-1">
                  {isAdding ? 'Adding…' : 'Add to Bag'}
                </span>

                {/* Circular Opposite Color Badge with Arrow / Spinner */}
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover/btn:bg-black group-hover/btn:text-white shrink-0">
                  {isAdding ? (
                    <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.4} className="sm:hidden" />
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.4} className="hidden sm:block" />
                    </>
                  )}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
