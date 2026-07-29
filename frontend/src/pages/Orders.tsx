import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'

interface MockOrder {
  id: string
  date: string
  total: number
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled'
  items: number
  productImage: string
  productName: string
}

const mockOrders: MockOrder[] = [
  {
    id: 'ORD-2025-001',
    date: 'Jun 15, 2025',
    total: 348,
    status: 'delivered',
    items: 1,
    productImage: 'https://picsum.photos/seed/headphones1/100/100',
    productName: 'Sony WH-1000XM5',
  },
  {
    id: 'ORD-2025-002',
    date: 'Jun 20, 2025',
    total: 190,
    status: 'shipped',
    items: 2,
    productImage: 'https://picsum.photos/seed/adidas1/100/100',
    productName: 'Adidas Ultraboost Light',
  },
  {
    id: 'ORD-2025-003',
    date: 'Jun 25, 2025',
    total: 449,
    status: 'processing',
    items: 1,
    productImage: 'https://picsum.photos/seed/kitchenaid1/100/100',
    productName: 'KitchenAid Artisan Mixer',
  },
  {
    id: 'ORD-2025-004',
    date: 'Jun 28, 2025',
    total: 85,
    status: 'cancelled',
    items: 1,
    productImage: 'https://picsum.photos/seed/adidas1/100/100',
    productName: 'Adidas Stan Smith',
  },
]

const statusColors = {
  delivered: 'success' as const,
  shipped: 'default' as const,
  processing: 'warning' as const,
  cancelled: 'danger' as const,
}

export default function Orders() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [selectedTab, setSelectedTab] = useState<string>('all')

  const filtered =
    selectedTab === 'all'
      ? mockOrders
      : mockOrders.filter((o) => o.status === selectedTab)
  const tabs = ['all', 'processing', 'shipped', 'delivered', 'cancelled']

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon="orders"
          title="Sign in to view your orders"
          description="Track and manage your orders."
          actionLabel="Sign In"
          actionLink="/login"
        />
      </div>
    )
  }

  if (mockOrders.length === 0) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <EmptyState
          icon="orders"
          title="No orders yet"
          description="Start shopping to see your orders here."
          actionLabel="Start Shopping"
          actionLink="/shop"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Track and manage your orders
          </p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-white text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map((order, i) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl border border-zinc-200/50 bg-white/80 p-4 shadow-sm backdrop-blur-xl transition-all hover:shadow-md dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={order.productImage}
                    alt={order.productName}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        {order.productName}
                      </p>
                      <p className="text-xs text-zinc-500">Order {order.id}</p>
                    </div>
                    <Badge variant={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-zinc-400">
                    <span>{order.date}</span>
                    <span>
                      {order.items} item{order.items > 1 ? 's' : ''}
                    </span>
                    <span className="font-medium text-zinc-700 dark:text-zinc-300">
                      ${order.total.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Link
                  to={`/orders/${order.id}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                  aria-label="View order details"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
