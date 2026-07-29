import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '@/lib/auth-schema'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/ModeToggle'

export default function ForgotPassword() {
  const {
    forgotPassword,
    isForgotPasswordPending,
    forgotPasswordSuccess,
    forgotPasswordError,
  } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPassword(data)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-3xl dark:from-amber-500/10 dark:to-orange-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 blur-3xl dark:from-rose-500/10 dark:to-pink-500/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-2 text-3xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent dark:from-zinc-100 dark:to-zinc-400"
            >
              Forgot password?
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 dark:text-zinc-400"
            >
              Enter your email and we&apos;ll send you a reset link
            </motion.p>
          </div>

          {forgotPasswordSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center"
            >
              <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <p className="font-medium">Check your email</p>
                <p className="mt-1 text-sm">
                  We&apos;ve sent you a password reset link
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block text-sm font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
              >
                Back to login
              </Link>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              {forgotPasswordError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
                >
                  {forgotPasswordError.message}
                </motion.p>
              )}

              <Button
                type="submit"
                loading={isForgotPasswordPending}
                className="w-full"
                size="lg"
              >
                Send reset link
              </Button>
            </motion.form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
          >
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
