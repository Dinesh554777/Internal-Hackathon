import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Share2,
  ShoppingCart,
  Shield,
  Truck,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Star,
} from 'lucide-react'
import Ratings from '@/components/Ratings'
import ProductGrid from '@/components/ProductGrid'
import { Badge } from '@/components/ui/badge'
import {
  getProductById,
  getRelatedProducts,
  products,
} from '@/constants/mockData'
import { useCartStore } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useAuthStore } from '@/store/authStore'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const addToCart = useCartStore((s) => s.addItem)
  const {
    addItem: addWishlist,
    removeItem: removeWishlist,
    isInWishlist,
  } = useWishlistStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<
    'description' | 'specs' | 'reviews'
  >('description')
  const [addedToCart, setAddedToCart] = useState(false)

  const product = getProductById(id || '')
  const related = id ? getRelatedProducts(id) : []

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-zinc-500">Product not found</p>
          <Link
            to="/shop"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const discount = product.discount > 0

  const handleAddToCart = () => {
    addToCart(product, quantity)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (inWishlist) removeWishlist(product.id)
    else addWishlist(product)
  }

  const wishlistIds = products
    .filter((p) => isInWishlist(p.id))
    .map((p) => p.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-zinc-500">
            <li>
              <Link
                to="/"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Home
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to="/shop"
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Shop
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link
                to={`/shop?category=${product.category_slug}`}
                className="hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {product.category_name}
              </Link>
            </li>
            <li>/</li>
            <li className="text-zinc-900 dark:text-zinc-100 truncate max-w-[200px]">
              {product.name}
            </li>
          </ol>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 lg:grid-cols-2"
        >
          <div>
            <div className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {product.isNew && (
                <Badge variant="success" className="absolute top-3 left-3">
                  New
                </Badge>
              )}
              {discount && (
                <Badge variant="danger" className="absolute top-3 right-3">
                  -{product.discount}%
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      i === selectedImage
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-medium uppercase tracking-wider text-blue-600 dark:text-blue-400">
              {product.brand}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100 lg:text-3xl">
              {product.name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Ratings rating={product.rating} size="md" />
              <span className="text-sm text-zinc-500">
                {product.rating.toFixed(1)} (
                {product.review_count.toLocaleString()} reviews)
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                ${product.price.toFixed(2)}
              </span>
              {discount && (
                <>
                  <span className="text-lg text-zinc-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                  <Badge variant="danger">
                    Save ${(product.originalPrice - product.price).toFixed(0)}
                  </Badge>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center gap-4 text-sm">
              <span
                className={`flex items-center gap-1 ${product.stock > 0 ? 'text-emerald-600' : 'text-red-500'}`}
              >
                <Check className="h-4 w-4" />
                {product.stock > 0
                  ? `In Stock (${product.stock})`
                  : 'Out of Stock'}
              </span>
              <span className="text-zinc-400">{product.delivery}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              {product.description}
            </p>

            {product.features?.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {product.features.slice(0, 4).map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
            )}

            {product.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/shop?q=${tag}`}
                    className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-700">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-10 w-10 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="flex h-10 w-12 items-center justify-center text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-10 w-10 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || addedToCart}
                className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-all active:scale-[0.97] disabled:opacity-50 ${
                  addedToCart
                    ? 'bg-emerald-500'
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg'
                }`}
              >
                <ShoppingCart className="h-4 w-4" />
                {addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-all ${
                  inWishlist
                    ? 'border-red-200 bg-red-50 text-red-500 dark:border-red-800 dark:bg-red-950/50'
                    : 'border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800'
                }`}
                aria-label={
                  inWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                }
              >
                <Heart
                  className={`h-5 w-5 ${inWishlist ? 'fill-current' : ''}`}
                />
              </button>
              <button
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                aria-label="Share product"
                onClick={() =>
                  navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  })
                }
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 rounded-xl border border-zinc-200/50 bg-white/60 p-4 dark:border-zinc-800/50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Truck className="h-4 w-4 text-blue-500" />
                <span>{product.delivery || 'Free Delivery'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <RotateCcw className="h-4 w-4 text-blue-500" />
                <span>30-Day Returns</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Shield className="h-4 w-4 text-blue-500" />
                <span>1 Year Warranty</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12"
        >
          <div className="flex border-b border-zinc-200 dark:border-zinc-800">
            {(['description', 'specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {tab === 'description'
                  ? 'Description'
                  : tab === 'specs'
                    ? 'Specifications'
                    : `Reviews (${product.review_count})`}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div
                key="desc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {product.description}
                </p>
                {product.features?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Key Features
                    </h4>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {product.features.map((f, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 rounded-lg bg-zinc-50 px-4 py-2 text-sm text-zinc-600 dark:bg-zinc-800/50 dark:text-zinc-400"
                        >
                          <Star className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
            {activeTab === 'specs' && (
              <motion.div
                key="specs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-lg border border-zinc-200/50 bg-white/60 px-4 py-3 dark:border-zinc-800/50 dark:bg-zinc-900/60"
                      >
                        <span className="text-sm text-zinc-500">{key}</span>
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {value}
                        </span>
                      </div>
                    )
                  )}
                </div>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
                      {product.rating.toFixed(1)}
                    </p>
                    <Ratings rating={product.rating} />
                    <p className="mt-1 text-xs text-zinc-500">
                      {product.review_count.toLocaleString()} reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const pct =
                        star === 5
                          ? 60
                          : star === 4
                            ? 25
                            : star === 3
                              ? 10
                              : star === 2
                                ? 3
                                : 2
                      return (
                        <div
                          key={star}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="w-8 text-zinc-500">{star} star</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                            <div
                              className="h-full rounded-full bg-amber-400"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-zinc-400">
                            {pct}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <p className="mt-6 text-center text-sm text-zinc-400">
                  Individual reviews coming soon with backend integration.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Related Products
            </h2>
            <ProductGrid products={related} wishlistIds={wishlistIds} />
          </section>
        )}
      </div>
    </div>
  )
}
