import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import ProductGrid from '@/components/ProductGrid'
import Ratings from '@/components/Ratings'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'popular', label: 'Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
]

const sortParamToApi: Record<string, string> = {
  newest: 'newest',
  popular: 'rating',
  'price-low': 'price_asc',
  'price-high': 'price_desc',
  rating: 'rating',
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const { addItem, isInWishlist, removeItem } = useWishlistStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const categoryParam = searchParams.get('category') || ''
  const sortParam = searchParams.get('sort') || 'popular'
  const searchQuery = searchParams.get('q') || ''
  const minPrice = Number(searchParams.get('minPrice')) || 0
  const maxPrice = Number(searchParams.get('maxPrice')) || 0
  const minRating = Number(searchParams.get('minRating')) || 0

  const { data: categoriesData = [] } = useCategories()

  const apiParams = useMemo(
    () => ({
      sort_by: sortParamToApi[sortParam] || 'newest',
      search: searchQuery || undefined,
      category_id: categoryParam || undefined,
      min_price: minPrice > 0 ? minPrice : undefined,
      max_price: maxPrice > 0 ? maxPrice : undefined,
      min_rating: minRating > 0 ? minRating : undefined,
      limit: 50,
    }),
    [sortParam, searchQuery, categoryParam, minPrice, maxPrice, minRating]
  )

  const { data: productsData, isLoading } = useProducts(apiParams)

  const products = productsData?.data ?? []
  const brands = useMemo(
    () => [
      ...new Set(products.map((p) => p.brand).filter((b): b is string => !!b)),
    ],
    [products]
  )

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) params.set(key, value)
    else params.delete(key)
    setSearchParams(params)
  }

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) return
    if (isInWishlist(productId)) removeItem(productId)
    else {
      const p = products.find((p) => p.id === productId)
      if (p) addItem(p)
    }
  }

  const wishlistIds = products
    .filter((p) => isInWishlist(p.id))
    .map((p) => p.id)

  const FiltersPanel = () => (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Category
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
              !categoryParam
                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            All Categories
          </button>
          {categoriesData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateParam('category', cat.slug)}
              className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                categoryParam === cat.slug
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Price Range
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice || ''}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Minimum price"
          />
          <span className="text-xs text-zinc-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice || ''}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900"
            aria-label="Maximum price"
          />
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Minimum Rating
        </h3>
        <div className="space-y-1.5">
          {[4, 3, 2, 1].map((r) => (
            <button
              key={r}
              onClick={() =>
                updateParam('minRating', minRating === r ? '0' : String(r))
              }
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors ${
                minRating === r
                  ? 'bg-blue-50 dark:bg-blue-900/30'
                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'
              }`}
            >
              <Ratings rating={r} />
              <span className="text-xs text-zinc-500">& up</span>
            </button>
          ))}
        </div>
      </div>

      {brands.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Brand
          </h3>
          <div className="max-h-48 space-y-1 overflow-y-auto">
            {brands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={
                    searchParams
                      .get('q')
                      ?.toLowerCase()
                      .includes(brand.toLowerCase()) || false
                  }
                  onChange={() => updateParam('q', brand)}
                  className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {brand}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {categoryParam
                ? `${categoriesData.find((c) => c.slug === categoryParam)?.name || 'Products'}`
                : 'All Products'}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {productsData?.total || 0} products
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 lg:hidden"
              aria-label="Toggle filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <select
              value={sortParam}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden w-56 flex-shrink-0 lg:block">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-zinc-200/50 bg-white/60 p-5 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60">
              <FiltersPanel />
            </div>
          </aside>

          {mobileFiltersOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => setMobileFiltersOpen(false)}
              />
              <div className="absolute right-0 top-0 h-full w-72 overflow-y-auto bg-white p-6 shadow-xl dark:bg-zinc-950">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
                    Filters
                  </h2>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="p-1 text-zinc-400 hover:text-zinc-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <FiltersPanel />
              </div>
            </div>
          )}

          <div className="flex-1">
            <motion.div layout>
              <ProductGrid
                products={products}
                isLoading={isLoading}
                wishlistIds={wishlistIds}
                onToggleWishlist={handleToggleWishlist}
                emptyMessage={
                  searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'No products found'
                }
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
