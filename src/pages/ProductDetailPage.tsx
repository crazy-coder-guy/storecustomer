import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { Skeleton } from '../components/Skeleton'
import { formatCurrency } from '../utils/formatCurrency'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useProductDetail, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { Reveal } from '../components/Reveal'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FavouriteIcon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  DeliveryTruck01Icon,
  RefreshIcon,
  CreditCardIcon,
  MinusSignIcon,
  Add01Icon,
  Search01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons'

interface ColorOption {
  id: string
  name: string
  hex: string
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { items: cartItems, addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')
  const [quantity, setQuantity] = useState(1)
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [isZoomOpen, setIsZoomOpen] = useState(false)

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
    const seen = new Map<string, { code: string; sortOrder: number }>()
    product.variants
      .filter((v) => !selectedColor || v.color?.hexCode === selectedColor.hex)
      .forEach((v) => {
        if (v.size && !seen.has(v.size.id)) {
          seen.set(v.size.id, { code: v.size.code, sortOrder: v.size.sortOrder })
        }
      })
    const list = Array.from(seen.values()).sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.code)
    // If no sizes configured yet, provide standard sizes
    return list.length > 0 ? list : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }, [product, selectedColor])

  useEffect(() => {
    setSelectedSize(sizes[0] || 'M')
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">

              {/* LEFT COLUMN: Sticky Gallery with Vertical Thumbnails */}
              <div className="lg:col-span-7 lg:sticky lg:top-24">
                <Reveal animation="fade-right" duration={700}>
                  <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 items-start">
                    {/* Vertical Thumbnails List */}
                    <div className="flex sm:flex-col gap-2.5 sm:gap-3 overflow-x-auto sm:overflow-y-auto w-full sm:w-[84px] shrink-0 scrollbar-none p-1">
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
                <div className="relative flex-1 w-full aspect-[3.8/4.5] overflow-hidden rounded-3xl bg-[#f2f2f2] shadow-xs select-none">
                  {/* Wishlist Button - Top Right Circular Floating Button */}
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Add to Wishlist"
                    className={`absolute right-4 top-4 sm:right-5 sm:top-5 z-20 flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all cursor-pointer hover:scale-105 ${
                      isWishlisted ? 'text-red-500 fill-red-500' : 'text-neutral-700 hover:text-black'
                    }`}
                  >
                    <HugeiconsIcon icon={FavouriteIcon} size={18} strokeWidth={1.8} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>

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

                  {/* Main Display Image */}
                  <img
                    key={selectedImage}
                    src={selectedImage || PLACEHOLDER_PRODUCT_IMAGE}
                    alt={product.name}
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

                  {/* Rating row: ★★★★★ 4.8 (128 reviews) */}
                  <div className="flex items-center gap-2 pt-0.5 text-xs text-black/60 font-semibold">
                    <div className="flex items-center text-black text-sm tracking-tighter">
                      {'★★★★★'}
                    </div>
                    <span className="font-bold text-black">4.8</span>
                    <span className="text-black/40">(128 reviews)</span>
                  </div>

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
                  {colors.length > 0 && (
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
                              onClick={() => setSelectedColor(color)}
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
                        <span className="text-xs">⌗</span>
                        <span>Size Guide</span>
                      </button>
                    </div>

                    {/* Size Buttons Grid */}
                    <div className="grid grid-cols-6 gap-2">
                      {sizes.map((size) => {
                        const isSelected = selectedSize === size
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`py-2.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-black text-white shadow-sm'
                                : 'border border-black/20 bg-white text-black hover:border-black'
                            }`}
                          >
                            {size}
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
                        className="text-black hover:text-black/60 cursor-pointer tap-press p-1"
                      >
                        <HugeiconsIcon icon={Add01Icon} size={14} strokeWidth={2.4} />
                      </button>
                    </div>

                    {/* ADD TO BAG Button with Price and Right Arrow */}
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="tap-press flex-1 h-11 sm:h-12 flex items-center justify-between rounded-2xl bg-black hover:bg-neutral-900 text-white px-5 sm:px-6 shadow-sm transition-all cursor-pointer group disabled:cursor-wait"
                    >
                      <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">
                        {isAddingToCart ? 'ADDING…' : isInCart ? 'ADDED IN BAG' : `ADD TO BAG • ${formatCurrency(effectivePrice * quantity)}`}
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

                  {/* 3 Value Pillars Row: Exactly styled and proportioned without card look */}
                  <div className="grid grid-cols-3 border-y border-black/10 py-3.5 my-1">
                    {/* Free Shipping */}
                    <div className="flex items-center gap-2.5 pr-2">
                      <div className="text-black shrink-0">
                        <HugeiconsIcon icon={DeliveryTruck01Icon} size={22} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] font-bold text-black leading-snug">Free Shipping</p>
                        <p className="text-[10px] sm:text-[11px] text-black/55 font-medium leading-tight">on orders above ₹999</p>
                      </div>
                    </div>

                    {/* Easy Returns */}
                    <div className="flex items-center gap-2.5 border-l border-black/10 px-2.5 sm:px-3">
                      <div className="text-black shrink-0">
                        <HugeiconsIcon icon={RefreshIcon} size={20} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] font-bold text-black leading-snug">Easy Returns</p>
                        <p className="text-[10px] sm:text-[11px] text-black/55 font-medium leading-tight">7 days return policy</p>
                      </div>
                    </div>

                    {/* Secure Payments */}
                    <div className="flex items-center gap-2.5 border-l border-black/10 pl-2.5 sm:pl-3">
                      <div className="text-black shrink-0">
                        <HugeiconsIcon icon={CreditCardIcon} size={20} strokeWidth={1.8} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-[13px] font-bold text-black leading-snug">Secure Payments</p>
                        <p className="text-[10px] sm:text-[11px] text-black/55 font-medium leading-tight">100% secure checkout</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ACCORDION DETAILS SECTION */}
                <div className="pt-2">
                  <p className="text-xs font-black uppercase tracking-widest text-black/40 mb-2">
                    Product Details
                  </p>

                  {/* Accordion 1: PRODUCT DESCRIPTION */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('description')}
                      className="w-full py-3.5 flex items-center justify-between text-xs sm:text-sm font-extrabold uppercase tracking-wide text-black text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Product Description</span>
                      <span className={`text-lg font-bold text-black transition-transform duration-300 leading-none ${openAccordion === 'description' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    {openAccordion === 'description' && (
                      <div className="pb-4 animate-fade-in">
                        <p className="text-xs sm:text-sm text-black/75 font-medium leading-relaxed">
                          {product.description ||
                            'A soft and comfortable oversized tee designed around a relaxed body and dropped shoulders. Its clean construction makes it suitable for everyday casual wear and simple streetwear combinations.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 2: MATERIAL & CARE */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('material')}
                      className="w-full py-3.5 flex items-center justify-between text-xs sm:text-sm font-extrabold uppercase tracking-wide text-black text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Material & Care</span>
                      <span className={`text-lg font-bold text-black transition-transform duration-300 leading-none ${openAccordion === 'material' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    {openAccordion === 'material' && (
                      <div className="pb-4 animate-fade-in space-y-1.5 text-xs sm:text-sm text-black/75 font-medium">
                        <p>• {product.fabric || '100% Combed Heavy Organic Cotton'}</p>
                        <p>• {product.gsm ? `${product.gsm} GSM heavyweight structured knit` : '240 GSM premium structured knit'}</p>
                        <p>• Machine wash cold with similar colors</p>
                        <p>• Do not iron directly on graphic prints</p>
                      </div>
                    )}
                  </div>

                  {/* Accordion 3: SHIPPING & RETURNS */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('shipping')}
                      className="w-full py-3.5 flex items-center justify-between text-xs sm:text-sm font-extrabold uppercase tracking-wide text-black text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Shipping & Returns</span>
                      <span className={`text-lg font-bold text-black transition-transform duration-300 leading-none ${openAccordion === 'shipping' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    {openAccordion === 'shipping' && (
                      <div className="pb-4 animate-fade-in space-y-1.5 text-xs sm:text-sm text-black/75 font-medium">
                        <p>• Dispatched within 24-48 business hours.</p>
                        <p>• Express delivery in 2-4 business days across India.</p>
                        <p>• Free hassle-free returns and exchanges within 7 days of delivery.</p>
                      </div>
                    )}
                  </div>
                </div>
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
              <h3 className="text-lg font-black uppercase tracking-wider text-black">Size Guide (Inches)</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:text-black cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={16} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <table className="w-full text-left text-xs font-bold">
                <thead>
                  <tr className="border-b border-neutral-200 text-neutral-400 uppercase">
                    <th className="py-2.5">Size</th>
                    <th className="py-2.5">Chest</th>
                    <th className="py-2.5">Length</th>
                    <th className="py-2.5">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-800">
                  <tr>
                    <td className="py-2 font-black">XS</td>
                    <td className="py-2">38 - 40"</td>
                    <td className="py-2">27.5"</td>
                    <td className="py-2">19.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black">S</td>
                    <td className="py-2">40 - 42"</td>
                    <td className="py-2">28.5"</td>
                    <td className="py-2">20.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black">M</td>
                    <td className="py-2">42 - 44"</td>
                    <td className="py-2">29.5"</td>
                    <td className="py-2">21.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black">L</td>
                    <td className="py-2">44 - 46"</td>
                    <td className="py-2">30.5"</td>
                    <td className="py-2">22.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black">XL</td>
                    <td className="py-2">46 - 48"</td>
                    <td className="py-2">31.5"</td>
                    <td className="py-2">23.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-black">XXL</td>
                    <td className="py-2">48 - 50"</td>
                    <td className="py-2">32.5"</td>
                    <td className="py-2">24.0"</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-2 text-center">
                <Link
                  to="/size-guide"
                  className="text-xs font-extrabold text-neutral-800 underline underline-offset-4 hover:text-black"
                >
                  View full measurement guide & instructions →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
