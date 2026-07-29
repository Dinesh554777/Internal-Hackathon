import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { categories } from '@/constants/mockData'

const categoryIcons: Record<string, string> = {
  electronics: '💻',
  fashion: '👕',
  mobiles: '📱',
  laptops: '💻',
  shoes: '👟',
  watches: '⌚',
  'home-appliances': '🏠',
  beauty: '💄',
  books: '📚',
  sports: '⚽',
  furniture: '🪑',
  accessories: '👜',
  groceries: '🛒',
  healthcare: '💊',
  toys: '🧸',
}

export default function CategoryShowcase() {
  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Shop by Category
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Browse through our curated categories
          </p>
        </div>
        <Link
          to="/categories"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
        >
          View All
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8">
        {categories.slice(0, 16).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-zinc-200/50 bg-white/60 p-4 text-center shadow-sm backdrop-blur-sm transition-all hover:shadow-md hover:-translate-y-1 dark:border-zinc-800/50 dark:bg-zinc-900/60"
              aria-label={`Shop ${cat.name} category`}
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {categoryIcons[cat.slug] || '🛍️'}
              </span>
              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {cat.name}
              </span>
              <span className="text-[10px] text-zinc-400">
                {cat.product_count} items
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
