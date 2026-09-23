import { useState } from 'react'
import { ProductCard, type ProductItem } from './ProductCard'
import { useCart } from '../context/CartContext'
import { ProductDetailDrawer } from './ProductDetailDrawer'
import { useFeaturedProducts, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'

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
    }
  })

  const handleAdd = (product: ProductItem) => {
    if (onAddToCart) {
      onAddToCart(product)
    } else {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        mrp: product.mrp || product.price,
        image: product.image,
        size: 'M',
        color: { name: 'Classic Tone', hex: product.colors?.[0] || '#000000' },
        quantity: 1,
      })
    }
  }

  if (isError) return null
  if (!isLoading && products.length === 0) return null

  return (
    <section id="shop" className="py-16 sm:py-24 bg-white">
      <div className="kaira-container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4 border-b border-black/5 pb-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/40">Curated Favorites</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight mt-1">
              Top Selling T-Shirts
            </h2>
          </div>
          <a
            href="#categories"
            className="group flex items-center gap-1 text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            <span>View All Products</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Product Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/4.2] rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAdd}
                onOpenDetail={(id) => setSelectedDrawerProductId(id)}
              />
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
