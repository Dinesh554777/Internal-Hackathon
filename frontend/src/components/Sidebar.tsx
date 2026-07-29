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
    <aside className="flex w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center justify-center border-b">
        <span className="text-lg font-bold">Admin Panel</span>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-gray-100'
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
