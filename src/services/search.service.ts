import { api } from './api'
import type { PaginatedResponse } from '../types'

export interface SearchResultItem {
  id: string
  name: string
  slug: string
  basePrice: number
  mrp: number
  badge: string | null
  categoryName: string
  image: string | null
}

export interface SearchProductsParams {
  q: string
  page?: number
  limit?: number
}

export async function searchProducts(params: SearchProductsParams) {
  const { data } = await api.get<PaginatedResponse<SearchResultItem>>('/search', { params })
  return data
}
