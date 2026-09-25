import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Navbar } from '../components/Navbar'
import { ProductCard, type ProductItem } from '../components/ProductCard'
import { ProductDetailDrawer } from '../components/ProductDetailDrawer'
import { Reveal } from '../components/Reveal'
import { useCart } from '../context/CartContext'
import { useCategories, useProductCards, useSizes, useStorefrontProducts } from '../hooks/queries'
import { resolveDefaultVariantId } from '../services/product.service'
import { getErrorMessage } from '../services/api'
import type { ProductListItem } from '../types'
import { HugeiconsIcon } from '@hugeicons/react'
import { FilterIcon, Cancel01Icon, ArrowDown01Icon } from '@hugeicons/core-free-icons'

const PAGE_SIZE = 24

const FIT_OPTIONS: { value: string; label: string }[] = [
  { value: 'REGULAR', label: 'Regular' },
  { value: 'SLIM', label: 'Slim' },
  { value: 'OVERSIZED', label: 'Oversized' },
  { value: 'RELAXED', label: 'Relaxed' },
]

const SORT_OPTIONS = [
  { value: 'created_at:desc', label: 'Newest First' },
  { value: 'base_price:asc', label: 'Price: Low to High' },
  { value: 'base_price:desc', label: 'Price: High to Low' },
  { value: 'name:asc', label: 'Name: A to Z' },
]

function toggleInList(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value]
}

