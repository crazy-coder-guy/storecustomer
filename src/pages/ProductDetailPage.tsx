import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Skeleton } from '../components/Skeleton'
import { formatCurrency } from '../utils/formatCurrency'
import { formatMeasurement } from '../utils/formatMeasurement'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useProductDetailBySlug, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { Reveal } from '../components/Reveal'
import { ShareModal } from '../components/ShareModal'
import { ProductReviews } from '../components/ProductReviews'
import { useSeoMeta } from '../hooks/useSeoMeta'
import { buildProductJsonLd, buildProductBreadcrumb, buildBreadcrumbJsonLd } from '../utils/seo'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FavouriteIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  MinusSignIcon,
  Add01Icon,
  Search01Icon,
  Cancel01Icon,
  RulerIcon,
} from '@hugeicons/core-free-icons'

interface ColorOption {
  id: string
  name: string
  hex: string
}

function formatFit(fit?: string | null): string {
  if (!fit) return ''
  switch (fit.toUpperCase()) {
    case 'OVERSIZED':
      return 'Oversized Fit'
    case 'RELAXED':
      return 'Relaxed Fit'
    case 'SLIM':
      return 'Slim Fit'
    case 'REGULAR':
      return 'Regular Fit'
    default:
      return `${fit} Fit`
  }
}

