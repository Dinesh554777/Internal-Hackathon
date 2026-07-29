import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Heart,
  User,
  Package,
  Menu,
  X,
  LogOut,
  Accessibility,
} from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'
import { ModeToggle } from '@/components/ModeToggle'
import VoiceSearchBar from '@/components/VoiceSearchBar'

export default function Header() {
  const navigate = useNavigate()
  const itemCount = useCartStore((s) => s.getItemCount())
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
    { to: '/shop?sort=discount', label: 'Deals' },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/90 backdrop-blur-2xl dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold shrink-0"
          >
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              InclusiveCart
            </span>
            <span className="text-zinc-400">AI</span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:block flex-1 max-w-md">
            <VoiceSearchBar
              onSearch={(query) =>
                navigate(`/shop?q=${encodeURIComponent(query)}`)
              }
              placeholder="Search products..."
            />
          </div>

          <div className="flex items-center gap-1">
            <Link
              to="/accessibility"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Accessibility settings"
            >
              <Accessibility className="h-4 w-4" />
            </Link>

            <ModeToggle />

            <Link
              to="/wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </Link>

            <Link
              to="/cart"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
              aria-label="Shopping cart"
            >
              <ShoppingCart className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 px-1 text-[9px] font-bold text-white">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {isAuthenticated && user ? (
              <div className="relative group">
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-sm transition-shadow hover:shadow-md"
                  aria-label="Profile menu"
                >
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </button>
                <div className="absolute right-0 top-full mt-1 w-48 origin-top-right scale-95 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                  <div className="rounded-xl border border-zinc-200/50 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/95">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <User className="h-4 w-4" /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <Package className="h-4 w-4" /> Orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                    >
                      <Heart className="h-4 w-4" /> Wishlist
                    </Link>
                    <hr className="my-1 border-zinc-200 dark:border-zinc-800" />
                    <button
                      onClick={logout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign In
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 pb-4 pt-2 dark:border-zinc-800 md:hidden">
            <div className="mb-3">
              <VoiceSearchBar
                onSearch={(query) => {
                  navigate(`/shop?q=${encodeURIComponent(query)}`)
                  setMobileMenuOpen(false)
                }}
                placeholder="Search products..."
              />
            </div>
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  {link.label}
                </Link>
              ))}
              <hr className="my-1 border-zinc-200 dark:border-zinc-800" />
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Profile
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
