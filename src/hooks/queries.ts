import { useQueries, useQuery } from '@tanstack/react-query'
import { getProduct, listProducts, type ListProductsParams } from '../services/product.service'
import { listCategories } from '../services/category.service'
import { getStorefrontSettings, listFeaturedProducts } from '../services/storefront.service'
import { searchProducts } from '../services/search.service'
import type { Product } from '../types'

// A tiny inline gray placeholder, used only when a product genuinely has no images yet.
export const PLACEHOLDER_PRODUCT_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800"><rect width="800" height="800" fill="#e5e5e5"/></svg>'
  )

export interface ProductCardData {
  id: string
  name: string
  categoryName: string
  price: number
  mrp?: number
  image: string
  colors?: string[]
  badge?: string | null
}

export function useStorefrontSettings() {
  return useQuery({
    queryKey: ['storefront-settings'],
    queryFn: getStorefrontSettings,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ['featured-products'],
    queryFn: listFeaturedProducts,
    staleTime: 60 * 1000,
  })
}

export function useCategories(params: { status?: 'ACTIVE' | 'INACTIVE'; limit?: number } = {}) {
  return useQuery({
    queryKey: ['categories', params],
    queryFn: () => listCategories(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useProducts(params: ListProductsParams, enabled = true) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => listProducts(params),
    enabled,
    staleTime: 30 * 1000,
  })
}

/**
 * Fuzzy, ranked product search (typo-tolerant via PostgreSQL trigram
 * similarity on the backend). Results already include image/category/badge,
 * so no per-item detail fetch is needed here.
 */
export function useSearchProducts(q: string, enabled = true) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => searchProducts({ q, limit: 24 }),
    enabled: enabled && q.trim().length > 0,
    staleTime: 30 * 1000,
  })
}

export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id as string),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
  })
}

/**
 * Grids map products to card data. If the product objects already contain
 * images and colors from the optimized backend listProducts endpoint, we avoid
 * firing N parallel getProduct requests. Only items missing details trigger a fetch.
 */
export function useProductCards(products: Product[] | undefined): {
  cards: ProductCardData[]
  isLoading: boolean
} {
  const list = products ?? []
  
  // Only query detailed information if the product does not already have images provided
  const results = useQueries({
    queries: list.map((p) => ({
      queryKey: ['product', p.id],
      queryFn: () => getProduct(p.id),
      enabled: !p.images || p.images.length === 0,
      staleTime: 30 * 1000,
    })),
  })

  const cards: ProductCardData[] = list.map((p, idx) => {
    const detail = results[idx]?.data
    const images = (p.images && p.images.length > 0 ? p.images : detail?.images) ?? []
    const primary = images.find((img) => img.isPrimary) ?? images[0]
    
    let colors: string[] | undefined
    if (p.colors && p.colors.length > 0) {
      colors = p.colors.map((c) => c.hexCode).filter(Boolean)
    } else if (detail) {
      colors = Array.from(
        new Set(
          detail.variants
            .map((v) => v.color?.hexCode)
            .filter((hex): hex is string => Boolean(hex))
        )
      )
    }

    return {
      id: p.id,
      name: p.name,
      categoryName: p.category?.name ?? detail?.category?.name ?? '',
      price: p.basePrice,
      mrp: p.mrp,
      image: primary?.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE,
      colors,
      badge: p.badge ?? detail?.badge ?? null,
    }
  })

  const isLoading = results.length > 0 && results.some((r) => r.isLoading)
  return { cards, isLoading }
}

/**
 * Wishlist/localStorage only stores product ids, so this resolves each id to
 * a real product card by fetching its detail from the API.
 */
export function useProductCardsByIds(ids: string[]): {
  cards: ProductCardData[]
  isLoading: boolean
} {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ['product', id],
      queryFn: () => getProduct(id),
      staleTime: 30 * 1000,
      retry: false,
    })),
  })

  const cards: ProductCardData[] = ids
    .map((_id, idx): ProductCardData | null => {
      const detail = results[idx]?.data
      if (!detail) return null
      const images = [...detail.images].sort((a, b) => a.sortOrder - b.sortOrder)
      const primary = images.find((img) => img.isPrimary) ?? images[0]
      const colors = Array.from(
        new Set(detail.variants.map((v) => v.color?.hexCode).filter((hex): hex is string => Boolean(hex)))
      )
      return {
        id: detail.id,
        name: detail.name,
        categoryName: detail.category?.name ?? '',
        price: detail.basePrice,
        mrp: detail.mrp,
        image: primary?.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE,
        colors,
        badge: detail.badge,
      }
    })
    .filter((c): c is ProductCardData => c !== null)

  return { cards, isLoading: results.length > 0 && results.some((r) => r.isLoading) }
}
