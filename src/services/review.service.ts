import { api } from './api'
import type { ReviewableProduct, ReviewsResponse } from '../types'

export async function listProductReviews(productId: string, page = 1, limit = 10) {
  const { data } = await api.get<ReviewsResponse>(`/products/${productId}/reviews`, {
    params: { page, limit },
  })
  return data
}

export async function listReviewableProducts() {
  const { data } = await api.get<ReviewableProduct[]>('/reviews/reviewable')
  return data
}

export interface SubmitReviewInput {
  productId: string
  orderId: string
  rating: number
  comment: string
  images?: File[]
  video?: File | null
}

export async function submitReview(input: SubmitReviewInput) {
  const form = new FormData()
  form.append('orderId', input.orderId)
  form.append('rating', String(input.rating))
  form.append('comment', input.comment)
  for (const image of input.images ?? []) form.append('images', image)
  if (input.video) form.append('video', input.video)

  const { data } = await api.post(`/products/${input.productId}/reviews`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function deleteReview(productId: string, reviewId: string) {
  await api.delete(`/products/${productId}/reviews/${reviewId}`)
}
