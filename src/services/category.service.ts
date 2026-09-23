import { api } from './api'
import type { Category, EntityStatus, PaginatedResponse } from '../types'

export interface ListCategoriesParams {
  search?: string
  status?: EntityStatus
  page?: number
  limit?: number
}

export async function listCategories(params: ListCategoriesParams = {}) {
  const { data } = await api.get<PaginatedResponse<Category>>('/categories', { params })
  return data
}
