import { motion } from 'framer-motion'
import ProductCard from '@/components/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/skeleton'
import { PackageOpen } from 'lucide-react'
import type { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  isLoading?: boolean
  wishlistIds?: string[]
  onToggleWishlist?: (id: string) => void
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  isLoading,
  wishlistIds,
  onToggleWishlist,
  emptyMessage = 'No products found',
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 dark:border-zinc-700">
        <PackageOpen className="h-12 w-12 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-4 text-sm font-medium text-zinc-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        >
          <ProductCard
            product={product as Product}
            index={i}
            onToggleWishlist={onToggleWishlist}
            isInWishlist={wishlistIds?.includes(product.id)}
          />
        </motion.div>
      ))}
    </div>
  )
}
