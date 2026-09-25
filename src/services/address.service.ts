import { api } from './api'
import type { Address } from '../types'

export async function listAddresses() {
  const { data } = await api.get<Address[]>('/addresses')
  return data
}

export async function saveAddress(input: { name: string; phone: string; shippingAddress: string }) {
  const { data } = await api.post<Address>('/addresses', input)
  return data
}

export async function deleteAddress(id: string) {
  await api.delete(`/addresses/${id}`)
}
