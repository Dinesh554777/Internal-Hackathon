import { useState } from 'react'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ModeToggle } from '@/components/ModeToggle'

type Step = 'email' | 'sent'

export default function AuthMagicLink() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [devLink, setDevLink] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsPending(true)
    try {
      const resp = await authService.sendMagicLink(email)
      if (resp.dev_link) setDevLink(resp.dev_link)
      setStep('sent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
          {step === 'email' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h1 className="mb-2 text-2xl font-bold">Magic Sign-In</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Enter your email and we&apos;ll send you a secure sign-in
                  link. No password needed.
                </p>
              </div>

              <Input
                id="magic-email"
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              {error && (
                <div
                  role="alert"
                  className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/50 dark:text-red-400"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                loading={isPending}
                className="w-full"
                size="lg"
              >
                Send Magic Link
              </Button>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-emerald-600 dark:text-emerald-400"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <p className="text-lg font-medium">Magic Link Sent</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Check your email inbox for the secure sign-in link. It expires
                in 10 minutes.
              </p>
              {devLink && (
                <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                  Dev mode:{' '}
                  <a
                    href={devLink.replace('http://localhost:5173', '')}
                    className="underline"
                  >
                    {devLink}
                  </a>
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setStep('email')
                    setDevLink('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Send Again
                </Button>
                <Button
                  onClick={() => (window.location.href = '/login')}
                  variant="outline"
                  className="flex-1"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
