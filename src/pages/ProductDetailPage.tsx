import { useState, useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { Skeleton } from '../components/Skeleton'
import { formatCurrency } from '../utils/formatCurrency'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useProductDetail, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FavouriteIcon,
  PackageIcon,
  SecurityCheckIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'

interface ColorOption {
  id: string
  name: string
  hex: string
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { items: cartItems, addToCart, removeFromCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')

  const { data: product, isLoading, isError } = useProductDetail(id)

  const colors = useMemo<ColorOption[]>(() => {
    if (!product) return []
    const seen = new Map<string, ColorOption>()
    product.variants.forEach((v) => {
      if (v.color && !seen.has(v.color.id)) {
        seen.set(v.color.id, { id: v.color.id, name: v.color.name, hex: v.color.hexCode })
      }
    })
    return Array.from(seen.values())
  }, [product])

  const [selectedImage, setSelectedImage] = useState('')
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [addedNotification, setAddedNotification] = useState(false)

  // Each color can have its own photoshoot; images not tagged to a specific
  // color are shared/generic and shown regardless of the selected color. If
  // a color has no images of its own yet, fall back to the generic set (or
  // everything) so the gallery is never empty.
  const images = useMemo(() => {
    if (!product) return []
    const sorted = [...product.images].sort((a, b) => a.sortOrder - b.sortOrder)
    if (!selectedColor) return sorted.map((img) => img.imageUrl)
    const forColor = sorted.filter((img) => img.colorId === selectedColor.id)
    const generic = sorted.filter((img) => !img.colorId)
    const pool = forColor.length > 0 ? [...forColor, ...generic] : generic.length > 0 ? generic : sorted
    return pool.map((img) => img.imageUrl)
  }, [product, selectedColor])

  useEffect(() => {
    if (product) {
      setSelectedColor((prev) => prev ?? colors[0] ?? null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  useEffect(() => {
    setSelectedImage(images[0] || PLACEHOLDER_PRODUCT_IMAGE)
  }, [images])

  const sizes = useMemo(() => {
    if (!product) return []
    const seen = new Map<string, { code: string; sortOrder: number }>()
    product.variants
      .filter((v) => !selectedColor || v.color?.hexCode === selectedColor.hex)
      .forEach((v) => {
        if (v.size && !seen.has(v.size.id)) {
          seen.set(v.size.id, { code: v.size.code, sortOrder: v.size.sortOrder })
        }
      })
    return Array.from(seen.values()).sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.code)
  }, [product, selectedColor])

  useEffect(() => {
    setSelectedSize(sizes[0] || '')
  }, [sizes])

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <div>
          <Navbar />
          {/* Skeleton mirroring the two-column gallery + details layout below */}
          <section className="py-6 lg:py-10">
            <div className="kaira-container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start">
                {/* Left Column: Gallery */}
                <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
                  <div className="flex sm:flex-col gap-2.5 sm:gap-3 shrink-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-2xl shrink-0"
                      />
                    ))}
                  </div>
                  <Skeleton className="flex-1 min-h-[380px] sm:min-h-[460px] lg:min-h-[500px] rounded-3xl" />
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3 pb-4 border-b border-black/10">
                    <Skeleton className="h-3 w-24 rounded" />
                    <Skeleton className="h-8 w-3/4 rounded" />
                    <Skeleton className="h-7 w-28 rounded" />
                  </div>
                  <div className="space-y-2.5">
                    <Skeleton className="h-3 w-20 rounded" />
                    <div className="flex items-center gap-3">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-9 rounded-full" />
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    <Skeleton className="h-3 w-24 rounded" />
                    <div className="grid grid-cols-5 gap-2.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-11 rounded-xl" />
                      ))}
                    </div>
                  </div>
                  <Skeleton className="h-14 w-full rounded-full" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 rounded-xl" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <Navbar />
        <div className="kaira-container py-24 text-center space-y-2">
          <h1 className="text-2xl font-black">Product not found</h1>
          <p className="text-sm text-black/50">This product may have been removed or is no longer available.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const selectedVariant = product.variants.find(
    (v) => v.color?.hexCode === selectedColor?.hex && v.size?.code === selectedSize
  )
  const effectivePrice = selectedVariant?.price ?? product.basePrice
  const effectiveMrp = product.mrp
  const cartEntry = cartItems.find((item) => item.variantId === selectedVariant?.id)
  const isInCart = Boolean(cartEntry)

  const handleAddToCart = async () => {
    if (isInCart) {
      if (cartEntry) removeFromCart(cartEntry.id)
      return
    }
    if (!selectedVariant) return
    try {
      await addToCart(selectedVariant.id, 1)
      setAddedNotification(true)
      setTimeout(() => setAddedNotification(false), 2500)
    } catch {
      // addToCart already surfaces a toast on failure
    }
  }

  const isWishlisted = isInWishlist(product.id)

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar />

        {/* Split Viewport Layout: Sticky Left Image Gallery + Scrollable Right Specs */}
        <section className="py-6 lg:py-10">
          <div className="kaira-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 xl:gap-12 items-start">

              {/* Left Column: Sticky Image Gallery (Tablet Landscape & Desktop Optimized) */}
              <div className="lg:col-span-7 lg:sticky lg:top-24 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 h-auto lg:h-[calc(100vh-180px)] lg:max-h-[580px]">
                {/* Thumbnails */}
                <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 pr-1 max-h-full">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImage === img
                          ? 'border-black shadow-md scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Main Image Container */}
                <div className="relative flex-1 h-full min-h-[380px] sm:min-h-[460px] lg:min-h-0 overflow-hidden rounded-3xl bg-neutral-100 border border-black/10 shadow-sm">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className={`absolute right-4 top-4 sm:right-5 sm:top-5 z-10 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white/95 backdrop-blur-md transition-all cursor-pointer hover:scale-110 shadow-md ${
                      isWishlisted ? 'text-red-500 fill-red-500' : 'text-black/80 hover:text-black'
                    }`}
                  >
                    <HugeiconsIcon icon={FavouriteIcon} size={18} />
                  </button>

                  {/* Pure Black Full-Width Badge Bar */}
                  {product.badge && (
                    <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none animate-badge-slide-up">
                      <div className="pure-black-badge-bar w-full py-2 px-4 text-center shadow-md">
                        <span className="text-xs sm:text-sm font-bold tracking-wide text-white">
                          {product.badge}
                        </span>
                      </div>
                    </div>
                  )}

                  <img
                    src={selectedImage || PLACEHOLDER_PRODUCT_IMAGE}
                    alt={product.name}
                    className="h-full w-full object-cover object-top transition-all duration-500"
                  />
                </div>
              </div>

              {/* Right Column: Independently Scrollable Details, Purchase & Specs */}
              <div className="lg:col-span-5 space-y-6">
                {/* Meta Header */}
                <div className="space-y-3 pb-4 border-b border-black/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-widest text-black/50">
                      {product.category?.name}
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-black">
                        {formatCurrency(effectivePrice)}
                      </span>
                      {effectiveMrp > effectivePrice && (
                        <span className="text-base font-bold text-black/40 line-through">
                          {formatCurrency(effectiveMrp)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-black/60 block">
                      Price incl. of all taxes
                    </span>
                  </div>
                </div>

                {/* Color Selector */}
                {colors.length > 0 && (
                  <div className="space-y-2.5">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-black">
                      Color: <span className="text-black/70 font-semibold">{selectedColor?.name}</span>
                    </label>
                    <div className="flex items-center gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`relative h-9 w-9 rounded-full border-2 transition-all cursor-pointer ${
                            selectedColor?.name === color.name ? 'border-black scale-110 shadow-sm' : 'border-black/20 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {sizes.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
                      <span>Select Size</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2.5">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 rounded-xl border text-xs font-extrabold uppercase transition-all cursor-pointer ${
                            selectedSize === size
                              ? 'border-black bg-black text-white shadow-md'
                              : 'border-black/20 bg-white text-black hover:border-black'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add to Cart CTA */}
                <div className="space-y-4 pt-2">
                  {addedNotification && (
                    <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 py-3 text-xs font-extrabold text-emerald-800 animate-fade-in-up">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} />
                      <span>Added to your Bag!</span>
                    </div>
                  )}

                  <LiquidButton
                    onClick={handleAddToCart}
                    variant={isInCart ? 'outline' : 'primary'}
                    className="w-full !py-4 justify-between !text-base shadow-lg"
                  >
                    <span>
                      {isInCart ? '✓ Already in Bag' : 'Add to Bag'} • {formatCurrency(effectivePrice)}
                    </span>
                  </LiquidButton>

                  {/* High Visibility Value Badges - Bold 4-Grid Contrast & Clear Layout */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4">
                    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-black/5 border border-black/15 text-center transition-all hover:bg-black/10">
                      <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                        <HugeiconsIcon icon={PackageIcon} size={18} />
                      </div>
                      <span className="text-xs font-black text-black leading-tight">Free Express Shipping</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-black/5 border border-black/15 text-center transition-all hover:bg-black/10">
                      <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                        <HugeiconsIcon icon={RefreshIcon} size={18} />
                      </div>
                      <span className="text-xs font-black text-black leading-tight">7-Day Easy Returns</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-black/5 border border-black/15 text-center transition-all hover:bg-black/10">
                      <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                        <HugeiconsIcon icon={SecurityCheckIcon} size={18} />
                      </div>
                      <span className="text-xs font-black text-black leading-tight">Quality Assured</span>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-black/5 border border-black/15 text-center transition-all hover:bg-black/10">
                      <div className="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center shadow-xs">
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} size={18} />
                      </div>
                      <span className="text-xs font-black text-black leading-tight">Cash on Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Minimalist Border-Divided Accordions (No Card Backgrounds) with Smooth Animations */}
                <div className="pt-6 border-t border-black/15">
                  <h3 className="text-xs font-black uppercase tracking-widest text-black/50 mb-2">
                    Product Details
                  </h3>

                  {/* Accordion 1: Product Description */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('description')}
                      className="w-full py-4 flex items-center justify-between font-black text-sm text-black uppercase tracking-wider text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Product Description</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 ${openAccordion === 'description' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${openAccordion === 'description' ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0'}`}>
                      <div className="overflow-hidden">
                        <div className="space-y-4 pt-1">
                          <p className="text-sm text-black/80 font-medium leading-relaxed">
                            {product.description || 'No additional description available for this product yet.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion 2: Specifications & Availability */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('specs')}
                      className="w-full py-4 flex items-center justify-between font-black text-sm text-black uppercase tracking-wider text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Specifications & Availability</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 ${openAccordion === 'specs' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${openAccordion === 'specs' ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0'}`}>
                      <div className="overflow-hidden">
                        <div className="space-y-3 pt-1 text-sm text-black/80 font-bold">
                          <div className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                            <span>Product Type: {product.productType}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                            <span>Category: {product.category?.name}</span>
                          </div>
                          {selectedVariant && (
                            <>
                              <div className="flex items-center gap-2.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                                <span>SKU: {selectedVariant.sku}</span>
                              </div>
                              <div className="pt-3 text-xs font-bold text-black/60 border-t border-black/5 mt-2 flex items-center gap-2">
                                <span>
                                  {selectedVariant.stockQuantity > 0
                                    ? `${selectedVariant.stockQuantity} in stock`
                                    : 'Currently out of stock'}{' '}
                                  for {selectedColor?.name} / {selectedSize}
                                </span>
                                {selectedVariant.badge && (
                                  <span className="rounded-full bg-black px-2 py-0.5 text-[11px] font-bold text-white">
                                    {selectedVariant.badge}
                                  </span>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
