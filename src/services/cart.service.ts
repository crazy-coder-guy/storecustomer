import { api } from './api'
import type { CartResponse } from '../types'

export async function getCart() {
  const { data } = await api.get<CartResponse>('/cart')
  return data
}

export async function addCartItem(variantId: string, quantity = 1) {
  const { data } = await api.post<CartResponse>('/cart/items', { variantId, quantity })
  return data
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.patch<CartResponse>(`/cart/items/${itemId}`, { quantity })
  return data
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete<CartResponse>(`/cart/items/${itemId}`)
  return data
}

export async function clearCart() {
  const { data } = await api.delete<CartResponse>('/cart')
  return data
}
