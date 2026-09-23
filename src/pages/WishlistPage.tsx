import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ProductCard, type ProductItem } from '../components/ProductCard'
import { ProductDetailDrawer } from '../components/ProductDetailDrawer'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
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
  const { wishlistProducts, wishlistCount, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)

  const handleAddProduct = (product: ProductItem) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp || product.price,
      size: 'M',
      color: { name: 'Tone', hex: product.colors?.[0] || '#000000' },
      image: product.image,
      quantity: 1,
    })
  }

  const handleMoveAllToBag = () => {
    wishlistProducts.forEach((product) => {
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
    })
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

              {wishlistProducts.length > 0 && (
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleMoveAllToBag}
                    className="flex items-center gap-1.5 rounded-full bg-black px-5 py-2.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    <HugeiconsIcon icon={ShoppingBag01Icon} size={15} />
                    <span>Move All to Bag</span>
                  </button>
                  <button
                    type="button"
                    onClick={clearWishlist}
                    className="flex items-center gap-1 rounded-full border border-black/15 bg-white px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider text-black/70 hover:text-black hover:border-black transition-all cursor-pointer shadow-2xs"
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
          {wishlistProducts.length === 0 ? (
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
                  className="inline-flex items-center gap-2 rounded-full bg-black px-7 py-3.5 text-xs font-black uppercase tracking-wider text-white hover:bg-neutral-800 transition-all shadow-md active:scale-95"
                >
                  <span>Explore Collection</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                </Link>
              </div>
            </div>
          ) : (
            /* Canonical ProductCard Grid matching Home & Category Pages */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {wishlistProducts.map((p) => {
                const productItem: ProductItem = {
                  id: p.id,
                  name: p.name,
                  category: p.category,
                  price: p.price,
                  mrp: p.mrp,
                  image: p.images[0],
                  rating: p.rating,
                  reviewsCount: p.reviewsCount,
                  badge: p.badge,
                  colors: p.colors.map((c) => c.hex),
                }

                return (
                  <ProductCard
                    key={p.id}
                    product={productItem}
                    onAddToCart={handleAddProduct}
                    onOpenDetail={(id) => setSelectedDrawerProductId(id)}
                  />
                )
              })}
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
