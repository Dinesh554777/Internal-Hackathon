import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import {
  useWishlistIds,
  useAddToWishlist,
  useRemoveFromWishlist,
} from '@/hooks/useWishlist'
import { useAuthStore } from '@/store/authStore'

export default function Home() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: featured, isLoading } = useProducts({
    limit: 8,
    sort_by: 'rating',
  })
  const { data: categories } = useCategories()
  const { data: wishlistIds } = useWishlistIds()
  const addWishlist = useAddToWishlist()
  const removeWishlist = useRemoveFromWishlist()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (wishlistIds?.includes(productId)) {
      removeWishlist.mutate(productId)
    } else {
      addWishlist.mutate(productId)
    }
  }

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 pb-20 pt-16 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-500/30 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-2xl text-center"
          >
            <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-200/50 bg-white/50 px-4 py-1.5 text-xs font-medium text-zinc-600 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-400">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              InclusiveCart AI — Accessible Shopping
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-6xl">
              Discover Products{' '}
              <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Made for You
              </span>
            </h1>
            <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
              Shop with confidence. Every product is curated for accessibility
              and quality.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-5 py-4 pl-12 text-sm shadow-lg backdrop-blur-xl placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950/80 dark:placeholder:text-zinc-600"
                  aria-label="Search products"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 -mt-8 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
          >
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/categories/${cat.slug}`)}
                className="group rounded-2xl border border-zinc-200/50 bg-white/80 p-4 text-center shadow-sm backdrop-blur-xl transition-all hover:shadow-md hover:-translate-y-0.5 dark:border-zinc-800/50 dark:bg-zinc-950/80"
              >
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {cat.product_count} items
                </p>
              </button>
            ))}
            {categories.length > 6 && (
              <button
                onClick={() => navigate('/categories')}
                className="group rounded-2xl border border-dashed border-zinc-200 bg-white/50 p-4 text-center transition-all hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900/50"
              >
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 group-hover:text-blue-600">
                  +{categories.length - 6} more
                </p>
              </button>
            )}
          </motion.div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Featured Products
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Top-rated items selected for you
            </p>
          </div>
          <button
            onClick={() => navigate('/search')}
            className="hidden sm:flex items-center gap-1 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
          >
            View All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

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
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured?.data?.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                index={i}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={wishlistIds?.includes(product.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
