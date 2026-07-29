import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProduct } from '@/hooks/useProducts'
import { useReviews, useCreateReview } from '@/hooks/useReviews'
import {
  useWishlistIds,
  useAddToWishlist,
  useRemoveFromWishlist,
} from '@/hooks/useWishlist'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import RatingStars from '@/components/RatingStars'
import ReviewCard from '@/components/ReviewCard'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: res, isLoading } = useProduct(id!)
  const product = res?.data
  const { data: reviewsData } = useReviews(id!, 1)
  const reviews = reviewsData?.data || []
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const { data: wishlistIds } = useWishlistIds()
  const addWishlist = useAddToWishlist()
  const removeWishlist = useRemoveFromWishlist()
  const addToCart = useCartStore((s) => s.addItem)
  const createReview = useCreateReview()

  const [selectedImage, setSelectedImage] = useState(0)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewComment, setReviewComment] = useState('')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse grid gap-8 lg:grid-cols-2">
            <div className="aspect-square rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
            <div className="space-y-4">
              <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-8 w-3/4 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-24 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-500">Product not found</p>
      </div>
    )
  }

  const isInWishlist = wishlistIds?.includes(product.id)
  const alreadyReviewed = reviews.some((r) => r.user_id === user?.id)

  const handleAddToCart = () => {
    addToCart(product, 1)
  }

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (isInWishlist) removeWishlist.mutate(product.id)
    else addWishlist.mutate(product.id)
  }

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    createReview.mutate(
      {
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      },
      {
        onSuccess: () => {
          setReviewTitle('')
          setReviewComment('')
          setReviewRating(5)
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-6xl">
        <Link
          to={-1 as any}
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <div>
            <div className="aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                      i === selectedImage
                        ? 'border-blue-500'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {product.category_name || 'General'}
            </p>
            <h1 className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <RatingStars rating={product.rating} />
              <span className="text-sm text-zinc-500">
                {product.rating?.toFixed(1)} ({product.review_count || 0}{' '}
                reviews)
              </span>
            </div>

            <p className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              ${product.price?.toFixed(2)}
              <span className="ml-2 text-sm font-normal text-zinc-400">
                {product.currency}
              </span>
            </p>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>

            {product.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2 text-sm">
              <span
                className={
                  product.stock > 0 ? 'text-emerald-600' : 'text-red-500'
                }
              >
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : 'Out of Stock'}
              </span>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97] disabled:opacity-50"
              >
                Add to Cart
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`flex items-center gap-2 rounded-xl border px-5 py-3 font-medium transition-all active:scale-[0.97] ${
                  isInWishlist
                    ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/50'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={isInWishlist ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {isInWishlist ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Reviews ({product.review_count || 0})
          </h2>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {reviews.length > 0 ? (
                reviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))
              ) : (
                <p className="text-sm text-zinc-400">
                  No reviews yet. Be the first to review!
                </p>
              )}
            </div>

            <div>
              {isAuthenticated && !alreadyReviewed ? (
                <form
                  onSubmit={handleSubmitReview}
                  className="rounded-2xl border border-zinc-200/50 bg-white/80 p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-950/80"
                >
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Write a Review
                  </h3>
                  <div className="mt-3">
                    <RatingStars
                      rating={reviewRating}
                      size="md"
                      interactive
                      onChange={setReviewRating}
                    />
                  </div>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="Review title (optional)"
                    className="mt-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Write your review..."
                    rows={3}
                    className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
                  />
                  <button
                    type="submit"
                    disabled={createReview.isPending}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.97] disabled:opacity-50"
                  >
                    {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                  </button>
                  {createReview.isError && (
                    <p className="mt-2 text-xs text-red-500">
                      Failed to submit review
                    </p>
                  )}
                  {createReview.isSuccess && (
                    <p className="mt-2 text-xs text-emerald-500">
                      Review submitted!
                    </p>
                  )}
                </form>
              ) : !isAuthenticated ? (
                <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-5 text-center dark:border-zinc-800/50 dark:bg-zinc-950/80">
                  <p className="text-sm text-zinc-500">
                    Sign in to leave a review
                  </p>
                  <Link
                    to="/login"
                    className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Sign In
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
