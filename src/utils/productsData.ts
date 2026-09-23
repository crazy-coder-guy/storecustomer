export interface ProductDetailData {
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

export const PRODUCTS_DATABASE: Record<string, ProductDetailData> = {
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
      'This piece blends the casual cool of a shirt with the easy confidence of a hood, creating a vibe that feels young and modern. The relaxed shape makes it perfect for everything from coffee runs to casual nights out.',
    styleTip: 'Layer over a basic white tee and pair with tapered utility pants for a sharp relaxed look.',
    materialCare: ['71% Cotton 29% Polyester', 'Machine Wash Cold', 'Do Not Tumble Dry'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: [
      'Kaira Studio Crafts Ltd.',
      'Plot 42, Textile Craft Zone, Surat',
      'care@kairaapparel.com',
    ],
    details: [
      '71% Cotton 29% Polyester blend',
      'Relaxed oversized shirt with integrated lightweight hood',
      'Pre-shrunk fabric for long-lasting fit',
      'Custom tortoise finish buttons',
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
    materialCare: ['100% Combed Cotton', 'Machine Wash Cold', 'Iron Inside Out'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: [
      'Kaira Studio Crafts Ltd.',
      'Plot 42, Textile Craft Zone, Surat',
      'care@kairaapparel.com',
    ],
    details: [
      '100% Combed Cotton (220 GSM)',
      'Water-based screen print artwork',
      'Classic relaxed drop-shoulder cut',
      'Ribbed neckline with reinforcement tape',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'Pitch Black', hex: '#000000' },
      { name: 'Desert Sand', hex: '#D2B48C' },
    ],
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  'prod-3': {
    id: 'prod-3',
    name: 'Botanical Sketch Organic Drop-Shoulder Tee',
    subtitle: 'Graphic Tees',
    category: 'Minimal Graphic Tees',
    price: 1399,
    mrp: 1899,
    badge: 'Organic',
    rating: 4.8,
    reviewsCount: 76,
    description:
      'Crafted from 100% certified organic cotton, this botanical illustration celebrates hand-drawn artistry and peaceful minimalism.',
    styleTip: 'Looks best untucked over baggy cargo pants or relaxed linen shorts.',
    materialCare: ['100% Organic Cotton', 'Gentle Cycle Wash'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: ['Kaira Studio Crafts Ltd.', 'care@kairaapparel.com'],
    details: ['Organic ring-spun cotton', 'Hand-drawn botanic illustration print', 'Relaxed silhouette'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Bone White', hex: '#F5F5DC' },
      { name: 'Slate Charcoal', hex: '#1C2833' },
    ],
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  'prod-4': {
    id: 'prod-4',
    name: 'Vintage Acid Wash Heavy Crewneck',
    subtitle: 'T-Shirts',
    category: 'Heavyweight T-Shirts',
    price: 1699,
    mrp: 2299,
    badge: 'Must Have',
    rating: 4.9,
    reviewsCount: 115,
    description:
      'Individually enzyme-washed to deliver a one-of-a-kind vintage fade and buttery hand-feel. Heavyweight 260 GSM fabric creates structured drape.',
    styleTip: 'Pair with dark denim and chunky Chelsea boots.',
    materialCare: ['100% Cotton 260 GSM', 'Wash inside out in cold water'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: ['Kaira Studio Crafts Ltd.', 'care@kairaapparel.com'],
    details: ['260 GSM heavy cotton', 'Enzyme stone acid wash effect', 'High neck ribbed collar'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Washed Navy', hex: '#2C3E50' },
      { name: 'Mineral Grey', hex: '#888888' },
    ],
    images: [
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=1200&auto=format&fit=crop',
    ],
  },
  'h-1': {
    id: 'h-1',
    name: 'Heavyweight Oversized Cotton Tee',
    subtitle: 'Heavyweight T-Shirts',
    category: 'Heavyweight T-Shirts',
    price: 1299,
    mrp: 1799,
    badge: 'Top Seller',
    rating: 4.9,
    reviewsCount: 142,
    description:
      'Engineered with heavyweight 240 GSM organic cotton that resists wrinkling and holds a crisp, modern streetwear drape all day long.',
    styleTip: 'Wear boxy with loose fit trousers.',
    materialCare: ['100% Organic Heavy Cotton', 'Machine Wash Cold'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: ['Kaira Studio Crafts Ltd.', 'care@kairaapparel.com'],
    details: ['240 GSM organic cotton', 'Drop shoulders', 'Thick 1-inch neck ribbing'],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pitch Black', hex: '#000000' },
      { name: 'Off White', hex: '#F5F5F0' },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
    ],
  },
}

export function getProductById(id: string): ProductDetailData {
  if (PRODUCTS_DATABASE[id]) return PRODUCTS_DATABASE[id]
  // Fallback generic product generator if custom ID
  return {
    id,
    name: 'Kaira Core Essential Apparel',
    subtitle: 'Contemporary Streetwear',
    category: 'Apparel Essentials',
    price: 1499,
    mrp: 1999,
    badge: 'Essential',
    rating: 4.9,
    reviewsCount: 88,
    description:
      'Engineered with meticulous attention to detail, premium weight textiles, and a tailored oversized cut designed for contemporary everyday styling.',
    styleTip: 'Pair effortlessly with your wardrobe staple bottoms and clean sneakers.',
    materialCare: ['100% Premium Cotton', 'Machine wash cold with like colors', 'Do not bleach'],
    countryOfOrigin: 'India (and proud)',
    manufacturedBy: ['Kaira Studio Crafts Ltd.', 'care@kairaapparel.com'],
    details: [
      'Crafted from high-grade combed cotton',
      'Pre-shrunk fabric for long-lasting fit and drape',
      'Tailored relaxed proportions',
      'Reinforced seam stitching',
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Pitch Black', hex: '#000000' },
      { name: 'Off White', hex: '#F5F5F0' },
      { name: 'Desert Sand', hex: '#D2B48C' },
    ],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800&auto=format&fit=crop',
    ],
  }
}
