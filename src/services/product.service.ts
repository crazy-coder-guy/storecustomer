import { api } from './api'
import type { PaginatedResponse, Product, ProductDetail, ProductListItem, ProductStatus } from '../types'

export interface ListProductsParams {
  search?: string
  category_id?: string
  status?: ProductStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
  ids?: string[]
}

function coerceProduct<T extends Product>(product: T): T {
  return {
    ...product,
    basePrice: Number(product.basePrice),
    mrp: Number(product.mrp),
  }
}

function coerceProductDetail(product: ProductDetail): ProductDetail {
  return {
    ...coerceProduct(product),
    variants: (product.variants || []).map((v) => ({
      ...v,
      price: v.price === null || v.price === undefined ? null : Number(v.price),
    })),
  }
}

export async function listProducts(params: ListProductsParams) {
  const { ids, ...rest } = params
  const query = { ...rest, ...(ids && ids.length > 0 ? { ids: ids.join(',') } : {}) }
  const { data } = await api.get<PaginatedResponse<ProductListItem>>('/products', { params: query })
  return { ...data, items: data.items.map(coerceProduct) }
}

export async function getProduct(id: string) {
  const { data } = await api.get<ProductDetail>(`/products/${id}`)
  return coerceProductDetail(data)
}

/**
 * "Quick add" buttons on product cards (Top Selling, category grids,
 * wishlist) don't let the shopper pick a color/size, so they need some
 * variant to add to the cart — prefer an in-stock one, falling back to the
 * first ACTIVE variant so the button isn't dead on an out-of-stock product.
 */
export async function resolveDefaultVariantId(productId: string): Promise<string> {
  const product = await getProduct(productId)
  const activeVariants = product.variants.filter((v) => v.status === 'ACTIVE')
  const inStock = activeVariants.find((v) => v.stockQuantity > 0)
  const variant = inStock ?? activeVariants[0]
  if (!variant) throw new Error(`"${product.name}" has no available options right now`)
  return variant.id
}
