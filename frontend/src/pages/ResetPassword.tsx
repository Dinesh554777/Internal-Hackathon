import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '@/lib/auth-schema'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/ModeToggle'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const {
    resetPassword,
    isResetPasswordPending,
    resetPasswordSuccess,
    resetPasswordError,
  } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!token) return
    resetPassword({ token, password: data.password })
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="mb-2 text-2xl font-bold">Invalid reset link</h1>
          <Link
            to="/forgot-password"
            className="text-zinc-500 underline underline-offset-4"
          >
            Request a new one
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 blur-3xl dark:from-sky-500/10 dark:to-blue-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-3xl dark:from-indigo-500/10 dark:to-violet-500/10" />
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
              Reset password
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 dark:text-zinc-400"
            >
              Enter your new password
            </motion.p>
          </div>

          {resetPasswordSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4 text-center"
            >
              <div className="rounded-lg bg-emerald-50 p-4 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                <p className="font-medium">Password reset successful</p>
                <p className="mt-1 text-sm">
                  You can now sign in with your new password
                </p>
              </div>
              <Link
                to="/login"
                className="inline-block rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign in
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
                id="password"
                label="New password"
                type="password"
                placeholder="Enter your new password"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                id="confirmPassword"
                label="Confirm new password"
                type="password"
                placeholder="Confirm your new password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {resetPasswordError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
                >
                  {resetPasswordError.message}
                </motion.p>
              )}

              <Button
                type="submit"
                loading={isResetPasswordPending}
                className="w-full"
                size="lg"
              >
                Reset password
              </Button>
            </motion.form>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
          >
            <Link
              to="/login"
              className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
            >
              Back to login
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  )
}
