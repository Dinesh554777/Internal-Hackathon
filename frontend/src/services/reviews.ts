import api from './api'
import type { Review } from '@/types'

export interface ReviewPayload {
  product_id: string
  rating: number
  title?: string
  comment?: string
}

export const reviewService = {
  async getByProduct(
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    data: Review[]
    total: number
    page: number
    limit: number
    total_pages: number
  }> {
    const { data } = await api.get(`/reviews/product/${productId}`, { params })
    return data
  },

  async create(payload: ReviewPayload): Promise<Review> {
    const { data } = await api.post<{ data: Review }>('/reviews', payload)
    return data.data
  },

  async update(id: string, payload: Partial<ReviewPayload>): Promise<Review> {
    const { data } = await api.put<{ data: Review }>(`/reviews/${id}`, payload)
    return data.data
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/reviews/${id}`)
  },
}
