import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ProductCard, type ProductItem } from '../components/ProductCard'
import { ProductDetailDrawer } from '../components/ProductDetailDrawer'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import { useProductCardsByIds } from '../hooks/queries'
import { resolveDefaultVariantId } from '../services/product.service'
import { getErrorMessage } from '../services/api'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FavouriteIcon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
  Delete02Icon,
  PackageIcon,
  SecurityCheckIcon,
} from '@hugeicons/core-free-icons'

export function WishlistPage() {
  const { wishlistIds, wishlistCount, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)
  const { cards: wishlistProducts, isLoading } = useProductCardsByIds(wishlistIds)

  const handleAddProduct = async (product: ProductItem) => {
    let variantId: string
    try {
      variantId = await resolveDefaultVariantId(product.id)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : getErrorMessage(err))
      return
    }
    // addToCart already surfaces its own toast on failure.
    await addToCart(variantId, 1).catch(() => {})
  }

  const handleMoveAllToBag = async () => {
    // Sequential, not Promise.all/forEach — addToCart shares one in-flight
    // sign-in popup, but only if calls actually wait their turn.
    for (const product of wishlistProducts) {
      await handleAddProduct(product)
    }
    clearWishlist()
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* Header Title */}
        <div className="border-b border-black/10 bg-neutral-50/60 py-6 sm:py-8">
          <div className="kaira-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-black uppercase">
                    Saved Items
                  </h1>
                  <span className="text-xs sm:text-sm font-extrabold text-black/50">
                    ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})
                  </span>
                </div>
              </div>

              {wishlistIds.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleMoveAllToBag}
                    className="flex items-center gap-1.5 rounded-2xl bg-black px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
                    <span>Move All to Bag</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearWishlist}
                    className="flex items-center gap-1 rounded-2xl border border-black/15 bg-white px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black/70 hover:text-black hover:border-black transition-all cursor-pointer shadow-2xs"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={14} />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="kaira-container pt-8 sm:pt-12">
          {wishlistIds.length === 0 ? (
            /* Empty Wishlist State */
            <div className="py-20 text-center max-w-md mx-auto animate-fade-in">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-black/40 mb-4">
                <HugeiconsIcon icon={FavouriteIcon} size={36} />
              </div>
              <h2 className="text-2xl font-black text-black">Your wishlist is empty</h2>
              <p className="text-sm text-black/50 mt-1.5">
                Explore our catalog and tap the heart icon on any piece to save it here for later.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                >
                  <span>Explore Collection</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {Array.from({ length: wishlistIds.length }).map((_, i) => (
                <div key={i} className="aspect-[4/4.2] rounded-xl sm:rounded-2xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            /* Canonical ProductCard Grid matching Home & Category Pages: 2 cols on mobile, 4 on desktop */
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {wishlistProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddProduct}
                  onOpenDetail={(id) => setSelectedDrawerProductId(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Value Props Row */}
        <div className="kaira-container mt-16 sm:mt-24">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-black/10 pt-10 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black shadow-2xs">
                <HugeiconsIcon icon={PackageIcon} size={22} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider">Free Express Delivery</div>
                <div className="text-xs text-black/50 mt-0.5">On all prepaid orders across India</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black shadow-2xs">
                <HugeiconsIcon icon={SecurityCheckIcon} size={22} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider">Genuine Quality</div>
                <div className="text-xs text-black/50 mt-0.5">100% crafted premium combed cotton</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 p-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-black shadow-2xs">
                <HugeiconsIcon icon={FavouriteIcon} size={22} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-wider">Saved For You</div>
                <div className="text-xs text-black/50 mt-0.5">Stored securely on your browser</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Slide-over Product Quick View Drawer */}
      <ProductDetailDrawer
        productId={selectedDrawerProductId}
        isOpen={Boolean(selectedDrawerProductId)}
        onClose={() => setSelectedDrawerProductId(null)}
      />

      <Footer />
    </div>
  )
}
