import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/ModeToggle'
import type { DisabilityCategory } from '@/types/accessibility'

const step1Schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

const step2Schema = z.object({
  email: z.string().email('Invalid email address'),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>

type AuthMethod = 'google' | 'magic_link' | 'passkey' | null

const disabilities: {
  value: DisabilityCategory
  label: string
  icon: string
}[] = [
  { value: 'blind', label: 'Blind', icon: '🦯' },
  { value: 'low_vision', label: 'Low Vision', icon: '👓' },
  { value: 'motor_disability', label: 'Motor Disability', icon: '♿' },
  { value: 'speech_disability', label: 'Speech Disability', icon: '🗣️' },
  { value: 'color_blind', label: 'Color Blind', icon: '🎨' },
  { value: 'hearing_impairment', label: 'Hearing Impairment', icon: '🦻' },
  { value: 'cognitive_disability', label: 'Cognitive Disability', icon: '🧠' },
  { value: 'senior_citizen', label: 'Senior Citizen', icon: '👴' },
  { value: 'standard', label: 'Standard', icon: '✅' },
]

export default function CreateAccount() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null)
  const [disability, setDisability] = useState<DisabilityCategory>('standard')
  const { isRegisterPending, registerError } = useAuth()

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  })

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })

  const handleStep1 = (data: Step1Data) => {
    setName(data.name)
    setStep(2)
  }

  const handleStep2 = (data: Step2Data) => {
    setEmail(data.email)
    setStep(3)
  }

  const handleAuthSelect = (method: AuthMethod) => {
    setAuthMethod(method)
    setStep(4)
  }

  const handleComplete = async () => {
    if (authMethod === 'magic_link') {
      navigate('/auth/magic-link', { state: { email } })
      return
    }
    if (authMethod === 'google') {
      navigate('/auth/google')
      return
    }
    navigate('/login', { state: { email, name, disability } })
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 blur-3xl dark:from-emerald-500/10 dark:to-teal-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 blur-3xl dark:from-violet-500/10 dark:to-purple-500/10" />
      </div>

      <motion.div className="relative w-full max-w-lg">
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                  s <= step
                    ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                    : 'bg-zinc-200 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500'
                }`}
                aria-label={`Step ${s}`}
              >
                {s}
              </div>
              {s < 4 && (
                <div
                  className={`h-0.5 w-8 transition-colors ${
                    s < step
                      ? 'bg-zinc-900 dark:bg-zinc-50'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <h2 className="mb-2 text-2xl font-bold">
                What&apos;s your name?
              </h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Step 1 of 4
              </p>
              <form
                onSubmit={step1Form.handleSubmit(handleStep1)}
                className="space-y-4"
              >
                <Input
                  id="reg-name"
                  label="Full name"
                  placeholder="John Doe"
                  error={step1Form.formState.errors.name?.message}
                  autoFocus
                  {...step1Form.register('name')}
                />
                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <h2 className="mb-2 text-2xl font-bold">Your email address</h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Step 2 of 4
              </p>
              <form
                onSubmit={step2Form.handleSubmit(handleStep2)}
                className="space-y-4"
              >
                <Input
                  id="reg-email"
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={step2Form.formState.errors.email?.message}
                  autoFocus
                  {...step2Form.register('email')}
                />
                <Button type="submit" className="w-full" size="lg">
                  Continue
                </Button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <h2 className="mb-2 text-2xl font-bold">Choose sign-in method</h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Step 3 of 4
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleAuthSelect('google')}
                  className="flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </button>
                <button
                  onClick={() => handleAuthSelect('magic_link')}
                  className="flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                  Magic Link
                </button>
                <button
                  disabled
                  className="flex cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Passkey (Coming Soon)
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
            >
              <h2 className="mb-2 text-2xl font-bold">Accessibility Profile</h2>
              <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
                Step 4 of 4 — Help us personalize your experience
              </p>

              <div className="mb-6 grid grid-cols-3 gap-2">
                {disabilities.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDisability(d.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-xs transition-all ${
                      disability === d.value
                        ? 'border-zinc-900 bg-zinc-50 dark:border-zinc-50 dark:bg-zinc-800'
                        : 'border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800'
                    }`}
                    aria-pressed={disability === d.value}
                  >
                    <span className="text-lg">{d.icon}</span>
                    <span className="font-medium">{d.label}</span>
                  </button>
                ))}
              </div>

              {registerError && (
                <div
                  role="alert"
                  className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
                >
                  {registerError.message}
                </div>
              )}

              <Button
                onClick={handleComplete}
                loading={isRegisterPending}
                className="w-full"
                size="lg"
              >
                Complete Setup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-900 underline underline-offset-4 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
          >
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  )
}
