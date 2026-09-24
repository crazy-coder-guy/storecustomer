import { api } from './api'
import type { Color, PaginatedResponse } from '../types'

export interface ListColorsParams {
  status?: 'ACTIVE' | 'INACTIVE'
  page?: number
  limit?: number
}

export async function listColors(params: ListColorsParams = {}) {
  const { data } = await api.get<PaginatedResponse<Color>>('/colors', { params })
  return data
}
