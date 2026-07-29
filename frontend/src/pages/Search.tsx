import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import Pagination from '@/components/Pagination'
import FilterSidebar from '@/components/FilterSidebar'
import SortDropdown from '@/components/SortDropdown'
import SearchSuggestions from '@/components/SearchSuggestions'
import { useProducts } from '@/hooks/useProducts'
import { useCategories } from '@/hooks/useCategories'
import {
  useWishlistIds,
  useAddToWishlist,
  useRemoveFromWishlist,
} from '@/hooks/useWishlist'
import { useAuthStore } from '@/store/authStore'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const search = searchParams.get('q') || ''
  const categoryId = searchParams.get('category_id') || undefined
  const sortBy = searchParams.get('sort_by') || 'newest'
  const page = parseInt(searchParams.get('page') || '1', 10)
  const minPrice = searchParams.get('min_price') || ''
  const maxPrice = searchParams.get('max_price') || ''
  const minRating = searchParams.get('min_rating')
    ? parseInt(searchParams.get('min_rating')!, 10)
    : undefined

  const [inputValue, setInputValue] = useState(search)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { data, isLoading } = useProducts({
    page,
    limit: 12,
    category_id: categoryId,
    search: search || undefined,
    min_price: minPrice ? parseFloat(minPrice) : undefined,
    max_price: maxPrice ? parseFloat(maxPrice) : undefined,
    min_rating: minRating,
    sort_by: sortBy,
  })

  const { data: categories } = useCategories()
  const { data: wishlistIds } = useWishlistIds()
  const addWishlist = useAddToWishlist()
  const removeWishlist = useRemoveFromWishlist()

  useEffect(() => {
    setInputValue(search)
  }, [search])

  const updateParams = (updates: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== '') {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    if (updates.page === undefined || updates.page === '1') {
      newParams.set('page', '1')
    }
    setSearchParams(newParams)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParams({ q: inputValue || undefined })
    setShowSuggestions(false)
  }

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) return
    if (wishlistIds?.includes(productId)) {
      removeWishlist.mutate(productId)
    } else {
      addWishlist.mutate(productId)
    }
  }

  const clearFilters = () => {
    setSearchParams({ q: search })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-8 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  setShowSuggestions(true)
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search products..."
                className="w-full rounded-2xl border border-zinc-200 bg-white/80 px-5 py-3.5 pl-12 text-sm shadow-lg backdrop-blur-xl placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-800 dark:bg-zinc-950/80 dark:placeholder:text-zinc-600"
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
            <SearchSuggestions
              query={inputValue}
              show={showSuggestions}
              onSelect={(s) => {
                setInputValue(s)
                updateParams({ q: s })
                setShowSuggestions(false)
              }}
              onClose={() => setShowSuggestions(false)}
            />
          </form>
        </motion.div>

        <div className="flex flex-col gap-6 lg:flex-row">
          <FilterSidebar
            categories={categories || []}
            selectedCategory={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
            minRating={minRating}
            onCategoryChange={(id) => updateParams({ category_id: id })}
            onMinPriceChange={(v) =>
              updateParams({ min_price: v || undefined })
            }
            onMaxPriceChange={(v) =>
              updateParams({ max_price: v || undefined })
            }
            onMinRatingChange={(v) =>
              updateParams({ min_rating: v?.toString() || undefined })
            }
            onClear={clearFilters}
          />

          <div className="flex-1">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {data?.total || 0} product{(data?.total || 0) !== 1 ? 's' : ''}{' '}
                found
                {search && <span> for &quot;{search}&quot;</span>}
              </p>
              <SortDropdown
                value={sortBy}
                onChange={(v) => updateParams({ sort_by: v })}
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
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
            ) : data?.data?.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {data.data.map((product, i) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={i}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={wishlistIds?.includes(product.id)}
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
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
                  No products found
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  Try adjusting your filters or search term
                </p>
              </div>
            )}

            {data && data.total_pages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={data.page}
                  totalPages={data.total_pages}
                  onPageChange={(p) => updateParams({ page: p.toString() })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
