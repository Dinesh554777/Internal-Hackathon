import { Link } from 'react-router-dom'
import { PackageOpen, Heart, ShoppingBag, Search } from 'lucide-react'

interface EmptyStateProps {
  icon?: 'cart' | 'wishlist' | 'orders' | 'search' | 'generic'
  title: string
  description: string
  actionLabel?: string
  actionLink?: string
}

const icons = {
  cart: ShoppingBag,
  wishlist: Heart,
  orders: PackageOpen,
  search: Search,
  generic: PackageOpen,
}

export default function EmptyState({
  icon = 'generic',
  title,
  description,
  actionLabel,
  actionLink,
}: EmptyStateProps) {
  const Icon = icons[icon]

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 p-12 text-center dark:border-zinc-700">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-8 w-8 text-zinc-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-zinc-500">{description}</p>
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.97]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
