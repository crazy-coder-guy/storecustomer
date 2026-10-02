import { api } from './api'
import type { PincodeLookupResult } from '../types'

export async function lookupPincode(pincode: string) {
  const { data } = await api.get<PincodeLookupResult>(`/pincode/${pincode}`)
  return data
}
