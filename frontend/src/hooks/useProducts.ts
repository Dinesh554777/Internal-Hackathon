import { useQuery } from '@tanstack/react-query'
import { productService, type ProductQueryParams } from '@/services/products'

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
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
  return useQuery({
    queryKey: ['product-suggestions', query],
    queryFn: () => productService.getSuggestions(query),
    enabled: query.length >= 2,
    staleTime: 30_000,
  })
}
