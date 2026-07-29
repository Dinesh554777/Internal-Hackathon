import { useState } from 'react'
import type { Category } from '@/types'

interface FilterSidebarProps {
  categories: Category[]
  selectedCategory: string | undefined
  minPrice: string
  maxPrice: string
  minRating: number | undefined
  onCategoryChange: (id: string | undefined) => void
  onMinPriceChange: (v: string) => void
  onMaxPriceChange: (v: string) => void
  onMinRatingChange: (v: number | undefined) => void
  onClear: () => void
}

export default function FilterSidebar({
  categories,
  selectedCategory,
  minPrice,
  maxPrice,
  minRating,
  onCategoryChange,
  onMinPriceChange,
  onMaxPriceChange,
  onMinRatingChange,
  onClear,
}: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const hasFilters = selectedCategory || minPrice || maxPrice || minRating

  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Filters
        </h3>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          >
            Clear all
          </button>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Category
        </h4>
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(undefined)}
            className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
              !selectedCategory
                ? 'bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-500/10 font-medium text-blue-600 dark:text-blue-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {cat.name}
              <span className="ml-1.5 text-xs text-zinc-400">
                ({cat.product_count})
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Price Range
        </h4>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            min={0}
          />
          <span className="text-zinc-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            min={0}
          />
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Minimum Rating
        </h4>
        <div className="flex gap-1">
          {[4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() =>
                onMinRatingChange(minRating === star ? undefined : star)
              }
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors ${
                minRating === star
                  ? 'bg-amber-500 text-white'
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
              }`}
            >
              {star}
            </button>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium lg:hidden dark:border-zinc-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
        Filters
        {hasFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
            !
          </span>
        )}
      </button>

      <div className="hidden lg:block w-64 flex-shrink-0 rounded-2xl border border-zinc-200/50 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
        {content}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-zinc-300" />
            {content}
          </div>
        </div>
      )}
    </>
  )
}
