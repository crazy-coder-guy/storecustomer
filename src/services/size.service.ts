import { api } from './api'
import type { Size, PaginatedResponse } from '../types'

export interface ListSizesParams {
  status?: 'ACTIVE' | 'INACTIVE'
  page?: number
  limit?: number
}

export async function listSizes(params: ListSizesParams = {}) {
  const { data } = await api.get<PaginatedResponse<Size>>('/sizes', { params })
  return data
}
