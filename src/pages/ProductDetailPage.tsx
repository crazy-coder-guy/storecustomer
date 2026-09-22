import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { LiquidButton } from '../components/LiquidButton'
import { formatCurrency } from '../utils/formatCurrency'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  FavouriteIcon,
  ShoppingBag01Icon,
  PackageIcon,
  SecurityCheckIcon,
  RefreshIcon,
  StarIcon,
  ArrowLeft01Icon,
  CheckmarkCircle02Icon,
} from '@hugeicons/core-free-icons'

interface ProductDetailData {
  id: string
  name: string
  subtitle: string
  category: string
  price: number
  mrp: number
  description: string
  styleTip: string
  materialCare: string[]
  countryOfOrigin: string
  manufacturedBy: string[]
  details: string[]
  images: string[]
  sizes: string[]
  colors: { name: string; hex: string }[]
  badge?: string
  rating: number
  reviewsCount: number
}

const SAMPLE_PRODUCTS_DB: Record<string, ProductDetailData> = {
  'prod-1': {
    id: 'prod-1',
    name: 'Hooded Shirt: Desert Vibe',
    subtitle: 'Oversized Shirts',
    category: 'Oversized Shirts',
    price: 1999,
    mrp: 2499,
    badge: 'Top Seller',
    rating: 4.9,
    reviewsCount: 142,
    description:
      'This piece blends the casual cool of a shirt with the easy confidence of a hood, creating a vibe that feels young and modern. The relaxed shape makes it perfect for everything from coffee runs to casual nights out. It adds a little mystery without trying hard at all.',
    styleTip: 'Layer over a basic tee and pair with tapered pants for a sharp relaxed look.',
    materialCare: ['71% Cotton 29% Polyester', 'Machine Wash'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: [
      'The Souled Store Pvt. Ltd.',
      '24, Tantia Jogani Industrial Premises',
      'J.R. Boricha Marg, Lower Parel (E)',
      'Mumbai - 400 011',
      'connect@thesouledstore.com',
      'Customer care no. +91 22-68493328',
    ],
    details: [
      '71% Cotton 29% Polyester blend',
      'Relaxed oversized shirt with integrated hood',
      'Pre-shrunk fabric for long-lasting fit',
      'Machine wash cold with like colors',
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Desert Vibe', hex: '#D2B48C' },
      { name: 'Pitch Black', hex: '#000000' },
      { name: 'Off White', hex: '#F5F5F0' },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  'prod-2': {
    id: 'prod-2',
    name: 'Minimalist Mountain Line Graphic Tee',
    subtitle: 'Graphic Tees',
    category: 'Minimal Graphic Tees',
    price: 1499,
    mrp: 1999,
    badge: 'Trending',
    rating: 5.0,
    reviewsCount: 98,
    description:
      'Featuring custom studio artwork screen-printed with eco-friendly water-based ink on 220 GSM combed cotton. Lightweight feel with structured durability.',
    styleTip: 'Pair with relaxed denim and low-top sneakers for an effortless day look.',
    materialCare: ['100% Combed Cotton', 'Machine Wash Cold'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: [
      'The Souled Store Pvt. Ltd.',
      'Lower Parel (E), Mumbai - 400 011',
      'connect@thesouledstore.com',
    ],
    details: [
      '100% Combed Cotton (220 GSM)',
      'Water-based screen print artwork',
      'Classic relaxed fit',
    ],
    sizes: ['M', 'L', 'XL'],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Desert Sand', hex: '#D2B48C' },
    ],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
    ],
  },
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [cartCount, setCartCount] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')

  // Fallback to prod-1 if id not found
  const productKey = id && SAMPLE_PRODUCTS_DB[id] ? id : 'prod-1'
  const product = SAMPLE_PRODUCTS_DB[productKey]

  const [selectedImage, setSelectedImage] = useState(product.images[0])
  const [selectedSize, setSelectedSize] = useState(product.sizes[1] || product.sizes[0])
  const [selectedColor, setSelectedColor] = useState(product.colors[0])
  const [addedNotification, setAddedNotification] = useState(false)

  const handleAddToCart = () => {
    setCartCount((c) => c + 1)
    setAddedNotification(true)
    setTimeout(() => setAddedNotification(false), 2500)
  }

  const toggleAccordion = (key: string) => {
    setOpenAccordion((prev) => (prev === key ? null : key))
  }

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar cartCount={cartCount} onOpenCart={() => alert('Bag drawer opened')} />

        {/* Breadcrumb Navigation */}
        {/* Breadcrumb Navigation - Single Line Safe */}
        <div className="border-b border-black/5 bg-neutral-50/50 py-2.5">
          <div className="kaira-container flex items-center justify-between text-[11px] sm:text-xs font-bold text-black/60 uppercase tracking-wider overflow-x-auto whitespace-nowrap no-scrollbar">
            <div className="flex items-center gap-1.5 shrink-0">
              <Link to="/" className="hover:text-black transition-colors flex items-center gap-1 shrink-0">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
                <span>Home</span>
              </Link>
              <span className="text-black/30">/</span>
              <span className="shrink-0">{product.category}</span>
              <span className="text-black/30">/</span>
              <span className="text-black font-black truncate max-w-[150px] sm:max-w-none">
                {product.name}
              </span>
            </div>
          </div>
        </div>

        {/* Split Viewport Layout: Sticky Left Image Gallery + Scrollable Right Specs */}
        <section className="py-6 lg:py-10">
          <div className="kaira-container">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Sticky Image Gallery (Balanced Height) */}
              <div className="lg:col-span-7 lg:sticky lg:top-24 flex flex-col-reverse sm:flex-row gap-4 h-auto lg:h-[calc(100vh-200px)] lg:max-h-[620px]">
                {/* Thumbnails */}
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto shrink-0 pr-1 max-h-full">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-2xl border-2 transition-all cursor-pointer shrink-0 ${
                        selectedImage === img
                          ? 'border-black shadow-md scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Main Image Container - Full Device Viewport Height */}
                <div className="relative flex-1 h-full min-h-[500px] lg:min-h-0 overflow-hidden rounded-3xl bg-neutral-100 border border-black/10 shadow-sm">
                  {product.badge && (
                    <span className="absolute left-5 top-5 z-10 rounded-full bg-black px-4 py-1.5 text-xs font-black text-white uppercase tracking-widest shadow-lg">
                      {product.badge}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/95 backdrop-blur-md transition-all cursor-pointer hover:scale-110 shadow-md ${
                      isWishlisted ? 'text-red-500' : 'text-black/80 hover:text-black'
                    }`}
                  >
                    <HugeiconsIcon icon={FavouriteIcon} size={20} />
                  </button>

                  <img
                    src={selectedImage}
                    alt={product.name}
                    className="h-full w-full object-cover object-top transition-all duration-500"
                  />
                </div>
              </div>

              {/* Right Column: Independently Scrollable Details, Purchase & Specs */}
              <div className="lg:col-span-5 space-y-6">
                {/* Meta Header */}
                <div className="space-y-3 pb-4 border-b border-black/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-widest text-black/50">
                      {product.subtitle || product.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-black">
                      <HugeiconsIcon icon={StarIcon} size={14} className="text-amber-500 fill-amber-500" />
                      <span className="font-black">{product.rating}</span>
                      <span className="text-black/50 font-medium">({product.reviewsCount} reviews)</span>
                    </div>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  {/* Price */}
                  <div className="space-y-0.5">
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-black text-black">
                        {formatCurrency(product.price)}
                      </span>
                      {product.mrp > product.price && (
                        <span className="text-base font-bold text-black/40 line-through">
                          {formatCurrency(product.mrp)}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-black/60 block">
                      Price incl. of all taxes
                    </span>
                  </div>
                </div>

                {/* Color Selector */}
                <div className="space-y-2.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-black">
                    Color: <span className="text-black/70 font-semibold">{selectedColor.name}</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`relative h-9 w-9 rounded-full border-2 transition-all cursor-pointer ${
                          selectedColor.name === color.name ? 'border-black scale-110 shadow-sm' : 'border-black/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
                    <span>Select Size</span>
                    <button type="button" className="text-black/60 underline hover:text-black cursor-pointer font-bold">
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2.5">
                    {product.sizes.map((size) => (
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
                    variant="primary"
                    className="w-full !py-4 justify-between !text-base shadow-lg"
                  >
                    <span>Add to Bag • {formatCurrency(product.price)}</span>
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
                      <span className="text-xs font-black text-black leading-tight">100% Organic Cotton</span>
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
                    Product Details & Care
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
                            {product.description}
                          </p>
                          {product.styleTip && (
                            <div className="rounded-xl bg-neutral-100 border-l-4 border-black p-3.5 space-y-1">
                              <span className="text-[10px] font-black uppercase tracking-widest text-black/60 block">Style Tip</span>
                              <p className="text-xs font-bold text-black leading-relaxed">{product.styleTip}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion 2: Material & Care */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('material')}
                      className="w-full py-4 flex items-center justify-between font-black text-sm text-black uppercase tracking-wider text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Material & Care</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 ${openAccordion === 'material' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${openAccordion === 'material' ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0'}`}>
                      <div className="overflow-hidden">
                        <div className="space-y-3 pt-1 text-sm text-black/80 font-bold">
                          {product.materialCare?.map((item, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-black shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                          <div className="pt-3 text-xs font-bold text-black/60 border-t border-black/5 mt-2">
                            Country of Origin: <span className="text-black font-black">{product.countryOfOrigin}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Accordion 3: Manufactured & Sold By */}
                  <div className="border-b border-black/10">
                    <button
                      type="button"
                      onClick={() => toggleAccordion('manufacturer')}
                      className="w-full py-4 flex items-center justify-between font-black text-sm text-black uppercase tracking-wider text-left cursor-pointer group"
                    >
                      <span className="group-hover:text-black/70 transition-colors">Manufactured & Sold By</span>
                      <span className={`text-xl font-bold text-black transition-transform duration-300 ${openAccordion === 'manufacturer' ? 'rotate-45' : 'rotate-0'}`}>
                        +
                      </span>
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${openAccordion === 'manufacturer' ? 'grid-rows-[1fr] opacity-100 pb-5' : 'grid-rows-[0fr] opacity-0 pb-0'}`}>
                      <div className="overflow-hidden">
                        <div className="space-y-1 pt-1 text-xs text-black/80 font-semibold leading-relaxed">
                          {product.manufacturedBy?.map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
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
