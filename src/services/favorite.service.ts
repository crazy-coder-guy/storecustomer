import { api } from './api'

export async function getFavorites() {
  const { data } = await api.get<string[]>('/favorites')
  return data
}

export async function addFavorite(productId: string) {
  const { data } = await api.post<string[]>(`/favorites/${productId}`)
  return data
}

export async function removeFavorite(productId: string) {
  const { data } = await api.delete<string[]>(`/favorites/${productId}`)
  return data
}

export async function clearFavorites() {
  const { data } = await api.delete<string[]>('/favorites')
  return data
}
