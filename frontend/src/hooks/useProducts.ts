import { useQuery } from '@tanstack/react-query'
import { productService, type ProductQueryParams } from '@/services/products'
import type { Product } from '@/types'

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  })
}

export function useBestSellers(limit = 10) {
  return useProducts({ sort_by: 'rating', limit, min_rating: 4.5 })
}

export function useNewArrivals(limit = 10) {
  return useProducts({ sort_by: 'newest', limit })
}

export function useFlashSales(limit = 6) {
  return useQuery({
    queryKey: ['products', 'flash-sales', limit],
    queryFn: async () => {
      const res = await productService.getAll({
        sort_by: 'price_desc',
        limit: 50,
      })
      return res.data
        .filter((p) => (p.discount ?? 0) >= 20)
        .slice(0, limit) as Product[]
    },
  })
}

export function useDeals(limit = 5) {
  return useQuery({
    queryKey: ['products', 'deals', limit],
    queryFn: async () => {
      const res = await productService.getAll({ sort_by: 'rating', limit: 50 })
      return res.data
        .filter((p) => (p.discount ?? 0) > 0)
        .slice(0, limit) as Product[]
    },
  })
}

export function useRelatedProducts(id: string, limit = 6) {
  return useQuery({
    queryKey: ['products', 'related', id],
    queryFn: () => productService.getRelated(id, limit),
    enabled: !!id,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  })
}

export function useProductSuggestions(query: string) {
  return useQuery<string[]>({
    queryKey: ['product-suggestions', query],
    queryFn: () => productService.getSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  })
}
