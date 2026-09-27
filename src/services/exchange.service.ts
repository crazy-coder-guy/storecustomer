import { api } from './api'
import type { ExchangeEligibleItem, ExchangeReason, ExchangeRequest } from '../types'

export async function listEligibleExchangeItems() {
  const { data } = await api.get<ExchangeEligibleItem[]>('/exchanges/eligible')
  return data
}

export async function listMyExchangeRequests() {
  const { data } = await api.get<ExchangeRequest[]>('/exchanges/mine')
  return data
}

export interface SubmitExchangeRequestInput {
  orderItemId: string
  reason: ExchangeReason
  description: string
  images: File[]
}

export async function submitExchangeRequest(input: SubmitExchangeRequestInput) {
  const form = new FormData()
  form.append('orderItemId', input.orderItemId)
  form.append('reason', input.reason)
  form.append('description', input.description)
  for (const image of input.images) form.append('images', image)

  const { data } = await api.post<ExchangeRequest>('/exchanges', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function cancelExchangeRequest(id: string) {
  await api.delete(`/exchanges/${id}`)
}
