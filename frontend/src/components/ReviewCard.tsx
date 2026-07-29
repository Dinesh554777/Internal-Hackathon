import { useAuthStore } from '@/store/authStore'
import { useDeleteReview } from '@/hooks/useReviews'
import RatingStars from '@/components/RatingStars'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const user = useAuthStore((s) => s.user)
  const deleteMutation = useDeleteReview()
  const isOwner = user?.id === review.user_id

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white">
            {review.user_name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {review.user_name || 'Anonymous'}
            </p>
            <p className="text-xs text-zinc-400">
              {new Date(review.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
        {isOwner && (
          <button
            onClick={() => deleteMutation.mutate(review.id)}
            className="text-xs text-red-400 hover:text-red-500 transition-colors"
            aria-label="Delete review"
          >
            Delete
          </button>
        )}
      </div>

      <div className="mt-2">
        <RatingStars rating={review.rating} />
      </div>

      {review.title && (
        <p className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          {review.title}
        </p>
      )}

      {review.comment && (
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          {review.comment}
        </p>
      )}
    </div>
  )
}