export function AllProductsPage() {
  const { addToCart } = useCart()
  const [selectedDrawerProductId, setSelectedDrawerProductId] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const [categoryIds, setCategoryIds] = useState<string[]>([])
  const [sizeIds, setSizeIds] = useState<string[]>([])
  const [fits, setFits] = useState<string[]>([])
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  const [sort, setSort] = useState(SORT_OPTIONS[0].value)
  const [sortBy, sortOrder] = sort.split(':') as [string, 'asc' | 'desc']

  // The backend caps `limit` at 100 regardless of what's requested, so
  // "show more" has to walk through real pages and accumulate them
  // client-side rather than ever requesting one huge page.
  const [page, setPage] = useState(1)
  const [allItems, setAllItems] = useState<ProductListItem[]>([])
  const lastMergedPageRef = useRef(0)

  const { data: categoriesData } = useCategories({ status: 'ACTIVE', limit: 100 })
  const { data: sizesData } = useSizes()

  // Any filter/sort change starts the results fresh from page one again.
  useEffect(() => {
    setPage(1)
    setAllItems([])
    lastMergedPageRef.current = 0
  }, [categoryIds, sizeIds, fits, minPrice, maxPrice, inStockOnly, sortBy, sortOrder])

  const { data: productsData, isLoading, isFetching } = useStorefrontProducts({
    category_id: categoryIds.length > 0 ? categoryIds : undefined,
    size_id: sizeIds.length > 0 ? sizeIds : undefined,
    fit: fits.length > 0 ? fits : undefined,
    min_price: minPrice ? Number(minPrice) : undefined,
    max_price: maxPrice ? Number(maxPrice) : undefined,
    in_stock: inStockOnly || undefined,
    sortBy,
    sortOrder,
    page,
    limit: PAGE_SIZE,
  })

  useEffect(() => {
    if (!productsData) return
    if (page === 1) {
      setAllItems(productsData.items)
      lastMergedPageRef.current = 1
    } else if (lastMergedPageRef.current < page) {
      setAllItems((prev) => [...prev, ...productsData.items])
      lastMergedPageRef.current = page
    }
  }, [productsData, page])

  const { cards } = useProductCards(allItems)
  const products: ProductItem[] = cards
  const totalCount = productsData?.meta.total ?? 0
  const hasMore = products.length < totalCount
  const isLoadingMore = isFetching && page > 1
  // `isLoading` from react-query is unreliable here: `placeholderData` keeps
  // reporting the *previous* filter's result as "loaded" for an instant
  // after a filter change clears `allItems`, which would otherwise flash
  // "No products found" before the new page arrives. Base it on actual item
  // count instead.
  const showSkeleton = allItems.length === 0 && (isLoading || isFetching)

  function handleLoadMore() {
    setPage((p) => p + 1)
  }

  const activeFilterCount =
    categoryIds.length + sizeIds.length + fits.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0) + (inStockOnly ? 1 : 0)

  const clearAllFilters = () => {
    setCategoryIds([])
    setSizeIds([])
    setFits([])
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

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

  const filterPanel = useMemo(
    () => (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black uppercase tracking-wide text-black">Filters</h3>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-bold text-black/50 hover:text-black underline underline-offset-2 cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Category */}
        {categoriesData && categoriesData.items.length > 0 && (
          <div className="space-y-3 border-t border-black/10 pt-4">
            <p className="text-sm font-black uppercase tracking-wide text-black/60">Category</p>
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {categoriesData.items.map((category) => (
                <label key={category.id} className="flex items-center gap-2.5 text-base font-bold text-black/80 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={categoryIds.includes(category.id)}
                    onChange={() => setCategoryIds((prev) => toggleInList(prev, category.id))}
                    className="h-4.5 w-4.5 rounded border-black/25 text-black focus:ring-black cursor-pointer"
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-3 border-t border-black/10 pt-4">
          <p className="text-sm font-black uppercase tracking-wide text-black/60">Price</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold focus:border-black focus:outline-none"
            />
            <span className="text-black/30 text-sm">–</span>
            <input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold focus:border-black focus:outline-none"
            />
          </div>
        </div>

        {/* Size */}
        {sizesData && sizesData.items.length > 0 && (
          <div className="space-y-3 border-t border-black/10 pt-4">
            <p className="text-sm font-black uppercase tracking-wide text-black/60">Size</p>
            <div className="flex flex-wrap gap-2">
              {sizesData.items.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSizeIds((prev) => toggleInList(prev, size.id))}
                  className={`h-9 min-w-9 px-2.5 rounded-lg border text-sm font-black transition-all cursor-pointer ${
                    sizeIds.includes(size.id)
                      ? 'border-black bg-black text-white'
                      : 'border-black/15 bg-white text-black hover:border-black'
                  }`}
                >
                  {size.code}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fit */}
        <div className="space-y-3 border-t border-black/10 pt-4">
          <p className="text-sm font-black uppercase tracking-wide text-black/60">Fit</p>
          <div className="flex flex-wrap gap-2">
            {FIT_OPTIONS.map((fit) => (
              <button
                key={fit.value}
                type="button"
                onClick={() => setFits((prev) => toggleInList(prev, fit.value))}
                className={`h-9 px-3.5 rounded-lg border text-sm font-black transition-all cursor-pointer ${
                  fits.includes(fit.value)
                    ? 'border-black bg-black text-white'
                    : 'border-black/15 bg-white text-black hover:border-black'
                }`}
              >
                {fit.label}
              </button>
            ))}
          </div>
        </div>

        {/* In Stock */}
        <label className="flex items-center gap-2.5 text-base font-bold text-black/80 cursor-pointer border-t border-black/10 pt-4">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-black/25 text-black focus:ring-black cursor-pointer"
          />
          <span>In Stock Only</span>
        </label>
      </div>
    ),
    [categoriesData, sizesData, categoryIds, sizeIds, fits, minPrice, maxPrice, inStockOnly, activeFilterCount]
  )

  return (
    <div className="h-screen overflow-hidden bg-white text-black flex flex-col">
      <Navbar />

      <section className="flex-1 min-h-0 pt-0 pb-3 sm:pb-4">
        <div className="kaira-container h-full flex flex-col lg:flex-row lg:items-stretch gap-8">
          {/* Desktop Sidebar — its own scroll area, independent of the results column */}
          <aside className="hidden lg:block w-64 shrink-0 h-full overflow-y-auto">{filterPanel}</aside>

          {/* Mobile Filter Drawer */}
          {isFilterOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/50" onClick={() => setIsFilterOpen(false)} />
              <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-white p-5 overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-black uppercase tracking-wider">Filters</span>
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 cursor-pointer"
                    aria-label="Close filters"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={16} />
                  </button>
                </div>
                {filterPanel}
              </div>
            </div>
          )}

          {/* Main Content — the only part of the page that scrolls */}
          <div className="flex-1 min-w-0 min-h-0 h-full overflow-y-auto lg:pr-1">
              <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-black/5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsFilterOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 rounded-xl border border-black/15 px-3 py-2 text-xs font-bold cursor-pointer"
                  >
                    <HugeiconsIcon icon={FilterIcon} size={15} />
                    <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
                  </button>
                  <span className="hidden sm:inline text-xs font-bold text-black/60 uppercase tracking-wider">
                    Showing {products.length} of {totalCount} Products
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none rounded-xl border border-black/15 bg-white pl-3 pr-8 py-2 text-xs font-bold text-black cursor-pointer focus:border-black focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={14}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-black/50"
                  />
                </div>
              </div>

              {showSkeleton ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-[3.6/3.9] rounded-2xl sm:rounded-3xl bg-gray-100 animate-pulse" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="py-16 text-center text-sm font-semibold text-black/50">
                  No products match these filters. Try clearing some of them.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                  {products.map((product, idx) => (
                    <Reveal
                      key={product.id}
                      animation="fade-up"
                      delay={(idx % 5) * 60}
                      duration={650}
                    >
                      <ProductCard
                        product={product}
                        compact
                        onAddToCart={handleAdd}
                        onOpenDetail={(id) => setSelectedDrawerProductId(id)}
                      />
                    </Reveal>
                  ))}
                </div>
              )}

              {!showSkeleton && hasMore && (
                <div className="pt-8 pb-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="inline-flex items-center gap-2 rounded-2xl border border-black/20 bg-white px-8 py-3 text-xs font-black uppercase tracking-wider text-black hover:border-black hover:bg-black hover:text-white transition-all cursor-pointer disabled:cursor-wait disabled:opacity-60"
                  >
                    {isLoadingMore ? (
                      <>
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-black/20 border-t-black animate-spin" />
                        <span>Loading…</span>
                      </>
                    ) : (
                      <span>Load More Products</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

      <ProductDetailDrawer
        productId={selectedDrawerProductId}
        isOpen={Boolean(selectedDrawerProductId)}
        onClose={() => setSelectedDrawerProductId(null)}
      />
    </div>
  )
}
