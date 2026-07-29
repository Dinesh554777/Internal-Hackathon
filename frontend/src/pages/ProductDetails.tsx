import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProduct } from '@/hooks/useProducts'
import ProductImageDescription from '@/components/ProductImageDescription'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError, error } = useProduct(id!)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-zinc-100 animate-pulse dark:bg-zinc-800" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 rounded-lg bg-zinc-100 animate-pulse dark:bg-zinc-800" />
            <div className="h-6 w-1/4 rounded-lg bg-zinc-100 animate-pulse dark:bg-zinc-800" />
            <div className="h-24 rounded-lg bg-zinc-100 animate-pulse dark:bg-zinc-800" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : 'Product not found'}
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-block text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const product = data as any
  const images = product?.images || []
  const tags = product?.tags || []

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
        <Link
          to="/shop"
          className="hover:text-zinc-700 dark:hover:text-zinc-200"
        >
          Shop
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            {images.length > 0 ? (
              <img
                src={images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-zinc-300 dark:text-zinc-700"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.slice(1, 5).map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  alt={`${product.name} view ${i + 2}`}
                  className="h-20 w-20 flex-shrink-0 cursor-pointer rounded-lg border border-zinc-200 object-cover hover:border-zinc-400 dark:border-zinc-800 dark:hover:border-zinc-600"
                />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div>
            {product.category && (
              <span className="mb-2 inline-block rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                {product.category}
              </span>
            )}
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {product.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              ₹{product.price?.toLocaleString('en-IN')}
            </span>
            {product.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <div
                  className="flex"
                  aria-label={`Rating: ${product.rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={
                        star <= Math.round(product.rating)
                          ? 'currentColor'
                          : 'none'
                      }
                      stroke="currentColor"
                      strokeWidth="2"
                      className={
                        star <= Math.round(product.rating)
                          ? 'text-amber-400'
                          : 'text-zinc-300 dark:text-zinc-600'
                      }
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ({product.rating})
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-medium ${
                product.stock > 0
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : 'Out of Stock'}
            </span>
          </div>

          {product.description && (
            <div>
              <h2 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Description
              </h2>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
            </div>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button className="flex-1 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              Add to Cart
            </button>
            <button className="flex items-center justify-center rounded-xl border border-zinc-200 px-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-zinc-500"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>

          <ProductImageDescription productId={id!} productName={product.name} />
        </motion.div>
      </div>
    </div>
  )
}
