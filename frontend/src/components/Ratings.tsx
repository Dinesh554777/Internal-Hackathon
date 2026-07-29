import { Star } from 'lucide-react'

interface RatingsProps {
  rating: number
  size?: 'sm' | 'md' | 'lg'
}

export default function Ratings({ rating, size = 'sm' }: RatingsProps) {
  const sizeClass =
    size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating)
              ? 'fill-amber-400 text-amber-400'
              : 'fill-zinc-200 text-zinc-200 dark:fill-zinc-700 dark:text-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}
