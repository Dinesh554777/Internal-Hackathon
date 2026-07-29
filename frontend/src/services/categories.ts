import api from './api'
import type { Category } from '@/types'
import { categories as mockCategories } from '@/constants/mockData'

export const categoryService = {
  async getAll(): Promise<Category[]> {
    try {
      const { data } = await api.get<{ data: Category[] }>('/categories')
      return data.data
    } catch {
      return mockCategories as Category[]
    }
  },

  async getById(id: string): Promise<Category> {
    try {
      const { data } = await api.get<{ data: Category }>(`/categories/${id}`)
      return data.data
    } catch {
      const found = mockCategories.find((c) => c.id === id)
      if (found) return found as Category
      throw new Error(`Category not found: ${id}`)
    }
  },
}
