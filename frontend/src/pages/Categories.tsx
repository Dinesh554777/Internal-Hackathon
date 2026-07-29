import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCategories } from '@/hooks/useCategories'

const BG_COLORS = [
  'from-blue-500/20 to-cyan-500/20',
  'from-purple-500/20 to-pink-500/20',
  'from-emerald-500/20 to-teal-500/20',
  'from-orange-500/20 to-rose-500/20',
  'from-indigo-500/20 to-violet-500/20',
  'from-yellow-500/20 to-amber-500/20',
]

export default function Categories() {
  const navigate = useNavigate()
  const { data: categories, isLoading } = useCategories()

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Categories
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Browse products by category
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-zinc-100 p-8 dark:bg-zinc-800"
              >
                <div className="mb-3 h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories?.map((cat, i) => (
              <motion.button
                key={cat.id}
                onClick={() => navigate(`/categories/${cat.slug}`)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border border-zinc-200/50 bg-white/80 p-6 text-left shadow-sm transition-all hover:shadow-xl hover:-translate-y-0.5 dark:border-zinc-800/50 dark:bg-zinc-950/80"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${BG_COLORS[i % BG_COLORS.length]} opacity-0 transition-opacity group-hover:opacity-100`}
                />
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  {cat.description && (
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {cat.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {cat.product_count} items
                    </span>
                    <span className="text-zinc-300 dark:text-zinc-600">→</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
