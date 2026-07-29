import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Trash2, ShoppingCart, ArrowLeft } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import EmptyState from '@/components/EmptyState'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore()
  const addToCart = useCartStore((s) => s.addItem)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon="wishlist"
          title="Sign in to view your wishlist"
          description="Save your favorite items and come back to them later."
          actionLabel="Sign In"
          actionLink="/login"
        />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <EmptyState
          icon="wishlist"
          title="Your wishlist is empty"
          description="Save items you love by clicking the heart icon on any product."
          actionLabel="Browse Products"
          actionLink="/shop"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {items.length} saved items
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="group relative"
            >
              <ProductCard product={product} index={i} />
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 translate-y-2 transition-all group-hover:opacity-100 group-hover:translate-y-0">
                <button
                  onClick={() => {
                    addToCart(product, 1)
                    removeItem(product.id)
                  }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/95 py-2 text-xs font-semibold text-zinc-900 shadow-lg backdrop-blur-sm transition-colors hover:bg-white dark:bg-zinc-900/95 dark:text-zinc-100"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Move to Cart
                </button>
                <button
                  onClick={() => removeItem(product.id)}
                  className="flex items-center justify-center rounded-lg bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm transition-colors hover:bg-red-50 hover:text-red-500 dark:bg-zinc-900/95 dark:hover:bg-red-950/50"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
