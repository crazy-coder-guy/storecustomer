import { useQuery } from '@tanstack/react-query'
import { getProduct, listProducts, type ListProductsParams } from '../services/product.service'
import { listCategories } from '../services/category.service'
import { getStorefrontSettings, listFeaturedProducts } from '../services/storefront.service'
import { searchProducts } from '../services/search.service'
import type { ProductListItem } from '../types'

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

function toProductCardData(p: ProductListItem): ProductCardData {
  const images = [...p.images].sort((a, b) => a.sortOrder - b.sortOrder)
  const primary = images.find((img) => img.isPrimary) ?? images[0]
  const colors = p.colors.map((c) => c.hexCode)

  return {
    id: p.id,
    name: p.name,
    categoryName: p.category?.name ?? '',
    price: p.basePrice,
    mrp: p.mrp,
    image: primary?.imageUrl ?? PLACEHOLDER_PRODUCT_IMAGE,
    colors,
    badge: p.badge,
  }
}

/**
 * The list-products endpoint already includes each product's images and
 * variant colors (see ProductListItem), so cards render straight from the
 * list response with zero extra requests — no per-card detail fetch just to
 * show a thumbnail and swatches for products the shopper hasn't opened.
 */
export function useProductCards(products: ProductListItem[] | undefined): {
  cards: ProductCardData[]
  isLoading: boolean
} {
  const cards = (products ?? []).map(toProductCardData)
  return { cards, isLoading: false }
}

/**
 * Wishlist/localStorage only stores product ids. Resolves them to real
 * product cards with a single batched `/products?ids=...` request instead of
 * one detail call per id.
 */
export function useProductCardsByIds(ids: string[]): {
  cards: ProductCardData[]
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: ['products', 'by-ids', ids],
    queryFn: () => listProducts({ ids, limit: ids.length }),
    enabled: ids.length > 0,
    staleTime: 30 * 1000,
  })

  const byId = new Map((data?.items ?? []).map((p) => [p.id, p]))
  const cards = ids
    .map((id) => byId.get(id))
    .filter((p): p is ProductListItem => Boolean(p))
    .map(toProductCardData)

  return { cards, isLoading: ids.length > 0 && isLoading }
}
