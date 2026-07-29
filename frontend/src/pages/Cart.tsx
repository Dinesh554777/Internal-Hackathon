import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCartStore } from '@/store/cartStore'

export default function Cart() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotal,
    getItemCount,
  } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
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
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Your cart is empty
        </p>
        <p className="mt-1 text-sm text-zinc-500">Add items to get started</p>
        <Link
          to="/search"
          className="mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
        >
          Browse Products
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {getItemCount()} item{getItemCount() !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={clearCart}
            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50"
          >
            Clear All
          </button>
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <Link
                to={`/products/${item.product.id}`}
                className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800"
              >
                {item.product.images?.[0] ? (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
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
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.product.id}`}
                  className="text-sm font-medium text-zinc-900 hover:text-blue-600 dark:text-zinc-100 dark:hover:text-blue-400 transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-400">
                  ${item.product.price?.toFixed(2)} each
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(
                        item.productId,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="min-w-[24px] text-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-sm transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="mt-1 text-xs text-red-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
        >
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Total
            </span>
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              ${getTotal().toFixed(2)}
            </span>
          </div>
          <Link
            to="/checkout"
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
          >
            Proceed to Checkout
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
