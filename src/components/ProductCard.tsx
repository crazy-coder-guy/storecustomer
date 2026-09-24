import { Link } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon, ArrowRight01Icon, CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'
import { formatCurrency } from '../utils/formatCurrency'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import type { ProductCardData } from '../hooks/queries'

export type ProductItem = ProductCardData

interface ProductCardProps {
  product: ProductItem
  onAddToCart?: (product: ProductItem) => void
  onOpenDetail?: (productId: string) => void
}

export function ProductCard({ product, onAddToCart, onOpenDetail }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { items: cartItems, removeFromCart } = useCart()
  const isWishlisted = isInWishlist(product.id)
  const cartEntries = cartItems.filter((item) => item.productId === product.id)
  const isInCart = cartEntries.length > 0

  function handleBagButtonClick() {
    if (isInCart) {
      cartEntries.forEach((item) => removeFromCart(item.id))
    } else {
      onAddToCart?.(product)
    }
  }

  return (
    <div className="group relative flex flex-col space-y-2 sm:space-y-3 cursor-pointer select-none">
      {/* Product Image Container */}
      <Link to={`/product/${product.id}`} className="relative aspect-[4/4.2] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-gray-100 block">
        {/* Pure Black Full-Width Badge Bar */}
        {product.badge && (
          <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none animate-badge-slide-up">
            <div className="pure-black-badge-bar w-full py-1 sm:py-1.5 px-2 sm:px-3 text-center shadow-md">
              <span className="text-[9px] sm:text-xs font-bold tracking-wide text-white line-clamp-1">
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
            isWishlisted ? 'text-red-500 fill-red-500' : 'text-black/70 hover:text-black'
          }`}
          aria-label="Add to Wishlist"
        >
          <HugeiconsIcon icon={FavouriteIcon} size={14} className="sm:hidden" />
          <HugeiconsIcon icon={FavouriteIcon} size={16} className="hidden sm:block" />
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
              <h3 className="text-sm sm:text-xl font-extrabold text-black">
                {product.name}
              </h3>
            </button>
          ) : (
            <Link to={`/product/${product.id}`} className="block">
              <h3 className="text-sm sm:text-xl font-extrabold text-black group-hover:text-black/70 transition-colors line-clamp-1 mt-0.5 sm:mt-1">
                {product.name}
              </h3>
            </Link>
          )}

          <div className="flex items-baseline gap-1.5 sm:gap-2.5 pt-0.5 sm:pt-1">
            <span className="text-sm sm:text-xl font-black text-black">{formatCurrency(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[11px] sm:text-sm font-semibold text-black/40 line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>
        </div>

        {/* Separate Liquid Add to Bag Button */}
        <div className="pt-1 sm:pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleBagButtonClick()
            }}
            aria-label={isInCart ? 'Remove from Bag' : 'Add to Bag'}
            className={`group/btn tap-press relative flex w-full items-center justify-between overflow-hidden rounded-2xl border px-3 sm:px-6 py-2 sm:py-3 transition-all duration-300 hover:shadow-lg cursor-pointer ${
              isInCart ? 'border-black bg-white' : 'border-black bg-black'
            }`}
          >
            {/* Liquid Fill Overlay */}
            {!isInCart && (
              <span className="absolute inset-0 translate-y-full rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/btn:translate-y-0" />
            )}

            {/* Button Content */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span
                className={`font-extrabold text-[10px] sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                  isInCart ? 'text-black' : 'text-white group-hover/btn:text-black group-hover/btn:-translate-x-1'
                }`}
              >
                {isInCart ? '✓ Added' : 'Add to Bag'}
              </span>
              <span
                className={`flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-300 ${
                  isInCart ? 'bg-black text-white' : 'bg-white text-black group-hover/btn:bg-black group-hover/btn:text-white'
                }`}
              >
                <HugeiconsIcon icon={isInCart ? CheckmarkCircle02Icon : ArrowRight01Icon} size={13} strokeWidth={2.4} className="sm:hidden" />
                <HugeiconsIcon icon={isInCart ? CheckmarkCircle02Icon : ArrowRight01Icon} size={16} strokeWidth={2.4} className="hidden sm:block" />
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

