import { useState } from 'react'
import { Navbar } from '../components/Navbar'
import { Footer } from '../components/Footer'
import { ProductCard, type ProductItem } from '../components/ProductCard'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, FilterIcon } from '@hugeicons/core-free-icons'

const ALL_CATEGORY_PRODUCTS: Record<string, ProductItem[]> = {
  'heavyweight-t-shirts': [
    {
      id: 'h-1',
      name: 'Heavyweight Oversized Cotton Tee',
      category: 'Heavyweight T-Shirts',
      price: 1299,
      mrp: 1799,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      rating: 4.9,
      reviewsCount: 142,
      badge: 'Top Seller',
      colors: ['#000000', '#F5F5F0', '#3D3D3D'],
    },
    {
      id: 'h-2',
      name: '240 GSM Boxy Heavy Crewneck',
      category: 'Heavyweight T-Shirts',
      price: 1599,
      mrp: 2099,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      rating: 4.8,
      reviewsCount: 89,
      badge: 'Heavyweight',
      colors: ['#1C2833', '#888888'],
    },
    {
      id: 'h-3',
      name: 'Vintage Acid Wash Heavy Crewneck',
      category: 'Heavyweight T-Shirts',
      price: 1699,
      mrp: 2299,
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
      rating: 4.9,
      reviewsCount: 115,
      badge: 'Must Have',
      colors: ['#2C3E50', '#888888'],
    },
    {
      id: 'h-4',
      name: 'Structured Heavy Raw Cotton Tee',
      category: 'Heavyweight T-Shirts',
      price: 1499,
      mrp: 1999,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      rating: 4.7,
      reviewsCount: 64,
      badge: 'Raw Finish',
      colors: ['#D2B48C', '#FFFFFF'],
    },
  ],
  'oversized-drop-shoulder': [
    {
      id: 'o-1',
      name: 'Botanical Sketch Organic Drop-Shoulder Tee',
      category: 'Oversized & Drop-Shoulder',
      price: 1399,
      mrp: 1899,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      rating: 4.8,
      reviewsCount: 76,
      badge: 'Organic',
      colors: ['#F5F5DC', '#1C2833'],
    },
    {
      id: 'o-2',
      name: 'Relaxed Silhouette Drop-Shoulder Fit',
      category: 'Oversized & Drop-Shoulder',
      price: 1499,
      mrp: 1999,
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      rating: 5.0,
      reviewsCount: 112,
      badge: 'Relaxed Fit',
      colors: ['#000000', '#D2B48C'],
    },
  ],
  'minimal-graphic-tees': [
    {
      id: 'g-1',
      name: 'Minimalist Mountain Line Graphic Tee',
      category: 'Minimal Graphic Tees',
      price: 1499,
      mrp: 1999,
      image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
      rating: 5.0,
      reviewsCount: 98,
      badge: 'Trending Art',
      colors: ['#FFFFFF', '#D2B48C'],
    },
    {
      id: 'g-2',
      name: 'Monochrome Typography Screen Tee',
      category: 'Minimal Graphic Tees',
      price: 1349,
      mrp: 1799,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
      rating: 4.9,
      reviewsCount: 84,
      badge: 'New Art',
      colors: ['#000000', '#F5F5F0'],
    },
  ],
  'hoodies-outerwear': [
    {
      id: 'hw-1',
      name: 'French Terry Modular Zip Hoodie',
      category: 'Hoodies & Outerwear',
      price: 2499,
      mrp: 3299,
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=800&auto=format&fit=crop',
      rating: 4.9,
      reviewsCount: 156,
      badge: 'Outerwear',
      colors: ['#000000', '#3D3D3D'],
    },
  ],
}

const CATEGORY_NAMES: Record<string, { title: string; subtitle: string }> = {
  'heavyweight-t-shirts': {
    title: 'Heavyweight T-Shirts',
    subtitle: 'High GSM structured tees designed with premium 100% organic cotton for long-lasting drape.',
  },
  'oversized-drop-shoulder': {
    title: 'Oversized & Drop-Shoulder',
    subtitle: 'Relaxed shoulder cuts and wide body proportions for an effortless streetwear aesthetic.',
  },
  'minimal-graphic-tees': {
    title: 'Minimal Graphic Tees',
    subtitle: 'Monochrome line prints and subtle typography created by independent studio artists.',
  },
  'hoodies-outerwear': {
    title: 'Hoodies & Outerwear',
    subtitle: 'Heavy French terry fleece and layerable crewnecks engineered for all seasons.',
  },
}

export function CategoryProductsPage() {
  const [cartCount, setCartCount] = useState(0)

  // Extract category slug from hash/url or fallback to heavyweight-t-shirts
  const hash = window.location.hash.replace('#/category/', '').replace('#', '')
  const currentSlug = ALL_CATEGORY_PRODUCTS[hash] ? hash : 'heavyweight-t-shirts'

  const info = CATEGORY_NAMES[currentSlug] || CATEGORY_NAMES['heavyweight-t-shirts']
  const products = ALL_CATEGORY_PRODUCTS[currentSlug] || ALL_CATEGORY_PRODUCTS['heavyweight-t-shirts']

  return (
    <div className="min-h-screen bg-white text-black flex flex-col justify-between">
      <div>
        <Navbar cartCount={cartCount} onOpenCart={() => alert('Shopping bag clicked')} />

        {/* Compact Integrated Header Bar */}
        <section className="py-6 sm:py-8 border-b border-black/10">
          <div className="kaira-container">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
                  <a
                    href="/"
                    className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-black uppercase tracking-widest text-black/60 hover:text-black transition-colors shrink-0"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={13} />
                    <span>Back to Home</span>
                  </a>
                  <span className="text-black/30 shrink-0">•</span>
                  <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-black/40 shrink-0">Category Collection</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-black tracking-tight">
                  {info.title}
                </h1>
                <p className="text-xs sm:text-sm text-black/65 font-medium max-w-2xl">
                  {info.subtitle}
                </p>
              </div>

              {/* Category Quick Selector Pills */}
              <div className="flex items-center gap-2 pt-2 md:pt-0">
                {Object.keys(CATEGORY_NAMES).map((slug) => (
                  <a
                    key={slug}
                    href={`/#/category/${slug}`}
                    onClick={() => setTimeout(() => window.location.reload(), 50)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all ${
                      currentSlug === slug
                        ? 'bg-black text-white shadow-xs'
                        : 'bg-gray-100 text-black/70 hover:bg-gray-200'
                    }`}
                  >
                    {CATEGORY_NAMES[slug].title.split(' ')[0]}
                  </a>
                ))}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => setCartCount((c) => c + 1)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  )
}
