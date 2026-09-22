import { ProductCard, type ProductItem } from './ProductCard'

interface TopSellingSectionProps {
  onAddToCart?: (product: ProductItem) => void
}

const TOP_SELLING_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Heavyweight Oversized Cotton Tee',
    category: 'T-Shirts',
    price: 1299,
    mrp: 1799,
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Top Seller',
    colors: ['#000000', '#F5F5F0', '#3D3D3D'],
  },
  {
    id: 'prod-2',
    name: 'Minimalist Mountain Line Graphic Tee',
    category: 'T-Shirts',
    price: 1499,
    mrp: 1999,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    rating: 5.0,
    reviewsCount: 98,
    badge: 'Trending',
    colors: ['#FFFFFF', '#D2B48C'],
  },
  {
    id: 'prod-3',
    name: 'Botanical Sketch Organic Drop-Shoulder Tee',
    category: 'T-Shirts',
    price: 1399,
    mrp: 1899,
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    reviewsCount: 76,
    badge: 'Organic',
    colors: ['#F5F5DC', '#1C2833'],
  },
  {
    id: 'prod-4',
    name: 'Vintage Acid Wash Heavy Crewneck',
    category: 'T-Shirts',
    price: 1699,
    mrp: 2299,
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    reviewsCount: 115,
    badge: 'Must Have',
    colors: ['#2C3E50', '#888888'],
  },
]

export function TopSellingSection({ onAddToCart }: TopSellingSectionProps) {
  return (
    <section id="shop" className="py-16 sm:py-24 bg-white">
      <div className="kaira-container">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 sm:mb-14 gap-4 border-b border-black/5 pb-6">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-black/40">Curated Favorites</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-black tracking-tight mt-1">
              Top Selling T-Shirts
            </h2>
          </div>
          <a
            href="#categories"
            className="group flex items-center gap-1 text-xs sm:text-sm font-extrabold text-black uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            <span>View All Products</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
          {TOP_SELLING_PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  )
}
