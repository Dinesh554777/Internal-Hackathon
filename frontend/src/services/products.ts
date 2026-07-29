import api from './api'
import type { Product, ApiResponse, PaginatedResponse } from '@/types'

export const productService = {
  async getAll(params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<PaginatedResponse<Product>> {
    const { data } = await api.get<PaginatedResponse<Product>>('/products', {
      params,
    })
    return data
  },

  async getById(id: string): Promise<Product> {
    const { data } = await api.get<ApiResponse<Product>>(`/products/${id}`)
    return data.data
  },

  async getByCategory(category: string): Promise<Product[]> {
    const { data } = await api.get<ApiResponse<Product[]>>(
      `/products/category/${category}`
    )
    return data.data
  },
}
