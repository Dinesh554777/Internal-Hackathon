import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewService, type ReviewPayload } from '@/services/reviews'

export function useReviews(productId: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', productId, page],
    queryFn: () => reviewService.getByProduct(productId, { page }),
    enabled: !!productId,
  })
}

export function useCreateReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: ReviewPayload) => reviewService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['reviews', vars.product_id] })
      qc.invalidateQueries({ queryKey: ['product', vars.product_id] })
    },
  })
}

export function useDeleteReview() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => reviewService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['product'] })
    },
  })
}
