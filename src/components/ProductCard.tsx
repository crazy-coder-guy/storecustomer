import { useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { FavouriteIcon, ShoppingBag01Icon } from '@hugeicons/core-free-icons'
import { formatCurrency } from '../utils/formatCurrency'

export interface ProductItem {
  id: string
  name: string
  category: string
  price: number
  mrp?: number
  image: string
  rating: number
  reviewsCount: number
  badge?: string
  colors?: string[]
}

interface ProductCardProps {
  product: ProductItem
  onAddToCart?: (product: ProductItem) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  return (
    <div className="group relative flex flex-col space-y-3 cursor-pointer select-none">
      {/* Product Image Container */}
      <div className="relative aspect-[4/4.2] w-full overflow-hidden rounded-2xl bg-gray-100">
        {/* Badge */}
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-black px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white shadow-sm">
            {product.badge}
          </span>
        )}

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setIsWishlisted(!isWishlisted)
          }}
          className={`absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-md transition-all duration-300 cursor-pointer hover:scale-105 shadow-sm ${
            isWishlisted ? 'text-red-500' : 'text-black/70 hover:text-black'
          }`}
          aria-label="Add to Wishlist"
        >
          <HugeiconsIcon icon={FavouriteIcon} size={16} />
        </button>

        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </div>

      {/* Details Below Image */}
      <div className="space-y-1.5 px-0.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-black/50 uppercase tracking-wider">
            <span>{product.category}</span>
            {product.colors && (
              <div className="flex items-center -space-x-1">
                {product.colors.map((hex, i) => (
                  <span
                    key={i}
                    className="h-2.5 w-2.5 rounded-full border border-white shadow-2xs"
                    style={{ backgroundColor: hex }}
                  />
                ))}
              </div>
            )}
          </div>

          <h3 className="text-base font-bold text-black group-hover:text-black/70 transition-colors line-clamp-1 mt-0.5">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-black text-black">{formatCurrency(product.price)}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs font-medium text-black/40 line-through">
                {formatCurrency(product.mrp)}
              </span>
            )}
          </div>
        </div>

        {/* Separate Liquid Add to Bag Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart?.(product)
            }}
            className="group/btn relative flex w-full items-center justify-between overflow-hidden rounded-full border border-black bg-black px-5 py-2.5 transition-all duration-300 hover:shadow-lg cursor-pointer"
          >
            {/* Liquid Fill Overlay */}
            <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/btn:translate-y-0" />

            {/* Button Content */}
            <div className="relative z-10 flex items-center justify-between w-full">
              <span className="font-bold text-xs uppercase tracking-wider text-white transition-all duration-300 group-hover/btn:text-black group-hover/btn:-translate-x-1">
                Add to Bag
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover/btn:bg-black group-hover/btn:text-white">
                <HugeiconsIcon icon={ShoppingBag01Icon} size={14} />
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

