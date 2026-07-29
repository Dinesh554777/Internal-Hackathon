import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, MapPin, CreditCard, Bell, LogOut } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useAuth } from '@/hooks/useAuth'

export default function Profile() {
  const { user, isAuthenticated } = useAuthStore()
  const { logout } = useAuth()
  const [activeSection, setActiveSection] = useState('personal')

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-500">
            Sign in to view your profile
          </p>
          <Link
            to="/login"
            className="mt-4 inline-block rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const sections = [
    { id: 'personal', label: 'Personal Details', icon: User },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'payment', label: 'Payment Methods', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            My Profile
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage your account settings
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          <div className="space-y-1">
            <div className="mb-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white shadow-lg">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {user.name || 'User'}
              </h2>
              <p className="text-sm text-zinc-500">{user.email}</p>
            </div>
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                <s.icon className="h-4 w-4" />
                {s.label}
              </button>
            ))}
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
          >
            {activeSection === 'personal' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Personal Details
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-500">
                      Full Name
                    </label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">
                      Email
                    </label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">
                      Role
                    </label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                      {user.role || 'customer'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-500">
                      Member Since
                    </label>
                    <p className="mt-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {activeSection === 'addresses' && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Saved Addresses
                </h3>
                <p className="mt-4 text-sm text-zinc-500">
                  No addresses saved yet.
                </p>
              </div>
            )}
            {activeSection === 'payment' && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Payment Methods
                </h3>
                <p className="mt-4 text-sm text-zinc-500">
                  No payment methods added yet.
                </p>
              </div>
            )}
            {activeSection === 'notifications' && (
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Notification Preferences
                </h3>
                <p className="mt-4 text-sm text-zinc-500">
                  Notification settings coming soon.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
