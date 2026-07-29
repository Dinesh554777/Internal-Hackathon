import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Timer, Zap } from 'lucide-react'
import { useFlashSales } from '@/hooks/useProducts'

export default function FlashSale() {
  const { data: flashSales = [], isLoading } = useFlashSales()

  if (isLoading || flashSales.length === 0) return null

  return (
    <section className="rounded-2xl bg-gradient-to-r from-orange-600 via-red-500 to-pink-500 p-0.5">
      <div className="rounded-[calc(1rem-1px)] bg-white p-6 dark:bg-zinc-950">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/50">
              <Zap className="h-4 w-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Flash Sale
              </h2>
              <p className="text-xs text-zinc-500">
                Limited time offers ending soon
              </p>
            </div>
          </div>
          <Link
            to="/shop?sort=discount"
            className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
          >
            View All
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {flashSales.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/products/${product.id}`}
                className="group block rounded-xl border border-zinc-200/50 bg-zinc-50/50 p-3 transition-all hover:shadow-md hover:-translate-y-1 dark:border-zinc-800/50 dark:bg-zinc-900/50"
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
                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
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
                <div className="mt-1.5 flex items-center gap-1 text-[10px] text-red-500">
                  <Timer className="h-3 w-3" />
                  <span>Ending soon</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
