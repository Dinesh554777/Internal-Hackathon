import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { authService } from '@/services/auth'
import { useAuthStore } from '@/store/authStore'

type Status = 'exchanging' | 'success' | 'error'

export default function AuthGoogleCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [status, setStatus] = useState<Status>('exchanging')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setStatus('error')
      setErrorMsg('Google sign-in was cancelled or denied.')
      return
    }

    if (!code) {
      setStatus('error')
      setErrorMsg('No authorization code received from Google.')
      return
    }

    let cancelled = false
    const redirectUri = `${window.location.origin}/auth/google/callback`

    ;(async () => {
      try {
        const resp = await authService.googleAuth(code, redirectUri)
        if (cancelled) return
        login(resp.user, resp.access_token, resp.refresh_token)
        setStatus('success')
        setTimeout(() => navigate('/', { replace: true }), 1500)
      } catch (err: unknown) {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(
          err instanceof Error ? err.message : 'Failed to sign in with Google'
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
          {status === 'exchanging' && (
            <div className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-500" />
              </div>
              <p className="text-lg font-medium">Completing sign-in...</p>
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
              <p className="text-lg font-medium">Sign-In Failed</p>
              <p className="text-sm text-zinc-500">{errorMsg}</p>
              <button
                onClick={() => navigate('/login')}
                className="mt-4 rounded-xl bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
