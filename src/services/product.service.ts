import { api } from './api'
import type { PaginatedResponse, Product, ProductDetail, ProductStatus } from '../types'

export interface ListProductsParams {
  search?: string
  category_id?: string
  status?: ProductStatus
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
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
  const { data } = await api.get<PaginatedResponse<Product>>('/products', { params })
  return { ...data, items: data.items.map(coerceProduct) }
}

export async function getProduct(id: string) {
  const { data } = await api.get<ProductDetail>(`/products/${id}`)
  return coerceProductDetail(data)
}
