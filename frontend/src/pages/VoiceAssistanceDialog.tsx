import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useEffect, useState } from 'react'

interface Props {
  intent: 'login' | 'register'
}

export default function VoiceAssistanceDialog({ intent }: Props) {
  const navigate = useNavigate()
  const [captions, setCaptions] = useState('')
  const { speak, cancel } = useSpeechSynthesis()

  useEffect(() => {
    const msg =
      'Would you like Voice Assistance during authentication? Voice Assistance helps users with motor disabilities enter information using voice while keeping sensitive information secure.'
    setCaptions(msg)
    speak(msg)
    return () => cancel()
  }, [speak, cancel])

  const handleChoice = (useVoice: boolean) => {
    cancel()
    if (intent === 'login') {
      navigate(useVoice ? '/login/voice' : '/login/standard')
    } else {
      navigate(useVoice ? '/register/voice' : '/register/standard')
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 blur-3xl dark:from-sky-500/10 dark:to-blue-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-teal-500/20 to-emerald-500/20 blur-3xl dark:from-teal-500/10 dark:to-emerald-500/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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

          <div className="flex gap-3">
            <button
              onClick={() => handleChoice(true)}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-4 font-medium text-white transition-all hover:bg-zinc-800 active:scale-[0.98] dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              autoFocus
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
              onClick={() => handleChoice(false)}
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

          <p className="mt-6 text-center text-xs text-zinc-400">
            Voice Assistance helps users with motor disabilities enter
            information using voice while keeping sensitive information secure.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
