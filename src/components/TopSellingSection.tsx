import { useState } from 'react'
import { toast } from 'sonner'
import { ProductCard, type ProductItem } from './ProductCard'
import { Reveal } from './Reveal'
import { useCart } from '../context/CartContext'
import { ProductDetailDrawer } from './ProductDetailDrawer'
import { useFeaturedProducts, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { resolveDefaultVariantId } from '../services/product.service'
import { getErrorMessage } from '../services/api'

interface TopSellingSectionProps {
  onAddToCart?: (product: ProductItem) => void
}

export function TopSellingSection({ onAddToCart }: TopSellingSectionProps) {
  const { addToCart } = useCart()
  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)
  const { data: featuredProducts, isLoading, isError } = useFeaturedProducts()

  const products: ProductItem[] = (featuredProducts ?? []).map((fp) => {
    const images = [...fp.product.images].sort((a, b) => a.sortOrder - b.sortOrder)
    const primary = images.find((img) => img.isPrimary) ?? images[0]
    return {
      id: fp.product.id,
      name: fp.product.name,
      categoryName: fp.product.category?.name ?? '',
      price: fp.product.basePrice,
      mrp: fp.product.mrp,
      image: primary?.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE,
      badge: fp.product.badge,
      fit: fp.product.fit,
      fabric: fp.product.fabric,
    }
  })

  const handleAdd = async (product: ProductItem) => {
    if (onAddToCart) {
      onAddToCart(product)
      return
    }
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

  if (isError) return null
  if (!isLoading && products.length === 0) return null

  return (
    <section id="shop" className="py-16 sm:py-24 bg-white">
      <div className="kaira-container">
        {/* Section Header */}
        <Reveal animation="fade-up" duration={700} className="mb-10 sm:mb-14 border-b border-black/5 pb-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/40">Curated Favorites</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight mt-1">
              Top Selling T-Shirts
            </h2>
          </div>
        </Reveal>

        {/* Product Cards Grid: 2 columns on mobile, 3 on sm/md, 4 on desktop, 5 on large screens (xl/2xl) */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-[3.6/3.55] rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5 lg:gap-6">
            {products.map((product, idx) => (
              <Reveal
                key={product.id}
                animation="fade-up"
                delay={(idx % 5) * 90}
                duration={700}
              >
                <ProductCard
                  product={product}
                  imageAspectRatio="aspect-[3.6/3.55]"
                  onAddToCart={handleAdd}
                  onOpenDetail={(id) => setSelectedDrawerProductId(id)}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      {/* Slide-over Product Details Drawer */}
      <ProductDetailDrawer
        productId={selectedDrawerProductId}
        isOpen={Boolean(selectedDrawerProductId)}
        onClose={() => setSelectedDrawerProductId(null)}
      />
    </section>
  )
}
