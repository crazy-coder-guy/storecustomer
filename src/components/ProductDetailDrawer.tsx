import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatCurrency } from '../utils/formatCurrency'
import { getProductById, type ProductDetailData } from '../utils/productsData'
import { useCart } from '../context/CartContext'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  StarIcon,
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

export function ProductDetailDrawer({ productId, isOpen, onClose }: ProductDetailDrawerProps) {
  const { addToCart } = useCart()
  const [product, setProduct] = useState<ProductDetailData | null>(null)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null)
  const [addedSuccess, setAddedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'care' | 'origin'>('details')

  useEffect(() => {
    if (productId) {
      const data = getProductById(productId)
      setProduct(data)
      setSelectedImage(data.images[0])
      setSelectedSize(data.sizes[1] || data.sizes[0] || 'M')
      setSelectedColor(data.colors[0] || { name: 'Standard', hex: '#000000' })
      setAddedSuccess(false)
    }
  }, [productId])

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

  const handleQuickAdd = () => {
    if (!product || !selectedColor) return
    addToCart({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      price: product.price,
      mrp: product.mrp,
      image: selectedImage || product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity: 1,
    })
    setAddedSuccess(true)
    setTimeout(() => setAddedSuccess(false), 2200)
  }

  const discountPercent = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0

  return (
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
                {product.category}
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
                {product.badge && (
                  <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-white shadow-xs">
                    {product.badge}
                  </span>
                )}
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="h-full w-full object-cover object-top transition-all duration-300"
                />
              </div>

              {/* Reference Thumbnails Column on the Right */}
              {product.images.length > 1 && (
                <div className="flex flex-col gap-2 shrink-0 justify-center">
                  {product.images.map((img, idx) => (
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
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1 font-black text-black">
                  <HugeiconsIcon icon={StarIcon} size={14} className="fill-black text-black" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-black/30">•</span>
                <span className="font-semibold text-black/50">
                  {product.reviewsCount} reviews
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight leading-snug">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-2xl font-black text-black">
                  {formatCurrency(product.price)}
                </span>
                {product.mrp > product.price && (
                  <span className="text-sm font-semibold text-black/40 line-through">
                    {formatCurrency(product.mrp)}
                  </span>
                )}
                {discountPercent > 0 && (
                  <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
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
                {product.colors.map((color) => (
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
                <span className="text-[11px] font-extrabold text-black/50 uppercase">Oversized Relaxed Fit</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
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
                {product.description}
              </p>
              {product.styleTip && (
                <div className="rounded-xl bg-neutral-50 p-3 border border-black/5 text-xs">
                  <span className="font-black text-black">Style Tip: </span>
                  <span className="text-black/70 font-medium">{product.styleTip}</span>
                </div>
              )}
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
                  Key Highlights
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('care')}
                  className={`pb-2 mr-5 transition-colors cursor-pointer border-b-2 -mb-px ${
                    activeTab === 'care' ? 'border-black text-black' : 'border-transparent text-black/40 hover:text-black'
                  }`}
                >
                  Material & Care
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('origin')}
                  className={`pb-2 transition-colors cursor-pointer border-b-2 -mb-px ${
                    activeTab === 'origin' ? 'border-black text-black' : 'border-transparent text-black/40 hover:text-black'
                  }`}
                >
                  Origin & Craft
                </button>
              </div>

              {activeTab === 'details' && (
                <ul className="space-y-1.5 text-xs text-black/70 font-medium list-disc list-inside">
                  {product.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'care' && (
                <ul className="space-y-1.5 text-xs text-black/70 font-medium list-disc list-inside">
                  {product.materialCare.map((care, idx) => (
                    <li key={idx}>{care}</li>
                  ))}
                </ul>
              )}

              {activeTab === 'origin' && (
                <div className="space-y-1 text-xs text-black/70 font-medium">
                  <p><strong className="text-black">Country of Origin:</strong> {product.countryOfOrigin}</p>
                  <p><strong className="text-black">Crafted By:</strong> {product.manufacturedBy.join(', ')}</p>
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
              onClick={handleQuickAdd}
              className="flex-1 group relative flex items-center justify-between overflow-hidden rounded-full border border-black bg-black px-6 py-3 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
            >
              <span className="absolute inset-0 translate-y-full rounded-full bg-white transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0" />
              <div className="relative z-10 flex items-center justify-between w-full">
                <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-white transition-all duration-300 group-hover:text-black">
                  {addedSuccess ? '✓ Added To Bag' : 'Add to Bag'}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-all duration-300 group-hover:bg-black group-hover:text-white">
                  <HugeiconsIcon icon={addedSuccess ? CheckmarkCircle02Icon : ArrowRight01Icon} size={16} strokeWidth={2.4} />
                </span>
              </div>
            </button>

            <Link
              to={`/product/${product.id}`}
              onClick={onClose}
              className="shrink-0 rounded-full border border-black/20 px-4 py-3 text-xs font-black text-black hover:border-black transition-colors"
            >
              Full Page →
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
