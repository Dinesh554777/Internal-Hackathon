import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Product } from '@/types'

const STAR_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

const HEART_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const HEART_FILLED_ICON = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

interface ProductCardProps {
  product: Product
  index?: number
  onToggleWishlist?: (id: string) => void
  isInWishlist?: boolean
}

export default function ProductCard({
  product,
  index = 0,
  onToggleWishlist,
  isInWishlist,
}: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="group relative rounded-2xl border border-zinc-200/50 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 dark:border-zinc-800/50 dark:bg-zinc-900"
    >
      {onToggleWishlist && (
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleWishlist(product.id)
          }}
          className={`absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-sm transition-all ${
            isInWishlist
              ? 'bg-red-500/20 text-red-500'
              : 'bg-white/80 text-zinc-400 opacity-0 group-hover:opacity-100 hover:text-red-400'
          }`}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {isInWishlist ? HEART_FILLED_ICON : HEART_ICON}
        </button>
      )}

      <Link to={`/products/${product.id}`} className="block">
        <div className="aspect-square overflow-hidden rounded-t-2xl bg-zinc-100 dark:bg-zinc-800">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-300 dark:text-zinc-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
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
          {product.stock === 0 && (
            <div className="absolute top-3 left-3 rounded-full bg-red-500/90 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              Out of Stock
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            {product.category_name || 'General'}
          </p>
          <h3 className="mt-1 text-sm font-semibold leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {product.name}
          </h3>

          <div className="mt-2 flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 text-amber-500">
              {STAR_ICON}
            </span>
            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              {product.rating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-zinc-400">
              ({product.review_count || 0})
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              ${product.price?.toFixed(2)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
