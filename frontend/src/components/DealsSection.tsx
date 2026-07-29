import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'
import { useDeals } from '@/hooks/useProducts'

export default function DealsSection() {
  const { data: deals = [], isLoading } = useDeals()

  if (isLoading || deals.length === 0) return null

  return (
    <section className="rounded-2xl bg-gradient-to-br from-red-500/10 via-orange-500/5 to-amber-500/10 p-6 dark:from-red-500/5 dark:via-orange-500/5 dark:to-amber-500/5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-red-500" />
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Today's Deals
          </h2>
        </div>
        <Link
          to="/shop?sort=discount"
          className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {deals.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              to={`/products/${product.id}`}
              className="group block rounded-xl border border-zinc-200/50 bg-white/80 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:-translate-y-1 dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <span className="absolute top-1 left-1 rounded-md bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  -{product.discount}%
                </span>
              </div>
              <p className="text-xs text-zinc-500 line-clamp-1">
                {product.name}
              </p>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  ${product.price}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="text-xs text-zinc-400 line-through">
                      ${product.originalPrice}
                    </span>
                  )}
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400">
                <Clock className="h-3 w-3" />
                <span>Limited time</span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
