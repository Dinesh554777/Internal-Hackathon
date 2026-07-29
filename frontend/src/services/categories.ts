import api from './api'
import type { Category } from '@/types'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get<{ data: Category[] }>('/categories')
    return data.data
  },

  async getById(id: string): Promise<Category> {
    const { data } = await api.get<{ data: Category }>(`/categories/${id}`)
    return data.data
  },
}
