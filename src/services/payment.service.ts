import { api } from './api'
import type { Order, RazorpayOrderResponse, VerifyPaymentInput } from '../types'

export async function createRazorpayOrder(orderId: string) {
  const { data } = await api.post<RazorpayOrderResponse>(`/orders/${orderId}/razorpay-order`)
  return data
}

export async function verifyPayment(orderId: string, input: VerifyPaymentInput) {
  const { data } = await api.post<Order>(`/orders/${orderId}/razorpay-verify`, input)
  return data
}
