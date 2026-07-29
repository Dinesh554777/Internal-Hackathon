import { useQuery } from '@tanstack/react-query'
import { imageDescriptionService } from '@/services/imageDescription'

export function useImageDescription(productId: string) {
  return useQuery({
    queryKey: ['image-description', productId],
    queryFn: () => imageDescriptionService.getDescription(productId),
    enabled: !!productId,
    staleTime: Infinity,
  })
}
