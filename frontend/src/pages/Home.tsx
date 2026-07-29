import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, TrendingUp, Star, Clock, Truck } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useWishlistStore } from '@/store/wishlistStore'
import VoiceSearchBar from '@/components/VoiceSearchBar'
import HeroBanner from '@/components/HeroBanner'
import CategoryShowcase from '@/components/CategoryShowcase'
import DealsSection from '@/components/DealsSection'
import FlashSale from '@/components/FlashSale'
import ProductGrid from '@/components/ProductGrid'
import NewsletterSection from '@/components/NewsletterSection'
import { useBestSellers, useNewArrivals } from '@/hooks/useProducts'

const features = [
  { icon: Truck, title: 'Free Delivery', desc: 'On orders over $50' },
  { icon: Star, title: 'Premium Quality', desc: 'Curated products' },
  { icon: Clock, title: 'Fast Shipping', desc: '2-3 business days' },
  { icon: TrendingUp, title: 'Best Prices', desc: 'Price match guarantee' },
]

export default function Home() {
  const navigate = useNavigate()
  const { addItem, isInWishlist, removeItem } = useWishlistStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: bestSellersData, isLoading: bestSellersLoading } =
    useBestSellers(10)
  const { data: newArrivalsData, isLoading: newArrivalsLoading } =
    useNewArrivals(10)

  const bestSellers = bestSellersData?.data ?? []
  const newArrivals = newArrivalsData?.data ?? []

  const handleToggleWishlist = (productId: string) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (isInWishlist(productId)) removeItem(productId)
    else {
      const p = [...bestSellers, ...newArrivals].find((p) => p.id === productId)
      if (p) addItem(p)
    }
  }

  const wishlistIds = [...bestSellers, ...newArrivals]
    .filter((p) => isInWishlist(p.id))
    .map((p) => p.id)

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-6 space-y-12">
        <HeroBanner />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200/50 bg-white/60 p-4 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-900/60"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                <f.icon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {f.title}
                </p>
                <p className="text-xs text-zinc-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <VoiceSearchBar
          onSearch={(query) => navigate(`/shop?q=${encodeURIComponent(query)}`)}
          placeholder="Search 50+ products... (try 'Sony', 'Nike', 'laptop')"
          className="shadow-lg"
        />

        <CategoryShowcase />
        <DealsSection />
        <FlashSale />

        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                Best Sellers
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                Top-rated products loved by customers
              </p>
            </div>
            <Link
              to="/shop?sort=rating"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid
            products={bestSellers}
            isLoading={bestSellersLoading}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        </section>

        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                New Arrivals
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                The latest products added to our store
              </p>
            </div>
            <Link
              to="/shop?sort=newest"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ProductGrid
            products={newArrivals}
            isLoading={newArrivalsLoading}
            wishlistIds={wishlistIds}
            onToggleWishlist={handleToggleWishlist}
          />
        </section>

        <NewsletterSection />
      </div>
    </div>
  )
}
