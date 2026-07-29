import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

type Status = 'verifying' | 'success' | 'error'

export default function AuthMagicVerify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [status, setStatus] = useState<Status>('verifying')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setErrorMsg('No verification token provided.')
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        const resp = await authService.verifyMagicLink(token)
        if (cancelled) return
        login(resp.user, resp.access_token, resp.refresh_token)
        setStatus('success')
        setTimeout(() => navigate('/', { replace: true }), 1500)
      } catch (err: unknown) {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(
          err instanceof Error ? err.message : 'Link expired or invalid'
        )
      }
    })()

    return () => {
      cancelled = true
    }
  }, [searchParams, navigate, login])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
          {status === 'verifying' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 animate-spin items-center justify-center rounded-full border-4 border-zinc-200 border-t-emerald-500 dark:border-zinc-700" />
              <p className="text-lg font-medium">Verifying your link...</p>
              <p className="text-sm text-zinc-500">Please wait a moment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-lg font-medium">Signed In!</p>
              <p className="text-sm text-zinc-500">Redirecting to home...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-red-600 dark:text-red-400"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <p className="text-lg font-medium">Link Invalid</p>
              <p className="text-sm text-zinc-500">{errorMsg}</p>
              <button
                onClick={() => navigate('/auth/magic-link')}
                className="mt-4 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Request New Link
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