function formatNeck(neck?: string | null): string {
  if (!neck) return ''
  switch (neck.toUpperCase()) {
    case 'CREW':
      return 'Crew Neck'
    case 'ROUND':
      return 'Round Neck'
    case 'POLO':
      return 'Polo Collar'
    case 'V_NECK':
      return 'V-Neck'
    case 'MOCK':
      return 'Mock Neck'
    default:
      return `${neck} Neck`
  }
}

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { items: cartItems, addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  const { data: product, isLoading, isError } = useProductDetailBySlug(slug)

  const primaryProductImage = product
    ? [...product.images].sort((a, b) => a.sortOrder - b.sortOrder).find((i) => i.isPrimary)?.imageUrl ??
      product.images[0]?.imageUrl
    : undefined

  useSeoMeta({
    title: product ? `${product.name} | Premium Streetwear` : 'Product Not Found',
    description:
      product?.description ||
      (product ? `Shop the ${product.name} by KAIIRA — premium streetwear, oversized fit.` : undefined),
    path: product ? `/products/${product.slug}` : undefined,
    robots: product ? 'index, follow' : 'noindex, follow',
    image: primaryProductImage,
    type: product ? 'product' : 'website',
    jsonLd: product ? [buildProductJsonLd(product), buildBreadcrumbJsonLd(buildProductBreadcrumb(product))] : undefined,
  })

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
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  // Images resolution based on selected color or fallback to full photoshoot
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
  }, [product, colors])

  useEffect(() => {
    setSelectedImage(images[0] || PLACEHOLDER_PRODUCT_IMAGE)
  }, [images])

  const sizes = useMemo(() => {
    if (!product) return []
    const seen = new Map<string, { code: string; sortOrder: number; stock: number }>()
    product.variants
      .filter((v) => !selectedColor || v.color?.hexCode === selectedColor.hex)
      .forEach((v) => {
        if (!v.size) return
        const existing = seen.get(v.size.id)
        seen.set(v.size.id, {
          code: v.size.code,
          sortOrder: v.size.sortOrder,
          stock: (existing?.stock ?? 0) + v.stockQuantity,
        })
      })
    const list = Array.from(seen.values()).sort((a, b) => a.sortOrder - b.sortOrder)
    // A Launching Soon product usually has no real stock entered yet —
    // that's expected, not "sold out", so don't strike through every size.
    // Purchasing is already blocked elsewhere (Add to Bag + backend).
    const isLaunchingSoonProduct = product.status === 'LAUNCHING_SOON'
    // If no sizes configured yet, provide standard sizes (no stock data to
    // gate on, so treat them all as available rather than guessing).
    return list.length > 0
      ? list.map((s) => ({ code: s.code, inStock: isLaunchingSoonProduct || s.stock > 0 }))
      : ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((code) => ({ code, inStock: true }))
  }, [product, selectedColor])

  useEffect(() => {
    // Prefer defaulting to an available size rather than landing on a
    // sold-out one, but still fall back to the first size if all are gone.
    setSelectedSize(sizes.find((s) => s.inStock)?.code ?? sizes[0]?.code ?? 'M')
  }, [sizes])

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key))
  }

  const handlePrevImage = () => {
    if (images.length <= 1) return
    const curIdx = images.indexOf(selectedImage)
    const prevIdx = curIdx <= 0 ? images.length - 1 : curIdx - 1
    setSelectedImage(images[prevIdx])
  }

  const handleNextImage = () => {
    if (images.length <= 1) return
    const curIdx = images.indexOf(selectedImage)
    const nextIdx = (curIdx + 1) % images.length
    setSelectedImage(images[nextIdx])
  }

  const handleShare = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setIsShareOpen(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex flex-col justify-between">
        <div>
          <Navbar />
          <section className="py-6 lg:py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-7 flex gap-4">
                  <div className="w-20 space-y-3 shrink-0 hidden sm:block">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square w-full rounded-xl" />
                    ))}
                  </div>
                  <Skeleton className="flex-1 aspect-[4/4.8] rounded-2xl" />
                </div>
                <div className="lg:col-span-5 space-y-6">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="h-9 w-3/4 rounded-xl" />
                  <Skeleton className="h-6 w-36 rounded-xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
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
        <div className="max-w-7xl mx-auto py-24 text-center space-y-2">
          <h1 className="text-2xl font-black">Product not found</h1>
          <p className="text-sm text-black/50">This product may have been removed or is no longer available.</p>
        </div>
        <Footer />
      </div>
    )
  }

  const selectedVariant = product.variants.find(
    (v) => (!selectedColor || v.color?.hexCode === selectedColor.hex) && v.size?.code === selectedSize
  ) || product.variants[0]

  const isLaunchingSoon = product.status === 'LAUNCHING_SOON'
  const isSelectionSoldOut = !isLaunchingSoon && (!selectedVariant || selectedVariant.stockQuantity <= 0)
  const isProductSoldOut = !isLaunchingSoon && product.variants.every((v) => v.stockQuantity <= 0)

  const effectivePrice = selectedVariant?.price ?? product.basePrice
  const effectiveMrp = product.mrp ?? Math.round(effectivePrice * 1.55)
  const discountPercent =
    effectiveMrp > effectivePrice
      ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100)
      : null

  const cartEntry = cartItems.find((item) => item.variantId === selectedVariant?.id)
  const isInCart = Boolean(cartEntry)

  const handleAddToCart = async () => {
    if (!selectedVariant || isAddingToCart) return
    setIsAddingToCart(true)
    try {
      await addToCart(selectedVariant.id, quantity)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const isWishlisted = isInWishlist(product.id)
  const fitText = product.fit ? product.fit.toUpperCase() : 'OVERSIZED'

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between font-sans">
      <div>
        <Navbar />

        <main className="py-4 sm:py-6 lg:py-8">
          <div className="kaira-container">
            {/* Breadcrumb trail — mirrors the BreadcrumbList JSON-LD above */}
            <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 overflow-x-auto scrollbar-none">
              <ol className="flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold text-black/50">
                <li>
                  <Link to="/" className="hover:text-black transition-colors">Home</Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link to="/products" className="hover:text-black transition-colors">Shop</Link>
                </li>
                {product?.category && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li>
                      <Link to={`/category/${product.category.slug}`} className="hover:text-black transition-colors">
                        {product.category.name}
                      </Link>
                    </li>
                  </>
                )}
                {product && (
                  <>
                    <li aria-hidden="true">/</li>
                    <li aria-current="page" className="text-black truncate max-w-[200px]">
                      {product.name}
                    </li>
                  </>
                )}
              </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">

              {/* LEFT COLUMN: Completely Sticky Gallery on Desktop */}
              <div className="lg:col-span-7 lg:sticky lg:top-20 lg:self-start">
                <Reveal animation="fade-right" duration={700}>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-start">
                    {/* Vertical Thumbnails List */}
                    <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto w-full sm:w-[84px] shrink-0 scrollbar-none p-1 sm:max-h-[calc(100vh-6rem)]">
                  {images.map((img, idx) => {
                    const isSelected = selectedImage === img
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(img)}
                        className={`relative aspect-[3/3.8] w-15 sm:w-full overflow-hidden rounded-xl bg-[#f2f2f2] transition-all duration-200 cursor-pointer shrink-0 ${
                          isSelected
                            ? 'ring-2 ring-black ring-offset-1 shadow-sm'
                            : 'border border-black/10 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={img}
                          alt={`${product.name} view ${idx + 1}`}
                          className="h-full w-full object-cover object-center"
                          onError={(e) => {
                            e.currentTarget.src = PLACEHOLDER_PRODUCT_IMAGE
                          }}
                        />
                      </button>
                    )
                  })}
                </div>

                {/* Main Image Showcase - Proportionate height without empty gap */}
                <div className="relative flex-1 w-full aspect-[3.8/4.5] lg:max-h-[calc(100vh-6rem)] overflow-hidden rounded-3xl bg-[#f2f2f2] shadow-xs select-none">
                  {isLaunchingSoon && (
                    <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-[15] pointer-events-none">
                      <span className="rounded-full bg-black/95 px-4 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white shadow-sm">
                        Launching Soon
                      </span>
                    </div>
                  )}
                  {isProductSoldOut && (
                    <div className="absolute inset-0 z-[15] flex items-center justify-center bg-black/45 pointer-events-none">
                      <span className="rounded-full bg-white/95 px-5 py-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-black shadow-sm">
                        Sold Out
                      </span>
                    </div>
                  )}
                  {/* Top-Right Floating Actions: Share + Wishlist */}
                  <div className="absolute right-4 top-4 sm:right-5 sm:top-5 z-20 flex items-center gap-2">
                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      aria-label="Share Product"
                      title="Share Product"
                      className="tap-press flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:shadow-md hover:text-black hover:scale-105 transition-all cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-neutral-700 hover:text-black transition-colors"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                        <polyline points="16 6 12 2 8 6" />
                        <line x1="12" y1="2" x2="12" y2="15" />
                      </svg>
                    </button>

                    {/* Wishlist Button */}
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      aria-label="Add to Wishlist"
                      title="Add to Wishlist"
                      className={`tap-press flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${
                        isWishlisted ? 'text-red-500 fill-red-500' : 'text-neutral-700 hover:text-black'
                      }`}
                    >
                      <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.8} fill={isWishlisted ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Left Carousel Arrow */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevImage}
                      aria-label="Previous Image"
                      className="tap-press absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md hover:bg-white hover:scale-105 transition-all cursor-pointer"
                    >
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={2.4} />
                    </button>
                  )}

                  {/* Right Carousel Arrow */}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={handleNextImage}
                      aria-label="Next Image"
                      className="tap-press absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-md hover:bg-white hover:scale-105 transition-all cursor-pointer"
                    >
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2.4} />
                    </button>
                  )}

                  {/* Bottom Right Zoom Button */}
                  <button
                    type="button"
                    onClick={() => setIsZoomOpen(true)}
                    aria-label="Zoom Image"
                    className="tap-press absolute right-4 bottom-4 sm:right-5 sm:bottom-5 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-neutral-700 shadow-sm hover:shadow-md hover:text-black hover:scale-105 transition-all cursor-pointer"
                  >
                    <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2} />
                  </button>

                  {/* Main Display Image — above the fold, loaded eagerly/high-priority for LCP */}
                  <img
                    key={selectedImage}
                    src={selectedImage || PLACEHOLDER_PRODUCT_IMAGE}
                    alt={product.name}
                    loading="eager"
                    fetchPriority="high"
                    className="h-full w-full object-cover object-center animate-image-fade-in"
                  />
                </div>
              </div>
            </Reveal>
          </div>

              {/* RIGHT COLUMN: Product Information & Purchase Controls (Naturally extends the page) */}
              <div className="lg:col-span-5">
                <Reveal animation="fade-left" duration={700} delay={100} className="space-y-3.5">
                
                {/* Header Information: Subtitle + Title + Reviews + Pricing (Badge removed) */}
                <div className="space-y-1.5">
                  {/* Category / Fit Subtitle */}
                  <div className="text-xs font-extrabold uppercase tracking-widest text-black/45">
                    {product.category?.name || fitText}
                  </div>

                  {/* Product Title matching canonical H1 typography */}
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-black tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  {/* Pricing Row: Price + MRP (strike-through) + Discount Badge */}
                  <div className="flex items-baseline gap-2.5 pt-1.5 flex-wrap">
                    <span className="text-2xl sm:text-3xl font-black text-black">
                      {formatCurrency(effectivePrice)}
                    </span>
                    {effectiveMrp > effectivePrice && (
                      <span className="text-sm sm:text-base font-semibold text-black/40 line-through">
                        {formatCurrency(effectiveMrp)}
                      </span>
                    )}
                    {discountPercent && discountPercent > 0 && (
                      <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-black/50 block">
                    Price incl. of all taxes
                  </span>
                </div>

                <div className="border-t border-black/10 pt-3.5 space-y-4">
                  {/* COLOR SELECTOR */}
                  {colors.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold text-black uppercase tracking-wider">
                        Color: <span className="font-extrabold text-black">{selectedColor?.name || 'Default'}</span>
                      </div>
                      <div className="flex items-center gap-2.5 p-0.5">
                        {colors.map((color) => {
                          const isSelected = selectedColor?.name === color.name
                          return (
                            <button
                              key={color.name}
                              type="button"
                              onClick={() => {
                                setSelectedColor(color)
                                setQuantity(1)
                              }}
                              className={`relative h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-transform cursor-pointer shrink-0 ${
                                isSelected
                                  ? 'ring-2 ring-black ring-offset-2 scale-105'
                                  : 'border border-black/20 hover:scale-105'
                              }`}
                              style={{ backgroundColor: color.hex }}
                              title={color.name}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* SIZE SELECTOR + SIZE GUIDE LINK */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-black">
                      <span>Select Size</span>
                      <button
                        type="button"
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="flex items-center gap-1.5 text-xs font-bold text-black/60 hover:text-black transition-colors cursor-pointer underline-offset-4 hover:underline"
                      >
                        <HugeiconsIcon icon={RulerIcon} size={14} />
                        <span>Size Guide</span>
                      </button>
                    </div>

                    {/* Size Buttons Grid */}
                    <div className="grid grid-cols-6 gap-2">
                      {sizes.map((size) => {
                        const isSelected = selectedSize === size.code
                        return (
                          <button
                            key={size.code}
                            type="button"
                            disabled={!size.inStock}
                            onClick={() => {
                              setSelectedSize(size.code)
                              setQuantity(1)
                            }}
                            title={size.inStock ? undefined : 'Out of stock'}
                            className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${
                              !size.inStock
                                ? 'border border-black/10 bg-neutral-50 text-black/25 line-through cursor-not-allowed'
                                : isSelected
                                ? 'bg-black text-white shadow-sm cursor-pointer'
                                : 'border border-black/20 bg-white text-black hover:border-black cursor-pointer'
                            }`}
                          >
                            {size.code}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* QUANTITY STEPPER + "ADD TO BAG" CTA BUTTON */}
                  <div className="flex items-center gap-3 pt-1">
                    {/* Stepper (- 1 +) */}
                    <div className="flex items-center justify-between h-11 sm:h-12 w-28 rounded-2xl bg-neutral-100 px-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1}
                        className="text-black hover:text-black/60 disabled:opacity-30 cursor-pointer tap-press p-1"
                      >
                        <HugeiconsIcon icon={MinusSignIcon} size={14} strokeWidth={2.4} />
                      </button>
                      <span className="font-extrabold text-sm sm:text-base text-black">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        disabled={isLaunchingSoon || isSelectionSoldOut || quantity >= (selectedVariant?.stockQuantity ?? 0)}
                        className="text-black hover:text-black/60 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer tap-press p-1"
                      >
                        <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.4} />
                      </button>
                    </div>

                    {/* ADD TO BAG Button with Price and Right Arrow */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart || isSelectionSoldOut || isLaunchingSoon}
                      className="tap-press flex-1 h-11 sm:h-12 flex items-center justify-between rounded-2xl bg-black hover:bg-neutral-900 text-white px-5 sm:px-6 shadow-sm transition-all cursor-pointer group disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-black"
                    >
                      <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                        {isLaunchingSoon
                          ? 'LAUNCHING SOON'
                          : isSelectionSoldOut
                          ? 'SOLD OUT'
                          : isAddingToCart
                          ? 'ADDING…'
                          : isInCart
                          ? 'ADDED IN BAG'
                          : `ADD TO BAG • ${formatCurrency(effectivePrice * quantity)}`}
                      </span>
                      {isAddingToCart ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                      ) : (
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={16}
                          strokeWidth={2.4}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* ACCORDION DETAILS SECTION */}
                <div className="pt-4">
                  <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-black/50 mb-3">
                    Product Details & Specifications
                  </p>

                  {/* Accordion 1: PRODUCT DESCRIPTION */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('description')}
                      className="w-full py-4 flex items-center justify-between text-sm sm:text-base font-extrabold uppercase tracking-wide text-black text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Product Description</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 leading-none ${openAccordion === 'description' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    {openAccordion === 'description' && (
                      <div className="pb-5 animate-fade-in">
                        <p className="text-sm sm:text-base text-black/80 font-medium leading-relaxed">
                          {product.description ||
                            'A soft, comfortable tee with a relaxed fit and dropped shoulders. Clean construction, built for everyday wear.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: MATERIAL & CARE */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('material')}
                      className="w-full py-4 flex items-center justify-between text-sm sm:text-base font-extrabold uppercase tracking-wide text-black text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Material & Care</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 leading-none ${openAccordion === 'material' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    {openAccordion === 'material' && (
                      <div className="pb-5 animate-fade-in space-y-2 text-sm sm:text-base text-black/80 font-medium leading-relaxed">
                        {product.fabric && <p>• {product.fabric}</p>}
                        {product.gsm && <p>• {product.gsm} GSM</p>}
                        {product.fit && <p>• {formatFit(product.fit)}</p>}
                        {product.neckType && <p>• {formatNeck(product.neckType)}</p>}
                        {product.biowash && <p>• Bio-washed fabric treatment (pre-shrunk)</p>}
                        <p>• Machine wash cold with similar colors</p>
                        <p>• Do not iron directly on graphic prints</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: SHIPPING & EXCHANGES */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('shipping')}
                      className="w-full py-4 flex items-center justify-between text-sm sm:text-base font-extrabold uppercase tracking-wide text-black text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Shipping & Exchanges</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 leading-none ${openAccordion === 'shipping' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    {openAccordion === 'shipping' && (
                      <div className="pb-5 animate-fade-in space-y-2 text-sm sm:text-base text-black/80 font-medium leading-relaxed">
                        <p>• Dispatched within 24-48 business hours.</p>
                        <p>• Express delivery in 2-4 business days across India.</p>
                        <p>• Prepaid orders only (no Cash on Delivery).</p>
                        <p>• Hassle-free size/color exchanges within 3 days of delivery (No returns, only exchange).</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* PRODUCT REVIEWS CONTINUATION */}
                <ProductReviews
                  productId={product.id}
                  productName={product.name}
                  productImage={images[0]}
                />
              </Reveal>
            </div>
          </div>
        </div>
      </main>
    </div>

      {/* Image Zoom Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setIsZoomOpen(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white p-2">
            <button
              type="button"
              onClick={() => setIsZoomOpen(false)}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black cursor-pointer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
            <img
              src={selectedImage || PLACEHOLDER_PRODUCT_IMAGE}
              alt={product.name}
              className="max-h-[85vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}

      {/* Size Guide Modal Drawer */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-black uppercase tracking-wider text-black">Size Guide</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            {/* Dynamic variant measurements */}
            {(() => {
              // Collect one row per unique size, using the currently selected color if present.
              const variantRows = product?.variants
                .filter((v) => !selectedColor || v.colorId === selectedColor.id || !v.colorId)
                .filter((v) => v.size && (v.chestWidth || v.bodyLength || v.sleeveLength))
                .reduce((acc, v) => {
                  const key = v.size!.code
                  if (!acc.has(key)) acc.set(key, v)
                  return acc
                }, new Map())

              const hasDynamic = variantRows && variantRows.size > 0

              return (
                <div className="py-4 space-y-4">
                  <p className="text-[11px] font-semibold text-black/40 uppercase tracking-wider">
                    All measurements in inches&nbsp;/&nbsp;cm
                  </p>
                  <table className="w-full text-left text-xs font-bold">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-400 uppercase">
                        <th className="py-2.5">Size</th>
                        <th className="py-2.5">Chest</th>
                        <th className="py-2.5">Length</th>
                        <th className="py-2.5">Sleeve</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {hasDynamic
                        ? Array.from(variantRows!.values())
                            .sort((a: any, b: any) => (a.size?.sortOrder ?? 0) - (b.size?.sortOrder ?? 0))
                            .map((v: any) => (
                              <tr key={v.id}>
                                <td className="py-2.5 font-black">{v.size?.code}</td>
                                <td className="py-2.5 font-medium">{formatMeasurement(v.chestWidth)}</td>
                                <td className="py-2.5 font-medium">{formatMeasurement(v.bodyLength)}</td>
                                <td className="py-2.5 font-medium">{formatMeasurement(v.sleeveLength)}</td>
                              </tr>
                            ))
                        : /* fallback static table */
                          [
                            { s: 'XS', chest: '38 - 40" / 96-102 cm', len: '27.5" / 69.9 cm', slv: '7.5" / 19.1 cm' },
                            { s: 'S',  chest: '40 - 42" / 102-107 cm', len: '28.5" / 72.4 cm', slv: '8.0" / 20.3 cm' },
                            { s: 'M',  chest: '42 - 44" / 107-112 cm', len: '29.5" / 74.9 cm', slv: '8.5" / 21.6 cm' },
                            { s: 'L',  chest: '44 - 46" / 112-117 cm', len: '30.5" / 77.5 cm', slv: '9.0" / 22.9 cm' },
                            { s: 'XL', chest: '46 - 48" / 117-122 cm', len: '31.5" / 80.0 cm', slv: '9.5" / 24.1 cm' },
                            { s: 'XXL',chest: '48 - 50" / 122-127 cm', len: '32.5" / 82.6 cm', slv: '10.0" / 25.4 cm' },
                          ].map((row) => (
                            <tr key={row.s}>
                              <td className="py-2.5 font-black">{row.s}</td>
                              <td className="py-2.5 font-medium">{row.chest}</td>
                              <td className="py-2.5 font-medium">{row.len}</td>
                              <td className="py-2.5 font-medium">{row.slv}</td>
                            </tr>
                          ))
                      }
                    </tbody>
                  </table>

                  <div className="pt-2 text-center">
                    <Link
                      to="/size-guide"
                      className="text-xs font-extrabold text-neutral-800 underline underline-offset-4 hover:text-black"
                    >
                      View full measurement guide &amp; instructions →
                    </Link>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}

      {/* Custom Share Modal */}
      {product && (
        <ShareModal
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
          title={product.name}
          imageUrl={selectedImage || product.images?.[0]?.imageUrl}
          price={effectivePrice}
          mrp={effectiveMrp}
          discountPercent={discountPercent}
          colors={colors}
        />
      )}

      <Footer />
    </div>
  )
}
