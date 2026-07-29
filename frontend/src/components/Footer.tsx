export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 font-semibold">InclusiveCart AI</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              AI-powered accessible e-commerce for everyone.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>All Products</li>
              <li>Categories</li>
              <li>Deals</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Contact Us</li>
              <li>FAQ</li>
              <li>Accessibility</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-semibold">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} InclusiveCart AI. All rights
          reserved.
        </div>
      </div>
    </footer>
  )
}
