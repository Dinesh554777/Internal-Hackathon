import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { ModeToggle } from '@/components/ModeToggle'

export default function Header() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((count, item) => count + item.quantity, 0)
  )
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link
          to="/"
          className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-400"
        >
          InclusiveCart AI
        </Link>

        <div className="flex items-center gap-4">
          <Link
            to="/products"
            className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="relative text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Cart
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-3 flex h-4 w-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] text-white dark:bg-zinc-50 dark:text-zinc-900">
                {itemCount}
              </span>
            )}
          </Link>

          <ModeToggle />

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {user.name}
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/dashboard"
                  className="rounded-md bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-zinc-50 dark:text-zinc-900"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={logout}
                className="text-sm text-zinc-500 transition-colors hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
