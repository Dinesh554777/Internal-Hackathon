import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useOrders } from '@/hooks/useOrders'
import { useAuthStore } from '@/store/authStore'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  confirmed: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  shipped:
    'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  delivered:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
}

export default function Orders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: orders, isLoading } = useOrders()

  if (!isAuthenticated) {
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
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
        <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
          Sign in to view your orders
        </p>
        <Link
          to="/login"
          className="mt-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
        >
          Sign In
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
          className="mb-8 text-center"
        >
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Order History
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            {orders?.length || 0} order{(orders?.length || 0) !== 1 ? 's' : ''}
          </p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl bg-zinc-100 p-6 dark:bg-zinc-800"
              >
                <div className="mb-3 h-5 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
        ) : orders?.length ? (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
                      Order
                    </p>
                    <p className="text-sm font-mono text-zinc-700 dark:text-zinc-300">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[order.status] || ''}`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {order.items?.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-600 dark:text-zinc-400">
                        {item.product?.name || 'Product'} x{item.quantity}
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
                  <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    Total
                  </span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    ${order.total?.toFixed(2)}
                  </span>
                </div>
              </motion.div>
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
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              No orders yet
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Place your first order to see it here
            </p>
            <Link
              to="/shop"
              className="mt-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
