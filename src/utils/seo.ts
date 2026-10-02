import type { ProductDetail, Category } from '../types'

export const SITE_URL = 'https://kaiira.in'
export const SITE_NAME = 'KAIIRA'
// A real, existing asset — used only as a last-resort fallback when a page
// (or a product with no images yet) has nothing better to share.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512.png`

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export interface JsonLd {
  '@context': 'https://schema.org'
  '@type': string | string[]
  [key: string]: unknown
}

export function buildOrganizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Brand'],
    name: SITE_NAME,
    alternateName: ['Kaiira', 'KAIIRA Official', 'KAIIRA Clothing', 'Kaiira India'],
    legalName: 'KAIIRA',
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
    image: DEFAULT_OG_IMAGE,
    description:
      'KAIIRA is an Indian direct-to-consumer (D2C) fashion and streetwear clothing brand based in Tamil Nadu, India, specializing in premium oversized t-shirts, heavyweight tees, and minimalist modern apparel.',
    slogan: 'Redefining everyday essentials with heavyweight fabrics and relaxed tailored fits.',
    foundingLocation: {
      '@type': 'Place',
      name: 'Tamil Nadu, India',
    },
    knowsAbout: [
      'Streetwear Clothing',
      'Oversized T-Shirts',
      'Heavyweight Cotton T-Shirts',
      'D2C Fashion India',
      'Apparel Brand',
    ],
    sameAs: [
      'https://www.instagram.com/hello.kaiiraofficial',
      'https://www.facebook.com/hello.kaiiraofficia',
      'https://www.threads.com/@hello.kaiiraofficial',
      'https://www.youtube.com/@hello.KaiiraOfficial',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@kaiira.in',
      url: `${SITE_URL}/contact`,
      availableLanguage: ['English', 'Tamil'],
    },
  }
}

export function buildWebsiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  }
}

export interface BreadcrumbItem {
  name: string
  path: string
}

export function buildBreadcrumbJsonLd(items: BreadcrumbItem[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/**
 * Schema.org Product + Offer, built only from real product data — no
 * invented GTIN/MPN/ratings. `availability` reflects actual combined stock
 * across the product's active variants.
 */
export function buildProductJsonLd(product: ProductDetail): JsonLd {
  const images = [...product.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((img) => img.imageUrl)

  const activeVariants = product.variants.filter((v) => v.status === 'ACTIVE')
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stockQuantity, 0)
  const price = activeVariants.find((v) => v.price != null)?.price ?? product.basePrice
  const representativeSku = activeVariants[0]?.sku
  // Launching Soon products are visible but genuinely not purchasable yet —
  // real variant stock numbers (often 0, sometimes pre-loaded) don't reflect
  // that, so this takes priority regardless of totalStock.
  const availability =
    product.status === 'LAUNCHING_SOON'
      ? 'https://schema.org/OutOfStock'
      : totalStock > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock'

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} by ${SITE_NAME}.`,
    image: images.length > 0 ? images : undefined,
    url: absoluteUrl(`/products/${product.slug}`),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    category: product.category?.name,
    ...(representativeSku ? { sku: representativeSku } : {}),
    offers: {
      '@type': 'Offer',
      url: absoluteUrl(`/products/${product.slug}`),
      priceCurrency: 'INR',
      price: Number(price).toFixed(2),
      availability,
      itemCondition: 'https://schema.org/NewCondition',
    },
  }
}

export function buildCategoryBreadcrumb(category: Pick<Category, 'name' | 'slug'>): BreadcrumbItem[] {
  return [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/products' },
    { name: category.name, path: `/category/${category.slug}` },
  ]
}

export function buildProductBreadcrumb(product: ProductDetail): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ name: 'Home', path: '/' }]
  if (product.category) {
    items.push({ name: 'Shop', path: '/products' }, { name: product.category.name, path: `/category/${product.category.slug}` })
  } else {
    items.push({ name: 'Shop', path: '/products' })
  }
  items.push({ name: product.name, path: `/products/${product.slug}` })
  return items
}
