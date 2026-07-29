import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useVoice } from '@/context/VoiceContext'
import { useAccessibility } from '@/context/AccessibilityContext'

interface Props {
  intent: 'login' | 'register'
}

type DialogStep = 'welcome' | 'enabled' | 'ask_account'

export default function VoiceAssistanceDialog({ intent }: Props) {
  const navigate = useNavigate()
  const { isVoiceEnabled } = useAccessibility()
  const [step, setStep] = useState<DialogStep>('welcome')
  const [captions, setCaptions] = useState('')
  const [statusLabel, setStatusLabel] = useState<string>('')
  const navigatedRef = useRef(false)
  const hasSpokenWelcomeRef = useRef(false)
  const hasStartedEnabledRef = useRef(false)

  const {
    startListening,
    stopListening,
    transcript,
    speak,
    pauseProcessing,
    resumeProcessing,
  } = useVoice()

  useEffect(() => {
    return () => {
      resumeProcessing()
    }
  }, [resumeProcessing])

  const goTo = useCallback(
    (path: string) => {
      if (navigatedRef.current) return
      navigatedRef.current = true
      stopListening()
      resumeProcessing()
      navigate(path, { replace: true })
    },
    [navigate, stopListening, resumeProcessing]
  )

  const speakAndCaption = useCallback(
    async (text: string) => {
      setCaptions(text)
      await speak(text).catch(() => {})
    },
    [speak]
  )

  // Welcome step — speak the prompt once
  useEffect(() => {
    if (step === 'welcome' && !hasSpokenWelcomeRef.current) {
      hasSpokenWelcomeRef.current = true
      const msg =
        'Would you like Voice Assistance during authentication? Voice Assistance helps users with motor disabilities enter information using voice while keeping sensitive information secure.'
      speakAndCaption(msg)
      if (isVoiceEnabled) {
        pauseProcessing()
        startListening()
        setStatusLabel('Listening...')
      }
    }
  }, [step, isVoiceEnabled, startListening, speakAndCaption, pauseProcessing])

  // Enabled step — speak confirmation, then transition to ask_account
  useEffect(() => {
    if (step === 'enabled' && !hasStartedEnabledRef.current) {
      hasStartedEnabledRef.current = true
      setStatusLabel('Thinking...')

      const msg = `Great! Voice Assistance has been enabled. I will help you ${intent === 'login' ? 'sign in' : 'create your account'}. Let's begin.`
      speakAndCaption(msg)

      const timer = setTimeout(() => {
        setStatusLabel('')
        speakAndCaption('Do you already have an account?')
        setStep('ask_account')
        if (isVoiceEnabled) {
          pauseProcessing()
          startListening()
          setStatusLabel('Listening...')
        }
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [
    step,
    intent,
    isVoiceEnabled,
    startListening,
    speakAndCaption,
    pauseProcessing,
  ])

  // Voice recognition handler
  useEffect(() => {
    if (navigatedRef.current || !transcript) return
    const t = transcript.trim().toLowerCase()

    if (
      step === 'welcome' &&
      /^(yes|yeah|sure|okay|ok|please|i do)$/i.test(t)
    ) {
      handleYes()
    } else if (
      step === 'welcome' &&
      /^(no|nope|no thanks|skip|cancel|not now)$/i.test(t)
    ) {
      goTo(intent === 'login' ? '/login/standard' : '/register/standard')
    } else if (
      step === 'ask_account' &&
      /^(login|sign in|signin|i have an account|yes)/i.test(t)
    ) {
      handleLoginChoice()
    } else if (
      step === 'ask_account' &&
      /^(create|register|sign up|signup|new|no|i don't|i dont)/i.test(t)
    ) {
      handleCreateAccountChoice()
    }
  }, [transcript, step])

  const handleYes = useCallback(() => {
    stopListening()
    setStatusLabel('Thinking...')
    setStep('enabled')
  }, [stopListening])

  const handleNo = useCallback(() => {
    goTo(intent === 'login' ? '/login/standard' : '/register/standard')
  }, [intent, goTo])

  const handleLoginChoice = useCallback(async () => {
    if (navigatedRef.current) return
    stopListening()
    setStatusLabel('Navigating...')
    setCaptions("Let's sign you in.")
    await speak("Let's sign you in.").catch(() => {})
    goTo('/login/voice')
  }, [stopListening, speak, goTo])

  const handleCreateAccountChoice = useCallback(async () => {
    if (navigatedRef.current) return
    stopListening()
    setStatusLabel('Navigating...')
    setCaptions("Let's create your account.")
    await speak("Let's create your account.").catch(() => {})
    goTo('/signup/voice')
  }, [stopListening, speak, goTo])

  const StatusBadge = ({ label }: { label: string }) => {
    if (!label) return null
    const isListening = label === 'Listening...'
    const isThinking = label === 'Thinking...'
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium ${
          isListening
            ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
            : isThinking
              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
              : 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
        }`}
      >
        <span
          className={`h-2 w-2 rounded-full ${
            isListening
              ? 'animate-pulse bg-green-500'
              : isThinking
                ? 'animate-pulse bg-amber-500'
                : 'animate-pulse bg-blue-500'
          }`}
        />
        {label}
      </motion.div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 blur-3xl dark:from-sky-500/10 dark:to-blue-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 blur-3xl dark:from-teal-500/10 dark:to-emerald-500/10" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 dark:from-sky-500/10 dark:to-blue-500/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-blue-600 dark:text-blue-400"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                </div>
                <h2 className="mb-2 text-2xl font-bold">Voice Assistance</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Would you like Voice Assistance during authentication?
                </p>
              </div>
              <div
                className="mb-6 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                aria-live="assertive"
                role="status"
              >
                {captions}
              </div>
              {statusLabel && (
                <div className="mb-4 flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleYes}
                  autoFocus
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                  Yes
                </button>
                <button
                  onClick={handleNo}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium text-zinc-700 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  No
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {step === 'enabled' && (
          <motion.div
            key="enabled"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-lg"
          >
            <div className="rounded-2xl border border-emerald-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-emerald-800/50 dark:bg-zinc-950/80">
              <div className="mb-4 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20">
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
                <h2 className="mb-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  Voice Assistance Enabled
                </h2>
              </div>
              <div
                className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                aria-live="assertive"
                role="status"
              >
                {captions}
              </div>
              {statusLabel && (
                <div className="mt-4 flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'ask_account' && (
          <motion.div
            key="ask_account"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="relative w-full max-w-lg"
          >
            <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold">
                  Do you already have an account?
                </h2>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                  You can say &quot;Login&quot; or &quot;Create Account&quot;
                </p>
              </div>
              <div
                className="mb-6 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                aria-live="assertive"
                role="status"
              >
                {captions}
              </div>
              {statusLabel && (
                <div className="mb-4 flex justify-center">
                  <StatusBadge label={statusLabel} />
                </div>
              )}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleLoginChoice}
                  className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-5 text-lg font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
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
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Login
                </button>
                <button
                  onClick={handleCreateAccountChoice}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-zinc-900 bg-white px-6 py-5 text-lg font-medium text-zinc-900 transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
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
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  Create Account
                </button>
              </div>
              <p className="mt-6 text-center text-xs text-zinc-400">
                Voice commands supported — try saying &quot;Login&quot; or
                &quot;Create Account&quot;
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
