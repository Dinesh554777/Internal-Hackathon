import api from './api'
import type { Product } from '@/types'

export const wishlistService = {
  async getAll(): Promise<Product[]> {
    const { data } = await api.get<{ data: Product[] }>('/wishlist')
    return data.data
  },

  async getIds(): Promise<string[]> {
    const { data } = await api.get<{ data: string[] }>('/wishlist/ids')
    return data.data
  },

  async add(productId: string): Promise<void> {
    await api.post('/wishlist', { product_id: productId })
  },

  async remove(productId: string): Promise<void> {
    await api.delete(`/wishlist/${productId}`)
  },

  async check(productId: string): Promise<boolean> {
    const { data } = await api.get<{ data: { in_wishlist: boolean } }>(
      `/wishlist/check/${productId}`
    )
    return data.data.in_wishlist
  },
}
