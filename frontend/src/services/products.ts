import api from './api'
import type { Product } from '@/types'
import {
  products as mockProducts,
  getProductById as getMockProductById,
  getRelatedProducts as getMockRelatedProducts,
} from '@/constants/mockData'

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

function applyMockFilters(params?: ProductQueryParams): PaginatedProducts {
  let result = [...mockProducts]

  if (params?.search) {
    const q = params.search.toLowerCase()
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    )
  }

  if (params?.category_id) {
    result = result.filter((p) => p.category_id === params.category_id)
  }

  if (params?.min_price) {
    result = result.filter((p) => p.price >= params.min_price!)
  }

  if (params?.max_price) {
    result = result.filter((p) => p.price <= params.max_price!)
  }

  if (params?.min_rating) {
    result = result.filter((p) => p.rating >= params.min_rating!)
  }

  if (params?.sort_by) {
    switch (params.sort_by) {
      case 'price_asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price_desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'discount':
        result.sort((a, b) => (b.discount || 0) - (a.discount || 0))
        break
    }
  }

  const page = params?.page || 1
  const limit = params?.limit || 20
  const total = result.length
  const total_pages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const data = result.slice(start, start + limit)

  return { data, total, page, limit, total_pages }
}

export const productService = {
  async getAll(params?: ProductQueryParams): Promise<PaginatedProducts> {
    try {
      const { data } = await api.get<PaginatedProducts>('/products', { params })
      return data
    } catch {
      return applyMockFilters(params)
    }
  },

  async getById(id: string): Promise<Product> {
    try {
      const { data } = await api.get<{ data: Product }>(`/products/${id}`)
      return data.data
    } catch {
      const found = getMockProductById(id)
      if (found) return found
      const all = applyMockFilters({ limit: 100 })
      const p = all.data.find((p) => p.id === id || p.slug === id) as Product
      if (p) return p
      throw new Error(`Product not found: ${id}`)
    }
  },

  async getSuggestions(q: string): Promise<string[]> {
    try {
      const { data } = await api.get<{ data: string[] }>(
        '/products/suggestions',
        { params: { q } }
      )
      return data.data
    } catch {
      const lower = q.toLowerCase()
      return mockProducts
        .filter(
          (p) =>
            p.name.toLowerCase().includes(lower) ||
            p.brand.toLowerCase().includes(lower) ||
            p.tags.some((t) => t.toLowerCase().includes(lower))
        )
        .slice(0, 8)
        .map((p) => p.name)
    }
  },

  async getRelated(id: string, limit = 6): Promise<Product[]> {
    try {
      const product = await this.getById(id)
      const res = await this.getAll({
        category_id: product.category_id,
        limit: 50,
      })
      return res.data.filter((p) => p.id !== id).slice(0, limit)
    } catch {
      const relatives = getMockRelatedProducts(id, limit)
      return relatives as Product[]
    }
  },
}
