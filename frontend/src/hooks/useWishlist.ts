import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wishlistService } from '@/services/wishlist'
import { useAuthStore } from '@/store/authStore'

export function useWishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getAll(),
    enabled: isAuthenticated,
  })
}

export function useWishlistIds() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery({
    queryKey: ['wishlist-ids'],
    queryFn: () => wishlistService.getIds(),
    enabled: isAuthenticated,
    staleTime: 1000 * 30,
  })
}

export function useAddToWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => wishlistService.add(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      qc.invalidateQueries({ queryKey: ['wishlist-ids'] })
    },
  })
}

export function useRemoveFromWishlist() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => wishlistService.remove(productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wishlist'] })
      qc.invalidateQueries({ queryKey: ['wishlist-ids'] })
    },
  })
}
