import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { registerSchema, type RegisterFormData } from '@/lib/auth-schema'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/ModeToggle'

export default function Register() {
  const { register: signUp, isRegisterPending, registerError } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword: _, ...payload } = data
    signUp(payload)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl dark:from-emerald-500/10 dark:to-teal-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 blur-3xl dark:from-violet-500/10 dark:to-purple-500/10" />
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
              Create an account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-zinc-500 dark:text-zinc-400"
            >
              Join InclusiveCart AI today
            </motion.p>
          </div>

          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <Input
              id="name"
              label="Full name"
              type="text"
              placeholder="John Doe"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Create a strong password"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              id="confirmPassword"
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            {registerError && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
              >
                {registerError.message}
              </motion.p>
            )}

            <Button
              type="submit"
              loading={isRegisterPending}
              className="w-full"
              size="lg"
            >
              Create account
            </Button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400"
          >
            Already have an account?{' '}
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
