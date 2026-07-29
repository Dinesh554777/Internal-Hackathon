import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useVoice } from '@/context/VoiceContext'
import {
  useAccessibility,
  profileFromCategory,
} from '@/context/AccessibilityContext'
import type { DisabilityCategory } from '@/types/accessibility'

const PROFILE_TO_CATEGORY: Record<string, DisabilityCategory> = {
  low_vision: 'low_vision',
  hearing: 'hearing_impairment',
  motor: 'motor_disability',
  cognitive: 'cognitive_disability',
}

interface Profile {
  id: DisabilityCategory
  label: string
  description: string
  icon: JSX.Element
}

const PROFILES: Profile[] = [
  {
    id: 'low_vision',
    label: 'Vision',
    description: 'Screen reader, high contrast, large text',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: 'hearing_impairment',
    label: 'Hearing',
    description: 'Visual alerts, captions, sign language',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      </svg>
    ),
  },
  {
    id: 'motor_disability',
    label: 'Motor',
    description: 'Voice control, larger targets, keyboard nav',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
      </svg>
    ),
  },
  {
    id: 'cognitive_disability',
    label: 'Cognitive',
    description: 'Simplified UI, focus mode, step-by-step',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </svg>
    ),
  },
]

const PROFILE_VOICE_MAP: Record<string, string[]> = {
  low_vision: [
    'vision',
    'blind',
    'see',
    'visual',
    'screen reader',
    'low vision',
  ],
  hearing_impairment: ['hearing', 'deaf', 'hear', 'audio', 'caption'],
  motor_disability: ['motor', 'voice', 'physical', 'mobility', 'dexterity'],
  cognitive_disability: [
    'cognitive',
    'learning',
    'memory',
    'focus',
    'dyslexia',
  ],
}

export default function AccessibilityProfileSetup() {
  const navigate = useNavigate()
  const { startListening, stopListening, transcript, speak } = useVoice()
  const { setProfile } = useAccessibility()

  const [selected, setSelected] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [captions, setCaptions] = useState('')
  const navigatedRef = useRef(false)

  const speakAndCaption = useCallback(
    async (text: string) => {
      setCaptions(text)
      await speak(text).catch(() => {})
    },
    [speak]
  )

  useEffect(() => {
    speakAndCaption(
      'Please select your accessibility profile. This helps us customize your experience. You can say the name of the profile, or click on it.'
    )
    startListening()
  }, [])

  useEffect(() => {
    if (navigatedRef.current || !transcript || confirmed) return
    const t = transcript.trim().toLowerCase()

    for (const [profileId, keywords] of Object.entries(PROFILE_VOICE_MAP)) {
      if (keywords.some((kw) => t.includes(kw))) {
        setSelected(profileId)
        break
      }
    }

    if (
      selected &&
      /^(yes|confirm|select|that'?s? (right|correct)|okay|ok)$/i.test(t)
    ) {
      handleConfirm()
    }
    if (selected && /^(no|nope|different|change|other|back)$/i.test(t)) {
      setSelected(null)
      speakAndCaption('Please select a different profile.')
    }
  }, [transcript, selected, confirmed])

  const handleSelect = useCallback(
    (id: string) => {
      const profile = PROFILES.find((p) => p.id === id)
      setSelected(id)
      speakAndCaption(
        `You selected ${profile?.label}. Is that correct? Say yes to confirm or select a different one.`
      )
    },
    [speakAndCaption]
  )

  const handleConfirm = useCallback(() => {
    if (!selected) return
    setConfirmed(true)
    navigatedRef.current = true
    stopListening()
    setProfile(profileFromCategory(selected as DisabilityCategory))
    speakAndCaption(
      'Welcome to InclusiveCart AI! Your accessibility profile has been set.'
    )

    setTimeout(() => {
      navigate('/', { replace: true })
    }, 2500)
  }, [selected, stopListening, setDisability, navigate, speakAndCaption])

  if (confirmed) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-950 dark:to-zinc-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg text-center"
        >
          <div className="rounded-2xl border border-emerald-200/50 bg-white/80 p-10 shadow-2xl backdrop-blur-xl dark:border-emerald-800/50 dark:bg-zinc-950/80">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
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
            <h2 className="mb-2 text-3xl font-bold text-emerald-700 dark:text-emerald-300">
              Welcome to InclusiveCart AI!
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400">
              Your accessibility profile has been set. Redirecting to the home
              page...
            </p>
            <div
              className="mt-6 rounded-lg bg-zinc-50 p-3 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              aria-live="assertive"
            >
              {captions}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 blur-3xl dark:from-violet-500/10 dark:to-purple-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-rose-500/20 to-pink-500/20 blur-3xl dark:from-rose-500/10 dark:to-pink-500/10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-2xl"
      >
        <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-violet-600 dark:text-violet-400"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
            </div>
            <h2 className="mb-2 text-2xl font-bold">
              Your Accessibility Profile
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Choose how you'd like to experience InclusiveCart AI. You can
              change this anytime.
            </p>
          </div>

          <div
            className="mb-6 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            aria-live="assertive"
            role="status"
          >
            {captions}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile.id)}
                className={`group relative rounded-xl border-2 p-5 text-left transition-all active:scale-[0.98] ${
                  selected === profile.id
                    ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10 dark:border-violet-400 dark:bg-violet-950/30'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
                }`}
              >
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-colors ${
                    selected === profile.id
                      ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400'
                      : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {profile.icon}
                </div>
                <h3 className="mb-1 font-semibold">{profile.label}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {profile.description}
                </p>
                {selected === profile.id && (
                  <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-violet-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6"
              >
                <button
                  onClick={handleConfirm}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 font-medium text-white shadow-lg shadow-violet-500/20 transition-all hover:from-violet-500 hover:to-purple-500 active:scale-[0.98]"
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
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Confirm & Get Started
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
