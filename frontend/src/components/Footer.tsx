import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'

const footerSections = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/shop' },
      { label: 'Categories', to: '/categories' },
      { label: "Today's Deals", to: '/shop?sort=discount' },
      { label: 'Best Sellers', to: '/shop?sort=rating' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Contact Us', to: '#' },
      { label: 'FAQ', to: '#' },
      { label: 'Shipping Info', to: '#' },
      { label: 'Returns & Exchanges', to: '#' },
      { label: 'Accessibility', to: '/accessibility' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Account', to: '/profile' },
      { label: 'Orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '#' },
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Accessibility Statement', to: '/accessibility/dashboard' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-lg font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                InclusiveCart
              </span>
              <span className="text-zinc-400"> AI</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
              AI-powered accessible e-commerce for everyone. Shop with
              confidence with voice assistance, screen reader support, and
              adaptive design.
            </p>
            <div className="mt-4 flex items-center gap-1 text-xs text-zinc-400">
              <Heart className="h-3 w-3 text-red-400" />
              <span>Built with accessibility first</span>
            </div>
          </div>
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-100">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-zinc-200 pt-8 text-center dark:border-zinc-800 sm:flex-row">
          <p className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} InclusiveCart AI. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-zinc-400">
            <span>WCAG 2.2 AA Compliant</span>
            <span>|</span>
            <span>Made with accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
