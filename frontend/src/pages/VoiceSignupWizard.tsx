import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react'
import { useVoice } from '@/context/VoiceContext'
import { authService } from '@/services/auth'

type SignupStep =
  | 'welcome'
  | 'name_input'
  | 'name_confirm'
  | 'email_input'
  | 'email_confirm'
  | 'auth_method'
  | 'password_input'
  | 'registering'
  | 'error'

interface AuthMethods {
  label: string
  value: 'google' | 'magic_link' | 'passkey' | 'password'
  icon: ReactNode
  comingSoon?: boolean
}

const AUTH_METHODS: AuthMethods[] = [
  {
    label: 'Continue with Google',
    value: 'google',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Magic Link (Email)',
    value: 'magic_link',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Passkey (WebAuthn)',
    value: 'passkey',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    comingSoon: true,
  },
  {
    label: 'Email + Password',
    value: 'password',
    icon: (
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
    ),
  },
]

function normalizeEmailTranscript(text: string): string {
  let t = text.trim()

  const fillerPattern =
    /\b(please|the|uh|um|like|i said|it'?s|that'?s|actually|maybe)\b/gi
  t = t.replace(fillerPattern, '')

  t = t.replace(/\s*at\s*/gi, '@')
  t = t.replace(/\s*dot\s*/gi, '.')
  t = t.replace(/\bunderscore\b/gi, '_')
  t = t.replace(/\bdash\b/gi, '-')
  t = t.replace(/\bhyphen\b/gi, '-')
  t = t.replace(/\bplus\b/gi, '+')
  t = t.replace(/\bats\b/gi, '@')
  t = t.replace(/\bat the rate\b/gi, '@')
  t = t.replace(/\bspace\b/gi, '')

  t = t.toLowerCase()

  t = t.replace(/\s+/g, '')

  t = t.replace(/[^a-z0-9@._%+\-]/g, '')

  if (!t.includes('@')) {
    const domainMatch = t.match(
      /([a-z0-9._%+\-]+)((?:gmail|yahoo|hotmail|outlook|proton|icloud|aol|zoho|yandex)\.(?:com|in|co\.uk|org|net|edu))\b/i
    )
    if (domainMatch) {
      const local = domainMatch[1].replace(/at$/, '')
      t = `${local}@${domainMatch[2]}`
    } else {
      const genericMatch = t.match(
        /([a-z0-9._%+\-]+)([a-z0-9.-]+\.(?:com|in|co\.uk|org|net|edu|io|ai))\b/i
      )
      if (genericMatch) {
        const local = genericMatch[1].replace(/at$/, '')
        const atIdx = local.indexOf('at')
        if (atIdx > 0 && atIdx === local.length - 2) {
          t = `${local.slice(0, -2)}@${genericMatch[2]}`
        } else {
          return t
        }
      }
    }
  }

  return t
}

function normalizeNameTranscript(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ')
}

function getStepNumber(step: SignupStep): number {
  switch (step) {
    case 'welcome':
    case 'name_input':
    case 'name_confirm':
      return 1
    case 'email_input':
    case 'email_confirm':
      return 2
    case 'auth_method':
    case 'password_input':
    case 'registering':
    case 'error':
      return 3
    default:
      return 1
  }
}

function ProgressIndicator({ step }: { step: SignupStep }) {
  const current = getStepNumber(step)
  const steps = [
    { num: 1, label: 'Name' },
    { num: 2, label: 'Email' },
    { num: 3, label: 'Security' },
  ]

  return (
    <div className="mb-6 flex items-center justify-center gap-2">
      {steps.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
              current > s.num
                ? 'bg-emerald-500 text-white'
                : current === s.num
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-200 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'
            }`}
          >
            {current > s.num ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              s.num
            )}
          </div>
          <span
            className={`text-xs font-medium ${
              current >= s.num
                ? 'text-zinc-700 dark:text-zinc-300'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            {s.label}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`h-0.5 w-8 rounded-full ${
                current > s.num
                  ? 'bg-emerald-500'
                  : 'bg-zinc-200 dark:bg-zinc-700'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StatusBadge({ label }: { label: string }) {
  if (!label) return null
  const isListening = label === 'Listening...'
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium ${
        isListening
          ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          isListening
            ? 'animate-pulse bg-green-500'
            : 'animate-pulse bg-amber-500'
        }`}
      />
      {label}
    </motion.div>
  )
}

