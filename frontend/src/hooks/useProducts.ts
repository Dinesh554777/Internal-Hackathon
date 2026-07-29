import { useQuery } from '@tanstack/react-query'
import { productService } from '@/services/products'

export function useProducts(params?: {
  page?: number
  limit?: number
  category?: string
  search?: string
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.getAll(params),
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  })
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: () => productService.getByCategory(category),
    enabled: !!category,
  })
}
