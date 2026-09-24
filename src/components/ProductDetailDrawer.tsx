import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'
import { useProductDetail, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { useCart } from '../context/CartContext'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  SecurityCheckIcon,
  PackageIcon,
  RefreshIcon,
  CheckmarkCircle02Icon,
  ArrowRight01Icon,
} from '@hugeicons/core-free-icons'

interface ProductDetailDrawerProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
}

interface ColorOption {
  id: string
  name: string
  hex: string
}

export function ProductDetailDrawer({ productId, isOpen, onClose }: ProductDetailDrawerProps) {
  const { items: cartItems, addToCart, removeFromCart } = useCart()
  const { data: product } = useProductDetail(productId ?? undefined)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'origin'>('details')

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
    if (product) {
      setSelectedColor(colors[0] || null)
      setAddedSuccess(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product])

  useEffect(() => {
    setSelectedImage(images[0] || PLACEHOLDER_PRODUCT_IMAGE)
  }, [images])

  useEffect(() => {
    setSelectedSize(sizes[0] || '')
  }, [sizes])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !product) return null

  const selectedVariant = product.variants.find(
    (v) => v.color?.hexCode === selectedColor?.hex && v.size?.code === selectedSize
  )
  const effectivePrice = selectedVariant?.price ?? product.basePrice
  const effectiveMrp = product.mrp
  const cartEntry = cartItems.find((item) => item.variantId === selectedVariant?.id)
  const isInCart = Boolean(cartEntry)

  const handleQuickAdd = async () => {
    if (isInCart) {
      if (cartEntry) removeFromCart(cartEntry.id)
      return
    }
    if (!selectedVariant || isAdding) return
    setIsAdding(true)
    try {
      await addToCart(selectedVariant.id, 1)
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 2200)
    } catch {
      // addToCart already surfaces a toast on failure
    } finally {
      setIsAdding(false)
    }
  }

  const discountPercent = effectiveMrp > effectivePrice
    ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100)
    : 0

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-lg md:max-w-xl xl:max-w-2xl bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-400 ease-out animate-fade-in-up">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/10 px-6 py-4.5 bg-white/90 backdrop-blur-md sticky top-0 z-10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/50">
                {product.category?.name}
              </span>
              <h2 className="text-base sm:text-lg font-black text-black tracking-tight line-clamp-1">
                Product Details
              </h2>
            </div>
            
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-black/70 hover:bg-black hover:text-white transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            
            {/* Gallery Section - Clean Proportional Image with Reference Thumbnails on Right */}
            <div className="flex items-center gap-3">
              {/* Main Image View - Fills width without empty gaps */}
              <div className="relative aspect-[4/3] sm:aspect-[4/3] flex-1 overflow-hidden rounded-2xl bg-neutral-100 border border-black/10">
                {/* Pure Black Full-Width Badge Bar */}
                {product.badge && (
                  <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none animate-badge-slide-up">
                    <div className="pure-black-badge-bar w-full py-1.5 px-3 text-center shadow-md">
                      <span className="text-[11px] sm:text-xs font-bold tracking-wide text-white">
                        {product.badge}
                      </span>
                    </div>
                  </div>
                )}
                <img
                  key={selectedImage}
                  src={selectedImage || PLACEHOLDER_PRODUCT_IMAGE}
                  alt={product.name}
                  className="h-full w-full object-cover object-top animate-image-fade-in"
                />
              </div>

              {/* Reference Thumbnails Column on the Right */}
              {images.length > 1 && (
                <div className="flex flex-col gap-2 shrink-0 justify-center">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-xl border transition-all cursor-pointer shrink-0 ${
                        selectedImage === img
                          ? 'border-black ring-2 ring-black shadow-xs scale-105'
                          : 'border-black/15 opacity-60 hover:opacity-100 hover:border-black/50'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title & Price Info */}
            <div className="space-y-2 border-b border-black/10 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-widest text-black/50">
                  {product.category?.name}
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-black">
                  {formatCurrency(effectivePrice)}
                </span>
                {effectiveMrp > effectivePrice && (
                  <span className="text-sm font-semibold text-black/40 line-through">
                    {formatCurrency(effectiveMrp)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-2xl bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Color Swatches */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/70 flex items-center justify-between">
                <span>Color: <strong className="text-black">{selectedColor?.name}</strong></span>
              </label>
              <div className="flex items-center gap-2.5">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all cursor-pointer ${
                      selectedColor?.name === color.name
                        ? 'border-black scale-110 shadow-xs'
                        : 'border-black/15 hover:border-black/50'
                    }`}
                    title={color.name}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-black/70 flex items-center justify-between">
                <span>Select Size</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`flex h-10 w-12 items-center justify-center rounded-xl border text-xs font-black transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'border-black bg-black text-white shadow-xs'
                        : 'border-black/15 bg-white text-black hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* About / Description */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-black/60">
                About The Product
              </h3>
              <p className="text-xs sm:text-sm text-black/75 font-medium leading-relaxed">
                {product.description || 'No additional description available for this product yet.'}
              </p>
            </div>

            {/* Specs Segmented Tabs */}
            <div className="space-y-3 pt-2">
              <div className="flex border-b border-black/10 text-xs font-black uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`pb-2 mr-5 transition-colors cursor-pointer border-b-2 -mb-px ${
                    activeTab === 'details' ? 'border-black text-black' : 'border-transparent text-black/40 hover:text-black'
                  }`}
                >
                  Key Details
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('care')}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 -mb-px ${
                    activeTab === 'care' ? 'border-black text-black' : 'border-transparent text-black/40 hover:text-black'
                  }`}
                >
                  Availability
                </button>
              </div>

              {activeTab === 'details' && (
                <ul className="space-y-1.5 text-xs text-black/70 font-medium list-disc list-inside">
                  <li>Category: {product.category?.name}</li>
                  <li>Product Type: {product.productType}</li>
                  {selectedVariant && <li>SKU: {selectedVariant.sku}</li>}
                </ul>
              )}

              {activeTab === 'care' && (
                <div className="space-y-1 text-xs text-black/70 font-medium">
                  {selectedVariant ? (
                    <p>
                      <strong className="text-black">
                        {selectedVariant.stockQuantity > 0
                          ? `${selectedVariant.stockQuantity} in stock`
                          : 'Out of stock'}
                      </strong>{' '}
                      for {selectedColor?.name} / {selectedSize}
                    </p>
                  ) : (
                    <p>Select a color and size to see availability.</p>
                  )}
                </div>
              )}
            </div>

            {/* Trust Mini-bar */}
            <div className="grid grid-cols-3 gap-2 border-t border-black/10 pt-4 text-center">
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                <HugeiconsIcon icon={SecurityCheckIcon} size={18} className="mx-auto text-black mb-1" />
                <p className="text-[10px] font-black text-black">100% Genuine</p>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                <HugeiconsIcon icon={RefreshIcon} size={18} className="mx-auto text-black mb-1" />
                <p className="text-[10px] font-black text-black">7-Day Return</p>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5">
                <HugeiconsIcon icon={PackageIcon} size={18} className="mx-auto text-black mb-1" />
                <p className="text-[10px] font-black text-black">₹19 Fast Delivery</p>
              </div>
            </div>

          </div>

          {/* Sticky Drawer Footer Action */}
          <div className="border-t border-black/10 bg-white p-4 sm:p-5 flex items-center gap-3">
            <button
              type="button"
              disabled={isAdding}
              aria-busy={isAdding}
              onClick={handleQuickAdd}
              className={`flex-1 group relative flex items-center justify-between overflow-hidden rounded-2xl border px-6 py-3 transition-all duration-300 shadow-sm hover:shadow-md tap-press ${
                isAdding ? 'cursor-wait' : 'cursor-pointer'
              } ${addedSuccess || isInCart ? 'border-black bg-white' : 'border-black bg-black'}`}
            >
              {!(addedSuccess || isInCart || isAdding) && (
                <span className="absolute inset-0 translate-y-full rounded-2xl bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />
              )}
              {/* Waiting-for-backend fill */}
              <span
                className="absolute inset-y-0 left-0 bg-white/25 rounded-2xl transition-[width] ease-out"
                style={{ width: isAdding ? '92%' : '0%', transitionDuration: isAdding ? '1600ms' : '0ms' }}
              />
              <div className="relative z-10 flex items-center justify-between w-full">
                <span
                  className={`font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 ${
                    addedSuccess || isInCart ? 'text-black' : 'text-white group-hover:text-black group-hover:-translate-x-1'
                  }`}
                >
                  {isAdding ? 'Adding…' : addedSuccess ? '✓ Added To Bag' : isInCart ? '✓ Already in Bag' : 'Add to Bag'}
                </span>
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full transition-all duration-300 ${
                    addedSuccess || isInCart
                      ? 'bg-black text-white'
                      : 'bg-white text-black group-hover:bg-black group-hover:text-white'
                  }`}
                >
                  {isAdding ? (
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-current/25 border-t-current animate-spin" />
                  ) : (
                    <HugeiconsIcon
                      icon={addedSuccess || isInCart ? CheckmarkCircle02Icon : ArrowRight01Icon}
                      size={16}
                      strokeWidth={2.4}
                    />
                  )}
                </span>
              </div>
            </button>

            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="shrink-0 rounded-2xl border border-black/20 px-4 py-3 text-xs font-black text-black hover:border-black transition-colors"
            >
              Full Page →
            </Link>
          </div>

        </div>
      </div>
    </div>,
    document.body
  )
}