export default function VoiceSignupWizard() {
  const navigate = useNavigate()
  const {
    startListening,
    stopListening,
    transcript,
    speak,
    pauseProcessing,
    resumeProcessing,
    confidence,
  } = useVoice()

  const [step, setStep] = useState<SignupStep>('welcome')
  const [captions, setCaptions] = useState('')
  const [statusLabel, setStatusLabel] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    return () => {
      resumeProcessing()
    }
  }, [resumeProcessing])

  const captionsRef = useRef(captions)
  const stepRef = useRef(step)
  const nameRef = useRef(name)
  const emailRef = useRef(email)
  const passwordRef = useRef(password)

  useEffect(() => {
    captionsRef.current = captions
  }, [captions])
  useEffect(() => {
    stepRef.current = step
  }, [step])
  useEffect(() => {
    nameRef.current = name
  }, [name])
  useEffect(() => {
    emailRef.current = email
  }, [email])
  useEffect(() => {
    passwordRef.current = password
  }, [password])

  const speakAndCaption = useCallback(
    async (text: string) => {
      setCaptions(text)
      await speak(text).catch(() => {})
    },
    [speak]
  )

  const goToNameInput = useCallback(() => {
    pauseProcessing()
    speakAndCaption('What is your full name? Please say your name clearly.')
    setStep('name_input')
    setStatusLabel('Listening...')
    startListening()
  }, [speakAndCaption, startListening, pauseProcessing])

  useEffect(() => {
    if (step === 'welcome') {
      speakAndCaption("Let's create your account. I'll guide you step by step.")
      setStatusLabel('Thinking...')
      const t = setTimeout(goToNameInput, 2000)
      return () => clearTimeout(t)
    }
  }, [step, speakAndCaption, goToNameInput])

  // Name input — listen and detect
  useEffect(() => {
    if (step !== 'name_input' || !transcript) return
    const t = transcript.trim()
    if (t.length < 2) return

    // Check confidence — if too low, ask to repeat
    if (confidence > 0 && confidence < 0.7) {
      speakAndCaption(
        "I couldn't understand clearly. Could you repeat your name?"
      )
      setStatusLabel('Listening...')
      return
    }

    const cleaned = normalizeNameTranscript(t)
    setName(cleaned)
    stopListening()
    setStatusLabel('')
    speakAndCaption(`I heard "${cleaned}". Is that correct?`)
    setStep('name_confirm')
  }, [transcript, step, stopListening, speakAndCaption, confidence])

  // Email input — listen and detect
  useEffect(() => {
    if (step !== 'email_input' || !transcript) return
    const t = transcript.trim()
    if (t.length < 3) return

    if (confidence > 0 && confidence < 0.7) {
      speakAndCaption(
        "I couldn't understand clearly. Could you repeat your email?"
      )
      setStatusLabel('Listening...')
      return
    }

    const cleaned = normalizeEmailTranscript(t)
    if (!cleaned.includes('@')) return
    setEmail(cleaned)
    stopListening()
    setStatusLabel('')
    speakAndCaption(`I heard "${cleaned}". Is that correct?`)
    setStep('email_confirm')
  }, [transcript, step, stopListening, speakAndCaption, confidence])

  // Voice confirmation handler for name_confirm and email_confirm steps
  useEffect(() => {
    if ((step !== 'name_confirm' && step !== 'email_confirm') || !transcript)
      return
    const t = transcript.trim().toLowerCase()

    if (/^(yes|yeah|correct|right|yep|sure|okay|ok|confirm)$/i.test(t)) {
      if (step === 'name_confirm') {
        handleNameYes()
      } else {
        handleEmailYes()
      }
    } else if (/^(no|nope|wrong|incorrect|try again|repeat|again)$/i.test(t)) {
      if (step === 'name_confirm') {
        handleNameNo()
      } else {
        handleEmailNo()
      }
    }
  }, [transcript, step])

  // Voice command handler for auth_method step
  useEffect(() => {
    if (step !== 'auth_method' || !transcript) return
    const t = transcript.trim().toLowerCase()

    if (/google/i.test(t)) {
      handleAuthMethod('google')
    } else if (/magic\s*link|magic/i.test(t)) {
      handleAuthMethod('magic_link')
    } else if (/passkey|pass\s*key/i.test(t)) {
      handleAuthMethod('passkey')
    } else if (/password|keyboard|email/i.test(t)) {
      handleAuthMethod('password')
    }
  }, [transcript, step])

  const handleNameYes = useCallback(() => {
    stopListening()
    pauseProcessing()
    setStatusLabel('Thinking...')
    speakAndCaption(
      'What is your email address? You can say it like user at example dot com.'
    )
    setStep('email_input')
    setTimeout(() => {
      setStatusLabel('Listening...')
      startListening()
    }, 1500)
  }, [speakAndCaption, startListening, pauseProcessing, stopListening])

  const handleNameNo = useCallback(() => {
    setName('')
    speakAndCaption("Let's try again. What is your full name?")
    setStep('name_input')
    setStatusLabel('Listening...')
    startListening()
  }, [speakAndCaption, startListening])

  const handleEmailYes = useCallback(() => {
    stopListening()
    resumeProcessing()
    setStatusLabel('')
    speakAndCaption(
      'For security reasons, passwords cannot be spoken. Choose one authentication method.'
    )
    setStep('auth_method')
  }, [speakAndCaption, resumeProcessing, stopListening])

  const handleEmailNo = useCallback(() => {
    setEmail('')
    speakAndCaption("Let's try again. What is your email address?")
    setStep('email_input')
    setStatusLabel('Listening...')
    startListening()
  }, [speakAndCaption, startListening])

  const handleAuthMethod = useCallback(
    async (method: string) => {
      if (method === 'password') {
        const msg =
          'Please type your password in the input field below. Your password will not be spoken for security reasons.'
        speakAndCaption(msg)
        setStep('password_input')
        setStatusLabel('')
      } else if (method === 'google') {
        speakAndCaption(
          'Google sign-in is coming soon. Please select Email and Password instead.'
        )
      } else if (method === 'magic_link') {
        speakAndCaption(
          'Magic Link is coming soon. Please select Email and Password instead.'
        )
      } else if (method === 'passkey') {
        speakAndCaption(
          'Passkey authentication is coming soon. Please select Email and Password instead.'
        )
      }
    },
    [speakAndCaption]
  )

  const handlePasswordSubmit = useCallback(async () => {
    if (!passwordRef.current || passwordRef.current.length < 6) {
      speakAndCaption(
        'Password must be at least 6 characters. Please try again.'
      )
      return
    }
    setStep('registering')
    setStatusLabel('Thinking...')
    speakAndCaption('Creating your account. Please wait.')

    try {
      const result = await authService.register(
        nameRef.current,
        emailRef.current,
        passwordRef.current
      )
      if (result) {
        setStatusLabel('Completed')
        speakAndCaption('Your account has been created successfully.')
        const t = setTimeout(() => {
          navigate('/accessibility-profile', { replace: true })
        }, 2000)
        return () => clearTimeout(t)
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Registration failed. Please try again.'
      setErrorMsg(msg)
      speakAndCaption(msg)
      setStep('error')
      setStatusLabel('')
    }
  }, [navigate, speakAndCaption])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 blur-3xl dark:from-teal-500/10 dark:to-emerald-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 blur-3xl dark:from-sky-500/10 dark:to-blue-500/10" />
      </div>

      {step !== 'welcome' && step !== 'error' && step !== 'registering' && (
        <div className="relative z-10 mb-4 w-full max-w-lg">
          <ProgressIndicator step={step} />
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-teal-600 dark:text-teal-400"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold">Create Your Account</h2>
              </div>
              <div
                className="rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                aria-live="assertive"
              >
                {captions}
              </div>
              {statusLabel && (
                <div className="flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'name_input' && (
          <motion.div
            key="name_input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold">
                  What is your full name?
                </h2>
              </div>
              <div
                className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                aria-live="assertive"
              >
                {transcript ? normalizeNameTranscript(transcript) : captions}
              </div>
              {statusLabel && (
                <div className="mb-3 flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    stopListening()
                    goToNameInput()
                  }}
                  className="rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  Tap to speak again
                </button>
                <input
                  type="text"
                  placeholder="Or type your name..."
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-blue-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value.trim()
                      if (val) {
                        const cleaned = normalizeNameTranscript(val)
                        setName(cleaned)
                        stopListening()
                        speakAndCaption(
                          `I heard "${cleaned}". Is that correct?`
                        )
                        setStep('name_confirm')
                        setStatusLabel('')
                      }
                    }
                  }}
                />
                <p className="text-center text-xs text-zinc-400">
                  Press Enter to submit
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {(step === 'name_confirm' || step === 'email_confirm') && (
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <h2 className="text-xl font-bold">
                  {step === 'name_confirm'
                    ? 'Is this your name?'
                    : 'Is this your email?'}
                </h2>
              </div>
              <div className="mb-6 rounded-lg bg-amber-50 p-4 text-center text-lg font-medium text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                {step === 'name_confirm' ? name : email}
              </div>
              <div
                className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                aria-live="assertive"
              >
                {captions}
              </div>
              {statusLabel && (
                <div className="flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
              <p className="mt-3 text-center text-xs text-zinc-400">
                Say &quot;Yes&quot; to confirm or &quot;Try Again&quot; to
                re-record
              </p>
              <div className="mt-4 flex gap-3">
                <button
                  onClick={
                    step === 'name_confirm' ? handleNameYes : handleEmailYes
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-4 font-medium text-white transition-all hover:bg-emerald-500 active:scale-[0.98]"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Yes, it&apos;s correct
                </button>
                <button
                  onClick={
                    step === 'name_confirm' ? handleNameNo : handleEmailNo
                  }
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'email_input' && (
          <motion.div
            key="email_input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold">
                  What is your email address?
                </h2>
                <p className="text-xs text-zinc-500">
                  Say it like: user at example dot com
                </p>
              </div>
              <div
                className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                aria-live="assertive"
              >
                {transcript ? normalizeEmailTranscript(transcript) : captions}
              </div>
              {statusLabel && (
                <div className="mb-3 flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    stopListening()
                    setStep('email_input')
                    setStatusLabel('Listening...')
                    startListening()
                  }}
                  className="rounded-xl bg-zinc-900 py-3 text-sm font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
                >
                  Tap to speak again
                </button>
                <input
                  type="email"
                  placeholder="Or type your email..."
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value
                        .trim()
                        .toLowerCase()
                      if (val && val.includes('@')) {
                        setEmail(val)
                        stopListening()
                        speakAndCaption(`I heard "${val}". Is that correct?`)
                        setStep('email_confirm')
                        setStatusLabel('')
                      }
                    }
                  }}
                />
                <p className="text-center text-xs text-zinc-400">
                  Press Enter to submit
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'auth_method' && (
          <motion.div
            key="auth_method"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <h2 className="mb-2 text-xl font-bold">
                  Choose Authentication Method
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  For security reasons, passwords cannot be spoken. Choose one
                  method below.
                </p>
              </div>
              <div
                className="rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                aria-live="assertive"
              >
                {captions}
              </div>
              <p className="mt-2 text-center text-xs text-zinc-400">
                Say &quot;Google&quot;, &quot;Magic Link&quot;,
                &quot;Passkey&quot;, or &quot;Password&quot;
              </p>
              <div className="mt-6 flex flex-col gap-3">
                {AUTH_METHODS.map((m) => (
                  <button
                    key={m.value}
                    disabled={m.comingSoon}
                    onClick={() => handleAuthMethod(m.value)}
                    className={`flex items-center justify-center gap-3 rounded-xl px-6 py-4 font-medium transition-all active:scale-[0.98] ${
                      m.comingSoon
                        ? 'cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800'
                        : 'border-2 border-zinc-900 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {m.icon}
                    {m.label}
                    {m.comingSoon && (
                      <span className="ml-2 rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                        Soon
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 'password_input' && (
          <motion.div
            key="password_input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-amber-600 dark:text-amber-400"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold">Create Password</h2>
              </div>
              <div
                className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                aria-live="assertive"
              >
                {captions}
              </div>
              <div className="flex flex-col gap-3">
                <input
                  type="password"
                  placeholder="Type your password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handlePasswordSubmit()
                  }}
                  autoFocus
                />
                <button
                  onClick={handlePasswordSubmit}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Create Account
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'registering' && (
          <motion.div
            key="registering"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent dark:border-blue-400" />
              </div>
              <h2 className="text-xl font-bold">Creating your account...</h2>
              <div
                className="mt-4 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                aria-live="assertive"
              >
                {captions}
              </div>
              {statusLabel && (
                <div className="flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-lg"
          >
            <div className="rounded-2xl border border-red-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-red-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-red-600 dark:text-red-400"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h2 className="mb-2 text-xl font-bold text-red-700 dark:text-red-400">
                  Something went wrong
                </h2>
              </div>
              <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                {errorMsg}
              </div>
              <button
                onClick={() => {
                  setStep('auth_method')
                  setErrorMsg('')
                  speakAndCaption(
                    'Please try again. Choose a method to set up your account.'
                  )
                }}
                className="w-full rounded-xl bg-zinc-900 py-3 font-medium text-white dark:bg-zinc-50 dark:text-zinc-900"
              >
                Try Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
