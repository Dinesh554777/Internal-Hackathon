import { useQuery } from '@tanstack/react-query'
import { categoryService } from '@/services/categories'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    staleTime: 1000 * 60 * 5,
  })
}
