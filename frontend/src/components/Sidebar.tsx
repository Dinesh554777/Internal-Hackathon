import { NavLink } from 'react-router-dom'

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/dashboard/products', label: 'Products', icon: '🛍️' },
  { to: '/dashboard/orders', label: 'Orders', icon: '📦' },
  { to: '/dashboard/customers', label: 'Customers', icon: '👥' },
  { to: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-16 items-center justify-center border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-lg font-bold">Admin Panel</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
