import api from './api'
import type { Product } from '@/types'

export interface ProductQueryParams {
  page?: number
  limit?: number
  category_id?: string
  search?: string
  min_price?: number
  max_price?: number
  min_rating?: number
  sort_by?: string
}

export interface PaginatedProducts {
  data: Product[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export const productService = {
  async getAll(params?: ProductQueryParams): Promise<PaginatedProducts> {
    const { data } = await api.get<PaginatedProducts>('/products', { params })
    return data
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<{ data: Product }>(`/products/${id}`)
    return data.data
  },

  async getSuggestions(q: string): Promise<string[]> {
    const { data } = await api.get<{ data: string[] }>(
      '/products/suggestions',
      { params: { q } }
    )
    return data.data
  },

  async getRelated(id: string, limit = 6): Promise<Product[]> {
    const product = await this.getById(id)
    const res = await this.getAll({
      category_id: product.category_id,
      limit: 50,
    })
    return res.data.filter((p) => p.id !== id).slice(0, limit)
  },
}
