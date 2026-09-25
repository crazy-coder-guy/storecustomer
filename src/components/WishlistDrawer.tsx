import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  FavouriteIcon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
  Delete02Icon,
} from '@hugeicons/core-free-icons'
import { toast } from 'sonner'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useProductCardsByIds } from '../hooks/queries'
import { formatCurrency } from '../utils/formatCurrency'
import { resolveDefaultVariantId } from '../services/product.service'
import { getErrorMessage } from '../services/api'
import { LiquidButton } from './LiquidButton'

export function WishlistDrawer() {
  const navigate = useNavigate()
  const { isWishlistOpen, closeWishlist, wishlistIds, removeFromWishlist } = useWishlist()
  const { addToCart } = useCart()
  const { cards: wishlistProducts, isLoading } = useProductCardsByIds(wishlistIds)

  // Prevent background scrolling while drawer is open
  useEffect(() => {
    if (isWishlistOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isWishlistOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isWishlistOpen) {
        closeWishlist()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isWishlistOpen, closeWishlist])

  if (!isWishlistOpen) return null

  async function handleQuickAddToCart(productId: string, productName: string) {
    try {
      const variantId = await resolveDefaultVariantId(productId)
      await addToCart(variantId, 1)
      toast.success(`Added "${productName}" to bag`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : getErrorMessage(err))
    }
  }

  function handleProductClick(productId: string) {
    closeWishlist()
    navigate(`/product/${productId}`)
  }

  return createPortal(
    <div className="fixed inset-0 z-[999] overflow-hidden font-sans" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        onClick={closeWishlist}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
      />

      {/* Drawer Container (Slides in from Right) */}
      <div className="fixed inset-y-0 right-0 z-10 flex h-full max-h-screen max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-screen animate-drawer-slide-in">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-black/10 px-5 sm:px-6 py-4.5 bg-white/95 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-black">
                <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-black tracking-tight text-black leading-tight">
                  Saved Pieces
                </h2>
                <span className="text-xs font-semibold text-black/50">
                  {wishlistIds.length} {wishlistIds.length === 1 ? 'item saved' : 'items saved'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeWishlist}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-black/5 hover:bg-black hover:text-white transition-all text-black/70 cursor-pointer"
              aria-label="Close Wishlist Drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 scrollbar-none">
            {wishlistIds.length === 0 ? (
              /* Empty State */
              <div className="py-24 text-center max-w-xs mx-auto space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-black/40 shadow-inner">
                  <HugeiconsIcon icon={FavouriteIcon} size={28} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-black">Your wishlist is empty</h3>
                  <p className="text-xs text-black/50 font-medium leading-relaxed">
                    Explore our collection and tap the heart icon on any piece to save it here.
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeWishlist()
                      navigate('/products')
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <span>Explore Collection</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
                  </button>
                </div>
              </div>
            ) : isLoading ? (
              /* Loading Skeleton */
              <div className="divide-y divide-black/5">
                {Array.from({ length: wishlistIds.length || 3 }).map((_, i) => (
                  <div key={i} className="py-5 flex gap-4 animate-pulse">
                    <div className="h-24 w-20 rounded-xl bg-neutral-100 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-3 w-16 rounded bg-neutral-100" />
                      <div className="h-4 w-3/4 rounded bg-neutral-100" />
                      <div className="h-4 w-1/3 rounded bg-neutral-100" />
                      <div className="h-8 w-28 rounded-xl bg-neutral-100 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Saved Items - Clean Borderless List View with Dividers */
              <div className="divide-y divide-black/10">
                {wishlistProducts.map((product) => {
                  const hasDiscount = product.mrp && product.mrp > product.price
                  const discountPercent = hasDiscount
                    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                    : null

                  return (
                    <div
                      key={product.id}
                      className="py-3.5 flex gap-3.5 group transition-colors items-center"
                    >
                      {/* Product Thumbnail */}
                      <button
                        type="button"
                        onClick={() => handleProductClick(product.id)}
                        className="relative h-20 w-16 sm:h-22 sm:w-18 shrink-0 rounded-xl overflow-hidden bg-neutral-100 cursor-pointer block group-hover:opacity-90 transition-opacity"
                        title={product.name}
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105 pointer-events-none select-none"
                          draggable={false}
                        />
                      </button>

                      {/* Product Details */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/45 block truncate">
                            {product.categoryName || 'Streetwear'}
                          </span>
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFromWishlist(product.id)
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-black/35 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                            aria-label="Remove from wishlist"
                            title="Remove item"
                          >
                            <HugeiconsIcon icon={Delete02Icon} size={15} />
                          </button>
                        </div>

                        {/* Product Title */}
                        <button
                          type="button"
                          onClick={() => handleProductClick(product.id)}
                          className="text-left w-full cursor-pointer block"
                        >
                          <h4 className="text-sm font-bold text-black truncate hover:underline underline-offset-2">
                            {product.name}
                          </h4>
                        </button>

                        {/* Pricing Row with Liquid Glass Add to Bag Button */}
                        <div className="flex items-center justify-between gap-2 pt-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm font-black text-black">
                              {formatCurrency(product.price)}
                            </span>
                            {hasDiscount && (
                              <span className="text-[11px] font-semibold text-black/40 line-through">
                                {formatCurrency(product.mrp)}
                              </span>
                            )}
                            {discountPercent && (
                              <span className="text-[9px] font-extrabold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                                {discountPercent}% OFF
                              </span>
                            )}
                          </div>

                          {/* Home Banner Style LiquidButton for Add to Bag */}
                          <button
                            type="button"
                            onClick={() => handleQuickAddToCart(product.id, product.name)}
                            className="group/lbtn tap-press relative inline-flex items-center justify-between overflow-hidden rounded-xl border border-black bg-black pl-3 pr-1.5 py-1.5 transition-all duration-300 shadow-2xs hover:shadow-xs cursor-pointer select-none shrink-0"
                            title="Add to Bag"
                          >
                            {/* Liquid Fill Overlay (rises on hover) */}
                            <span className="absolute inset-0 translate-y-full rounded-xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover/lbtn:translate-y-0" />

                            <div className="relative z-10 flex items-center gap-2">
                              <span className="whitespace-nowrap font-extrabold text-[11px] tracking-wide text-white transition-all duration-300 ease-out group-hover/lbtn:text-black">
                                Add to Bag
                              </span>
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover/lbtn:scale-105 group-hover/lbtn:bg-black group-hover/lbtn:text-white">
                                <HugeiconsIcon icon={ShoppingBag01Icon} size={12} strokeWidth={2.2} />
                              </span>
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer Action using the exact Home Screen Banner LiquidButton */}
          {wishlistIds.length > 0 && (
            <div className="shrink-0 p-4 sm:p-5 border-t border-black/10 bg-white">
              <LiquidButton
                href="/cart"
                onClick={closeWishlist}
                variant="primary"
                className="w-full !rounded-2xl"
              >
                Go to Shopping Bag
              </LiquidButton>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
