import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { useWishlist, useRemoveFromWishlist } from '@/hooks/useWishlist'
import { useAuthStore } from '@/store/authStore'

export default function Wishlist() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: products, isLoading } = useWishlist()
  const removeWishlist = useRemoveFromWishlist()

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          className="text-zinc-300 dark:text-zinc-600"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Sign in to view your wishlist
        </p>
        <Link
          to="/login"
          className="mt-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Your Wishlist
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {products?.length || 0} saved item
            {(products?.length || 0) !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800"
              >
                <div className="aspect-square rounded-t-2xl bg-zinc-200 dark:bg-zinc-700" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-700" />
                  <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                </div>
              </div>
            ))}
          </div>
        ) : products?.length ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onToggleWishlist={(id) => removeWishlist.mutate(id)}
                isInWishlist
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-zinc-300 dark:text-zinc-600"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Your wishlist is empty
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Save items you love by tapping the heart icon
            </p>
            <Link
              to="/search"
              className="mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
