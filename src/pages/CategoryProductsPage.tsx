import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ProductCard, type ProductItem } from '../components/ProductCard'
import { ProductDetailDrawer } from '../components/ProductDetailDrawer'
import { useCart } from '../context/CartContext'
import { useCategories, useProductCards, useProducts } from '../hooks/queries'
import { resolveDefaultVariantId } from '../services/product.service'
import { getErrorMessage } from '../services/api'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon } from '@hugeicons/core-free-icons'

export function CategoryProductsPage() {
  const { slug } = useParams<{ slug: string }>()
  const { addToCart } = useCart()
  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories({ status: 'ACTIVE', limit: 100 })
  const category = useMemo(
    () => categoriesData?.items.find((c) => c.slug === slug),
    [categoriesData, slug]
  )

  const { data: productsData, isLoading: productsLoading } = useProducts(
    { category_id: category?.id, status: 'ACTIVE', limit: 100 },
    Boolean(category)
  )
  const { cards } = useProductCards(productsData?.items)

  const products: ProductItem[] = cards

  const handleAdd = async (product: ProductItem) => {
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

  const isLoading = categoriesLoading || (Boolean(category) && productsLoading)
  const notFound = !categoriesLoading && !category

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Compact Integrated Header Bar */}
        <section className="py-6 sm:py-8 border-b border-black/10">
          <div className="kaira-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
                    {notFound ? 'Curated Collection' : category?.name || ''}
                  </h1>
                  {category?.badge && (
                    <span className="rounded-full bg-black px-2.5 py-1 text-[11px] font-bold text-white">
                      {category.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-black/65 font-medium max-w-2xl">
                  {notFound
                    ? 'This category could not be found. Explore our full collection instead.'
                    : category?.description || 'Exceptional modern garments tailored with heavy organic cottons and modern silhouettes.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Category Products Grid */}
        <section className="py-6 sm:py-10">
          <div className="kaira-container">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-black/5 text-xs font-bold text-black/60 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={FilterIcon} size={16} />
                <span>Showing {products.length} Products</span>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-[4/4.2] rounded-2xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="py-16 text-center text-sm font-semibold text-black/50">
                No products found in this category yet.
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
        </section>
      </div>

      <Footer />

      {/* Slide-over Product Details Drawer */}
      <ProductDetailDrawer
        productId={selectedDrawerProductId}
        isOpen={Boolean(selectedDrawerProductId)}
        onClose={() => setSelectedDrawerProductId(null)}
      />
    </div>
  )
}
