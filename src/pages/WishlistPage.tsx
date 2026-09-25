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
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

export function WishlistPage() {
  const { wishlistIds, wishlistCount } = useWishlist()
  const { addToCart } = useCart()
  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)
  const { cards: wishlistProducts, isLoading } = useProductCardsByIds(wishlistIds)

  const handleAddProduct = async (product: ProductItem) => {
    try {
      const variantId = await resolveDefaultVariantId(product.id)
      await addToCart(variantId, 1)
      toast.success(`Added "${product.name}" to bag!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : getErrorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 pb-16 sm:pb-24">
        {/* Header Title Banner */}
        <div className="border-b border-black/10 bg-neutral-50/70 py-8 sm:py-12">
          <div className="kaira-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-black/50">Your Saved Pieces</span>
                <div className="flex items-baseline gap-3 mt-1">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-black uppercase">
                    Favourites
                  </h1>
                  <span className="text-xs sm:text-sm font-extrabold text-black/50">
                    ({wishlistCount} {wishlistCount === 1 ? 'item' : 'items'})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="kaira-container pt-8 sm:pt-12">
          {wishlistIds.length === 0 ? (
            /* Empty Wishlist State */
            <div className="py-20 text-center max-w-md mx-auto animate-fade-in">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 text-black/40 mb-4 shadow-inner">
                <HugeiconsIcon icon={FavouriteIcon} size={36} />
              </div>
              <h2 className="text-2xl font-black text-black">Your wishlist is empty</h2>
              <p className="text-sm font-medium text-black/50 mt-1.5">
                Explore our catalog and tap the heart icon on any piece to save it here.
              </p>
              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                >
                  <span>Explore Collection</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Link>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
              {Array.from({ length: wishlistIds.length }).map((_, i) => (
                <div key={i} className="aspect-[3.6/4.05] rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : (
            /* Canonical ProductCard Grid matching Home & Category Pages: 2 cols on mobile, 3 on sm/md, 4 on desktop, 5 on large screens */
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
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
