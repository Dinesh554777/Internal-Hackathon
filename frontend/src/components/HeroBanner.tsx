import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-zinc-900 dark:bg-zinc-950">
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/hero/1200/600')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/95 via-zinc-900/80 to-transparent" />
      <div className="relative z-10 flex flex-col items-start gap-6 px-8 py-16 md:px-16 md:py-24">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-sm"
        >
          <Sparkles className="h-3 w-3" />
          AI-Powered Accessible Shopping
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-lg text-4xl font-bold text-white sm:text-5xl md:text-6xl"
        >
          Discover Products{' '}
          <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
            Made for Everyone
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-md text-base text-zinc-300"
        >
          Shop with confidence. Every product is curated for accessibility and
          quality.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3"
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-900 shadow-lg transition-all hover:bg-zinc-100 active:scale-[0.97]"
          >
            Shop Now
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-[0.97]"
          >
            Browse Categories
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 flex items-center gap-6 text-xs text-zinc-400"
        >
          <span className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Free Delivery
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Secure Checkout
          </span>
          <span className="flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            30-Day Returns
          </span>
        </motion.div>
      </div>
    </div>
  )
}
