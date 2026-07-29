import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ModeToggle } from '@/components/ModeToggle'

export default function Welcome() {
  const navigate = useNavigate()

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-zinc-100 px-4 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl dark:from-violet-500/10 dark:to-fuchsia-500/10" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-amber-500/20 to-rose-500/20 blur-3xl dark:from-amber-500/10 dark:to-rose-500/10" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center"
      >
        <motion.div
          variants={itemVariants}
          className="mb-6 rounded-full border border-zinc-200/50 bg-white/50 px-4 py-1.5 text-xs text-zinc-500 backdrop-blur-sm dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:text-zinc-400"
        >
          AI-Powered Accessible E-Commerce
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="mb-4 text-5xl font-bold tracking-tight md:text-7xl"
        >
          <span className="bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 bg-clip-text text-transparent dark:from-zinc-100 dark:via-zinc-300 dark:to-zinc-500">
            InclusiveCart
          </span>{' '}
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-500 bg-clip-text text-transparent dark:from-violet-400 dark:to-fuchsia-300">
            AI
          </span>
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mb-12 max-w-md text-lg text-zinc-500 dark:text-zinc-400"
        >
          Accessible Shopping For Everyone
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex w-full max-w-sm flex-col gap-3"
        >
          <button
            onClick={() => navigate('/login')}
            className="group relative overflow-hidden rounded-xl bg-zinc-900 px-8 py-4 text-base font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            <span className="relative z-10">Sign In</span>
          </button>

          <button
            onClick={() => navigate('/register')}
            className="group relative overflow-hidden rounded-xl border border-zinc-200 bg-white/80 px-8 py-4 text-base font-medium text-zinc-900 backdrop-blur-sm transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <span className="relative z-10">Create Account</span>
          </button>

          <button
            onClick={() => navigate('/shop')}
            className="rounded-xl px-8 py-3 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Continue as Guest
          </button>
        </motion.div>

        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/accessibility-info')}
          className="mt-8 rounded-full border border-zinc-200/50 bg-white/30 px-5 py-2 text-xs text-zinc-500 backdrop-blur-sm transition-colors hover:bg-white/50 dark:border-zinc-800/50 dark:bg-zinc-900/30 dark:text-zinc-400 dark:hover:bg-zinc-900/50"
        >
          Accessibility Options
        </motion.button>

        <motion.div
          variants={itemVariants}
          className="mt-16 flex items-center gap-6 text-xs text-zinc-400"
        >
          <span>WCAG 2.2 AA</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span>Voice Enabled</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span>Screen Reader</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
