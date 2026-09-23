import { api } from './api'
import type { FeaturedProduct, StorefrontSettings } from '../types'

export async function getStorefrontSettings() {
  const { data } = await api.get<StorefrontSettings>('/storefront/settings')
  return data
}

export async function listFeaturedProducts() {
  const { data } = await api.get<FeaturedProduct[]>('/storefront/featured-products')
  return (data || []).map((fp) => ({
    ...fp,
    product: {
      ...fp.product,
      basePrice: Number(fp.product.basePrice),
      mrp: Number(fp.product.mrp),
    },
  }))
}
