import { useState, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'
import { useProductDetail, PLACEHOLDER_PRODUCT_IMAGE } from '../hooks/queries'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  FavouriteIcon,
  ShoppingBag01Icon,
  ArrowRight01Icon,
  MinusSignIcon,
  Add01Icon,
  DeliveryTruck01Icon,
  RefreshIcon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
  RulerIcon,
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
  const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist } = useWishlist()
  const { data: product } = useProductDetail(productId ?? undefined)

  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [addedSuccess, setAddedSuccess] = useState(false)

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
    if (!product) return ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    const seen = new Map<string, { code: string; sortOrder: number }>()
    product.variants
      .filter((v) => !selectedColor || v.color?.hexCode === selectedColor.hex)
      .forEach((v) => {
        if (v.size && !seen.has(v.size.id)) {
          seen.set(v.size.id, { code: v.size.code, sortOrder: v.size.sortOrder })
        }
      })
    const list = Array.from(seen.values()).sort((a, b) => a.sortOrder - b.sortOrder).map((s) => s.code)
    return list.length > 0 ? list : ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }, [product, selectedColor])

  useEffect(() => {
    if (product) {
      setSelectedColor(colors[0] || null)
      setQuantity(1)
      setAddedSuccess(false)
    }
  }, [product, colors])

  useEffect(() => {
    setSelectedImage(images[0] || PLACEHOLDER_PRODUCT_IMAGE)
  }, [images])

  useEffect(() => {
    if (sizes.length > 0 && (!selectedSize || !sizes.includes(selectedSize))) {
      setSelectedSize(sizes.includes('M') ? 'M' : sizes[0])
    }
  }, [sizes, selectedSize])

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
    (v) => (!selectedColor || v.color?.hexCode === selectedColor.hex) && v.size?.code === selectedSize
  ) || product.variants[0]

  const effectivePrice = selectedVariant?.price ?? product.basePrice
  const effectiveMrp = product.mrp || Math.round(effectivePrice * 1.5)
  const discountPercent = effectiveMrp > effectivePrice
    ? Math.round(((effectiveMrp - effectivePrice) / effectiveMrp) * 100)
    : 0

  const isWishlisted = isInWishlist(product.id)

  const handleQuickAdd = async () => {
    if (!selectedVariant || isAdding) return
    setIsAdding(true)
    try {
      await addToCart(selectedVariant.id, quantity)
      setAddedSuccess(true)
      setTimeout(() => setAddedSuccess(false), 2000)
    } catch {
      // Handled in context
    } finally {
      setIsAdding(false)
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/55 backdrop-blur-xs transition-opacity duration-300 animate-fade-in"
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
        <div className="w-screen max-w-md sm:max-w-lg md:max-w-xl bg-white shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out animate-fade-in-up">

          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-black/5 px-6 py-4 bg-white/95 backdrop-blur-md sticky top-0 z-20">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-black/50 block">
                {product.category?.name || 'HEAVYWEIGHT T-SHIRTS'}
              </span>
              <h2 className="text-lg font-black text-black tracking-tight leading-tight">
                Product Details
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black/70 hover:bg-black hover:text-white transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.4} />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 scrollbar-none">

            {/* Gallery: Large Image + Right Vertical Thumbnails */}
            <div className="flex items-start gap-3">
              {/* Main Image Box */}
              <div className="relative flex-1 aspect-[4/3.8] overflow-hidden rounded-2xl bg-[#f5f5f5] select-none border border-black/5">
                <img
                  src={selectedImage || PLACEHOLDER_PRODUCT_IMAGE}
                  alt={product.name}
                  className="h-full w-full object-cover object-center animate-image-fade-in"
                />

                {/* Floating Heart / Wishlist Button */}
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist"
                  className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-black shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <HugeiconsIcon
                    icon={FavouriteIcon}
                    size={17}
                    strokeWidth={2}
                    className={isWishlisted ? 'text-rose-500 fill-rose-500' : 'text-black'}
                  />
                </button>
              </div>

              {/* Right Vertical Thumbnail Column */}
              <div className="flex flex-col gap-2 w-14 sm:w-16 shrink-0">
                {images.slice(0, 5).map((img, idx) => {
                  const isSelected = selectedImage === img
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-[3/3.6] w-full overflow-hidden rounded-xl bg-[#f2f2f2] transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'ring-2 ring-black ring-offset-1 shadow-xs'
                          : 'border border-black/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover object-center" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category, Title, Rating */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/50 block">
                {product.category?.name || 'HEAVYWEIGHT T-SHIRTS'}
              </span>

              <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Price, MRP, Discount */}
              <div className="flex items-baseline gap-2.5 pt-1.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                  {formatCurrency(effectivePrice)}
                </span>
                {effectiveMrp > effectivePrice && (
                  <span className="text-sm sm:text-base font-semibold text-black/40 line-through">
                    {formatCurrency(effectiveMrp)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-black/50 block">
                Price incl. of all taxes
              </span>
            </div>

            {/* Color Selection matching PDP */}
            {colors.length > 0 && (
              <div className="space-y-2 pt-1 border-t border-black/10">
                <div className="text-xs font-bold text-black uppercase tracking-wider flex items-center justify-between">
                  <span>
                    Color: <span className="font-extrabold text-black">{selectedColor?.name || 'Default'}</span>
                  </span>
                  {colors.length > 4 && (
                    <span className="text-black/50 font-medium text-[11px]">+{colors.length - 4} more</span>
                  )}
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

            {/* Size Selector */}
            <div className="space-y-2 pt-1 border-t border-black/5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-black">Select Size</span>
                <button
                  type="button"
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-black/75 hover:text-black underline underline-offset-2 cursor-pointer"
                >
                  <HugeiconsIcon icon={RulerIcon} size={12} />
                  <span>Size Guide</span>
                </button>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`h-10 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center ${
                        isSelected
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white text-black border-black/15 hover:border-black/50'
                      }`}
                    >
                      {size}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Accordion 1: Product Description */}
            <div className="border-t border-black/10 pt-1">
              <button
                type="button"
                onClick={() => setOpenAccordion((prev) => (prev === 'description' ? null : 'description'))}
                className="flex w-full items-center justify-between text-left py-3 cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-black group-hover:text-black/70 transition-colors">
                  Product Description
                </span>
                <span
                  className={`text-base font-bold text-black transition-transform duration-300 leading-none ${
                    openAccordion === 'description' ? 'rotate-45' : 'rotate-0'
                  }`}
                >
                  +
                </span>
              </button>

              {openAccordion === 'description' && (
                <div className="pb-3 animate-fade-in">
                  <p className="text-xs sm:text-[13px] text-black/70 font-normal leading-relaxed">
                    {product.description ||
                      'A soft, comfortable tee with a relaxed fit and dropped shoulders. Clean construction, built for everyday wear.'}
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: Material & Care */}
            <div className="border-t border-black/10 pt-1">
              <button
                type="button"
                onClick={() => setOpenAccordion((prev) => (prev === 'material' ? null : 'material'))}
                className="flex w-full items-center justify-between text-left py-3 cursor-pointer group"
              >
                <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-black group-hover:text-black/70 transition-colors">
                  Material & Care
                </span>
                <span
                  className={`text-base font-bold text-black transition-transform duration-300 leading-none ${
                    openAccordion === 'material' ? 'rotate-45' : 'rotate-0'
                  }`}
                >
                  +
                </span>
              </button>

              {openAccordion === 'material' && (
                <div className="pb-3 animate-fade-in space-y-1.5 text-xs sm:text-[13px] text-black/70 font-normal">
                  <p>• {product.fabric || '100% Combed Heavy Organic Cotton'}</p>
                  <p>• {product.gsm ? `${product.gsm} GSM heavyweight structured knit` : '240 GSM premium structured knit'}</p>
                  <p>• Machine wash cold with similar colors</p>
                  <p>• Do not iron directly on graphic prints</p>
                </div>
              )}
            </div>

            {/* Value Guarantees Row */}
            <div className="grid grid-cols-3 border-y border-black/10 py-3 text-left">
              {/* Free Shipping */}
              <div className="flex items-center gap-2 pr-1.5">
                <div className="text-black shrink-0">
                  <HugeiconsIcon icon={DeliveryTruck01Icon} size={18} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-black leading-tight">Free Shipping</p>
                  <p className="text-[9px] text-black/55 font-medium leading-tight truncate">on orders above ₹1,999</p>
                </div>
              </div>

              {/* Easy Exchange */}
              <div className="flex items-center gap-2 border-l border-black/10 px-2">
                <div className="text-black shrink-0">
                  <HugeiconsIcon icon={RefreshIcon} size={17} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-black leading-tight">Easy Exchange</p>
                  <p className="text-[9px] text-black/55 font-medium leading-tight truncate">7-day exchange only</p>
                </div>
              </div>

              {/* Prepaid Only */}
              <div className="flex items-center gap-2 border-l border-black/10 pl-2">
                <div className="text-black shrink-0">
                  <HugeiconsIcon icon={CreditCardIcon} size={17} strokeWidth={1.8} />
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-black leading-tight">Prepaid Only</p>
                  <p className="text-[9px] text-black/55 font-medium leading-tight truncate">No Cash on Delivery</p>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Bottom Actions Bar: Stepper + Add to Bag + Full Page */}
          <div className="border-t border-black/10 bg-white p-4 sm:p-5 flex items-center gap-2.5 sticky bottom-0 z-20">
            {/* Quantity Stepper */}
            <div className="flex items-center justify-between border border-black/20 rounded-xl px-2 py-2 h-11 w-24 bg-neutral-50/60 shrink-0">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-black cursor-pointer transition-colors"
                aria-label="Decrease"
              >
                <HugeiconsIcon icon={MinusSignIcon} size={13} strokeWidth={2.4} />
              </button>
              <span className="text-xs font-black text-black">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-black/5 text-black cursor-pointer transition-colors"
                aria-label="Increase"
              >
                <HugeiconsIcon icon={Add01Icon} size={13} strokeWidth={2.4} />
              </button>
            </div>

            {/* Add to Bag Button */}
            <button
              type="button"
              disabled={isAdding}
              onClick={handleQuickAdd}
              className={`flex-1 h-11 rounded-xl px-4 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                addedSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-black text-white hover:bg-neutral-900 active:scale-[0.98]'
              }`}
            >
              {addedSuccess ? (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} strokeWidth={2.2} />
                  <span>Added to Bag</span>
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={ShoppingBag01Icon} size={15} strokeWidth={2.2} />
                  <span>Add to Bag • {formatCurrency(effectivePrice * quantity)}</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} strokeWidth={2.2} />
                </>
              )}
            </button>

            {/* Full Page Button */}
            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="h-11 px-3.5 sm:px-4 rounded-xl border border-black/20 text-xs font-bold text-black flex items-center justify-center hover:border-black hover:bg-neutral-50 transition-colors whitespace-nowrap shrink-0"
            >
              <span>Full Page →</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Embedded Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-black text-black">Size Guide (Inches)</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 text-black/70 hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>

            <div className="py-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 text-black/50 font-bold uppercase">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest</th>
                    <th className="py-2">Length</th>
                    <th className="py-2">Shoulder</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-black/80 font-medium">
                  <tr>
                    <td className="py-2 font-bold">XS</td>
                    <td className="py-2">38 - 40"</td>
                    <td className="py-2">27.5"</td>
                    <td className="py-2">19.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">S</td>
                    <td className="py-2">40 - 42"</td>
                    <td className="py-2">28.5"</td>
                    <td className="py-2">20.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">M</td>
                    <td className="py-2">42 - 44"</td>
                    <td className="py-2">29.5"</td>
                    <td className="py-2">20.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">L</td>
                    <td className="py-2">44 - 46"</td>
                    <td className="py-2">30.5"</td>
                    <td className="py-2">21.0"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">XL</td>
                    <td className="py-2">46 - 48"</td>
                    <td className="py-2">31.5"</td>
                    <td className="py-2">21.5"</td>
                  </tr>
                  <tr>
                    <td className="py-2 font-bold">XXL</td>
                    <td className="py-2">48 - 50"</td>
                    <td className="py-2">32.5"</td>
                    <td className="py-2">22.0"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
