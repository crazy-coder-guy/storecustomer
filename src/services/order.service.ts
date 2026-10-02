import { api } from './api'
import type { CreateOrderInput, Order } from '../types'

function coerceOrder(order: Order): Order {
  return {
    ...order,
    totalAmount: Number(order.totalAmount),
    discountAmount: Number(order.discountAmount ?? 0),
    items: order.items.map((item) => ({ ...item, unitPrice: Number(item.unitPrice) })),
  }
}

export async function createOrder(input: CreateOrderInput) {
  const { data } = await api.post<Order>('/orders', input)
  return coerceOrder(data)
}

export async function cancelOrder(id: string) {
  const { data } = await api.post<Order>(`/orders/${id}/cancel`)
  return coerceOrder(data)
}

export async function getOrder(id: string) {
  const { data } = await api.get<Order>(`/orders/${id}`)
  return coerceOrder(data)
}

export async function listMyOrders() {
  const { data } = await api.get<Order[]>('/orders/mine')
  return data.map(coerceOrder)
}
