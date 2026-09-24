import { api } from './api'
import type { CartItemResponse } from '../types'

export async function getCart() {
  const { data } = await api.get<CartItemResponse[]>('/cart')
  return data
}

export async function addCartItem(variantId: string, quantity = 1) {
  const { data } = await api.post<CartItemResponse[]>('/cart/items', { variantId, quantity })
  return data
}

export async function updateCartItem(itemId: string, quantity: number) {
  const { data } = await api.patch<CartItemResponse[]>(`/cart/items/${itemId}`, { quantity })
  return data
}

export async function removeCartItem(itemId: string) {
  const { data } = await api.delete<CartItemResponse[]>(`/cart/items/${itemId}`)
  return data
}

export async function clearCart() {
  const { data } = await api.delete<CartItemResponse[]>('/cart')
  return data
}
