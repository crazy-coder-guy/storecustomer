import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon, ArrowRight01Icon, MinusSignIcon, Add01Icon } from '@hugeicons/core-free-icons'
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
}

export function ProductCard({ product, onAddToCart, onOpenDetail, compact = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { items: cartItems, removeFromCart, updateQuantity } = useCart()
  const [isAdding, setIsAdding] = useState(false)
  const isWishlisted = isInWishlist(product.id)
  const cartEntries = cartItems.filter((item) => item.productId === product.id)
  const isInCart = cartEntries.length > 0
  // Quick-add always resolves the same default variant, so there's normally
  // exactly one cart line for this product here — that's the one the
  // stepper controls. (If the shopper separately added another color/size
  // from the product page too, this just controls the first of those lines.)
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

  return (
    <div className="group relative flex flex-col space-y-2 sm:space-y-3 cursor-pointer select-none">
      {/* Product Image Container */}
      <Link
        to={`/product/${product.id}`}
        className={`relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 block ${
          compact ? 'aspect-[4/3.4]' : 'aspect-[4/4.2]'
        }`}
      >
        {/* Pure Black Corner Badge */}
        {product.badge && (
          <div className="absolute left-2 top-2 sm:left-3 sm:top-3 z-10 pointer-events-none animate-badge-slide-up">
            <div className="pure-black-badge-bar rounded-2xl py-1 sm:py-1.5 px-2.5 sm:px-3 shadow-md">
              <span className="text-[9px] sm:text-xs font-bold tracking-wide text-white line-clamp-1 whitespace-nowrap">
                {product.badge}
              </span>
            </div>
          </div>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(product.id)
          }}
          className={`absolute right-2 top-2 sm:right-3 sm:top-3 z-10 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm ${
            isWishlisted ? 'heart-active text-red-500 fill-red-500' : 'text-black/70 hover:text-black'
          }`}
          aria-label="Add to Wishlist"
        >
          <HugeiconsIcon icon={FavouriteIcon} size={14} className="sm:hidden" fill={isWishlisted ? 'currentColor' : 'none'} />
          <HugeiconsIcon icon={FavouriteIcon} size={16} className="hidden sm:block" fill={isWishlisted ? 'currentColor' : 'none'} />
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </Link>

      {/* Details Below Image */}
      <div className="space-y-1.5 sm:space-y-2 px-0.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[10px] sm:text-sm font-bold text-black/50 uppercase tracking-wider sm:tracking-widest">
            <span className="truncate pr-1">{product.categoryName}</span>
            {product.colors && (
              <div className="flex items-center -space-x-1 shrink-0">
                {product.colors.map((hex, i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border border-white shadow-2xs"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>

          {onOpenDetail ? (
            <button
              type="button"
              onClick={() => onOpenDetail(product.id)}
              className="block text-left group-hover:text-black/70 transition-colors line-clamp-1 mt-0.5 sm:mt-1 cursor-pointer w-full"
            >
              <h3 className={`font-extrabold text-black ${compact ? 'text-sm sm:text-base' : 'text-sm sm:text-xl'}`}>
                {product.name}
              </h3>
            </button>
          ) : (
            <Link to={`/product/${product.id}`} className="block">
              <h3
                className={`font-extrabold text-black group-hover:text-black/70 transition-colors line-clamp-1 mt-0.5 sm:mt-1 ${
                  compact ? 'text-sm sm:text-base' : 'text-sm sm:text-xl'
                }`}
              >
                {product.name}
              </h3>
            </Link>
          )}

          <div className="flex items-baseline gap-1.5 sm:gap-2.5 pt-0.5 sm:pt-1">
            <span className={`font-black text-black ${compact ? 'text-sm sm:text-base' : 'text-sm sm:text-xl'}`}>
              {formatCurrency(product.price)}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[11px] sm:text-sm font-semibold text-black/40 line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>
        </div>

        {/* Separate Liquid Add to Bag Button — crossfades into a qty stepper
            once in cart. Both stay mounted, absolutely stacked in a
            fixed-height slot, and swap via opacity so it's a smooth
            crossfade instead of an instant swap. */}
        <div className="pt-1 sm:pt-2">
          <div className="relative h-9 sm:h-11">
            {/* Qty Stepper */}
            <div
              onClick={(e) => e.stopPropagation()}
              className={`absolute inset-0 flex items-center justify-between rounded-2xl border border-black bg-white px-2 sm:px-3 transition-opacity duration-300 ease-out ${
                isInCart ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {primaryCartEntry && (
                <>
                  <button
                    type="button"
                    onClick={handleDecrement}
                    aria-label={primaryCartEntry.quantity <= 1 ? 'Remove from Bag' : 'Decrease quantity'}
                    className="tap-press flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors cursor-pointer"
                  >
                    <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={2.4} />
                  </button>
                  <span className="font-extrabold text-sm sm:text-base text-black">{primaryCartEntry.quantity}</span>
                  <button
                    type="button"
                    onClick={handleIncrement}
                    disabled={primaryCartEntry.quantity >= primaryCartEntry.stockQuantity}
                    aria-label="Increase quantity"
                    className="tap-press flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  >
                    <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.4} />
                  </button>
                </>
              )}
            </div>

            {/* Add to Bag Button */}
            <button
              type="button"
              disabled={isAdding || isInCart}
              onClick={(e) => {
                e.stopPropagation()
                handleAddClick()
              }}
              aria-label="Add to Bag"
              aria-busy={isAdding}
              className={`group/btn tap-press absolute inset-0 flex items-center justify-between overflow-hidden rounded-2xl border border-black bg-black px-3 sm:px-6 transition-opacity duration-300 ease-out hover:shadow-lg ${
                isInCart ? 'opacity-0 pointer-events-none' : 'opacity-100'
              } ${isAdding ? 'cursor-wait' : 'cursor-pointer'}`}
            >
              {/* Liquid Fill Overlay (hover-only affordance, paused while adding) */}
              {!isAdding && (
                <span className="absolute inset-0 translate-y-full rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/btn:translate-y-0" />
              )}

              {/* Waiting-for-backend fill: slides left → right while the add
                  request is in flight, so the shopper sees progress instead of
                  the button just sitting there for however long the request
                  takes. Eases toward (not all the way to) full so it never
                  looks "stuck" waiting on a slow response, then the button
                  flips to the real "Added" state the instant it resolves. */}
              <span
                className="absolute inset-y-0 left-0 bg-white/25 rounded-2xl transition-[width] ease-out"
                style={{ width: isAdding ? '92%' : '0%', transitionDuration: isAdding ? '1600ms' : '0ms' }}
              />

              {/* Button Content */}
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="font-extrabold text-[10px] sm:text-sm uppercase tracking-wider text-white transition-all duration-300 group-hover/btn:text-black group-hover/btn:-translate-x-1">
                  {isAdding ? 'Adding…' : 'Add to Bag'}
                </span>
                <span className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover/btn:bg-black group-hover/btn:text-white">
                  {isAdding ? (
                    <span className="h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                  ) : (
                    <>
                      <HugeiconsIcon icon={ArrowRight01Icon} size={13} strokeWidth={2.4} className="sm:hidden" />
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

