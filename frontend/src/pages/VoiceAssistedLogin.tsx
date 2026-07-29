import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'

type Step =
  | 'greeting'
  | 'ask_email'
  | 'confirm_email'
  | 'choose_method'
  | 'magic_link_sent'

export default function VoiceAssistedLogin() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('greeting')
  const [email, setEmail] = useState('')
  const [captions, setCaptions] = useState('')
  const [assistantOpen] = useState(true)
  const { isListening, transcript, isSupported, start, stop, reset } =
    useSpeechRecognition()
  const { speak, cancel } = useSpeechSynthesis()

  const speakAndCaption = useCallback(
    (text: string) => {
      setCaptions(text)
      speak(text)
    },
    [speak]
  )

  useEffect(() => {
    if (step === 'greeting') {
      const msg =
        'Hello. I will help you sign in. For security, I will never ask you to speak your password.'
      speakAndCaption(msg)
      const timer = setTimeout(() => setStep('ask_email'), 4000)
      return () => clearTimeout(timer)
    }
  }, [step, speakAndCaption])

  useEffect(() => {
    if (step === 'ask_email') {
      const msg = 'Please say your registered email address.'
      speakAndCaption(msg)
      setTimeout(() => start(), 1500)
    }
  }, [step, speakAndCaption, start])

  useEffect(() => {
    if (transcript && step === 'ask_email') {
      const detectedEmail = transcript.trim().toLowerCase().replace(/\s+/g, '')
      if (detectedEmail.includes('at')) {
        setEmail(detectedEmail.replace(/\s*at\s*/, '@'))
      } else {
        setEmail(detectedEmail)
      }
      stop()
      const msg = `I heard ${detectedEmail}. Is that correct?`
      speakAndCaption(msg)
      setStep('confirm_email')
    }
  }, [transcript, step, stop, speakAndCaption])

  const handleEmailConfirm = () => {
    cancel()
    const msg = 'Choose a secure authentication method.'
    speakAndCaption(msg)
    setStep('choose_method')
  }

  const handleEmailRetry = () => {
    reset()
    const msg = 'Please say your registered email address again.'
    speakAndCaption(msg)
    setStep('ask_email')
    setTimeout(() => start(), 1500)
  }

  const handleMagicLinkChoice = () => {
    cancel()
    const msg =
      'A magic link has been sent to your email. Please check your inbox.'
    speakAndCaption(msg)
    setStep('magic_link_sent')
  }

  const handleGoogleChoice = () => {
    cancel()
    navigate('/auth/google')
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl dark:from-blue-500/10 dark:to-cyan-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl dark:from-purple-500/10 dark:to-pink-500/10" />
      </div>

      {step === 'magic_link_sent' ? (
        <motion.div
          key="magic"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
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
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <p className="text-lg font-medium">Magic Link Sent</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Check your email inbox for the secure sign-in link. It expires
                in 10 minutes.
              </p>
              <Button
                onClick={() => navigate('/login')}
                variant="outline"
                className="w-full"
              >
                Back to login
              </Button>
            </div>
          </div>
        </motion.div>
      ) : step !== 'choose_method' ? (
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md text-center"
        >
          <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
            {step === 'greeting' && (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
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
                  </svg>
                </div>
                <p className="text-lg font-medium">Voice Assistant Active</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Preparing your secure login...
                </p>
              </div>
            )}

            {step === 'ask_email' && (
              <div className="space-y-4">
                <div
                  className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full transition-all ${
                    isListening
                      ? 'bg-green-500/20 scale-110'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className={`${isListening ? 'text-green-600 dark:text-green-400' : 'text-zinc-500'}`}
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  </svg>
                </div>
                <p className="text-lg font-medium">
                  {isListening ? 'Listening...' : 'Ready'}
                </p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Speak your email address clearly
                </p>
                {!isSupported && (
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                    Speech recognition not supported in this browser. Please use
                    the typing option below.
                  </div>
                )}
              </div>
            )}

            {step === 'confirm_email' && (
              <div className="space-y-4">
                <div className="rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800">
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Recognized email
                  </p>
                  <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                    {email}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleEmailConfirm}
                    className="flex-1"
                    size="lg"
                  >
                    Yes, that&apos;s correct
                  </Button>
                  <Button
                    onClick={handleEmailRetry}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      ) : null}

      {step === 'choose_method' && (
        <motion.div
          key="choose_method"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-md"
        >
          <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold">
                Choose Authentication Method
              </h2>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                For your privacy and security, passwords are never entered
                through voice. Choose one of the secure methods below.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={handleGoogleChoice}
                className="flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                aria-label="Sign in with Google"
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
                Google Sign In
              </button>

              <button
                onClick={handleMagicLinkChoice}
                className="flex items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium transition-all hover:bg-zinc-50 active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                aria-label="Send magic link"
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
                Magic Login Link
              </button>

              <button
                disabled
                className="flex cursor-not-allowed items-center justify-center gap-3 rounded-xl border border-zinc-200 bg-white px-6 py-4 font-medium text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900"
                aria-label="Passkey login (coming soon)"
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

            <p className="mt-6 text-center text-xs text-zinc-400">
              For your privacy and security, passwords are never entered through
              voice.
            </p>
          </div>
        </motion.div>
      )}

      {assistantOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-zinc-200/50 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/90">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Voice Assistant</span>
          </div>
          <div className="mb-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
            <p
              className="text-sm text-zinc-700 dark:text-zinc-300"
              aria-live="assertive"
            >
              {captions}
            </p>
          </div>
          {isListening && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
              <span className="text-sm text-green-700 dark:text-green-300">
                Listening...
              </span>
            </div>
          )}
          <div className="flex gap-2">
            {step === 'confirm_email' && (
              <>
                <Button
                  size="sm"
                  onClick={handleEmailConfirm}
                  className="flex-1"
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailRetry}
                  className="flex-1"
                >
                  Try Again
                </Button>
              </>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
            <span className="text-[10px] text-zinc-400">
              {isSupported ? 'Speech supported' : 'Speech not supported'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
