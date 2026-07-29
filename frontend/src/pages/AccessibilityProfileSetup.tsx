import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef, useCallback, type ReactNode } from 'react'
import { useVoice } from '@/context/VoiceContext'
import {
  useAccessibility,
  profileFromCategory,
} from '@/context/AccessibilityContext'
import type { DisabilityCategory } from '@/types/accessibility'

interface Profile {
  id: DisabilityCategory
  label: string
  description: string
  icon: ReactNode
}

const PROFILES: Profile[] = [
  {
    id: 'blind',
    label: 'Blind',
    description: 'Screen reader support, voice navigation, high contrast',
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
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </svg>
    ),
  },
  {
    id: 'low_vision',
    label: 'Low Vision',
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
    id: 'motor_disability',
    label: 'Motor Disability',
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
    id: 'color_blind',
    label: 'Color Blind',
    description: 'High contrast mode for better differentiation',
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
        <path d="M12 2a10 10 0 0 0 0 20z" fill="currentColor" opacity="0.3" />
      </svg>
    ),
  },
  {
    id: 'speech_disability',
    label: 'Speech Disability',
    description: 'Keyboard-first navigation, screen reader output',
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
      </svg>
    ),
  },
  {
    id: 'hearing_impairment',
    label: 'Hearing Impairment',
    description: 'Visual alerts, captions, clear messaging',
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
    id: 'cognitive_disability',
    label: 'Cognitive Disability',
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
  {
    id: 'senior_citizen',
    label: 'Senior Citizen',
    description: 'Large text, high contrast, simplified layout',
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
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Default experience with full accessibility features',
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
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
]

const PROFILE_VOICE_MAP: Record<DisabilityCategory, string[]> = {
  blind: ['blind', 'cannot see', 'screen reader'],
  low_vision: ['vision', 'low vision', 'see', 'visual', 'large text'],
  motor_disability: [
    'motor',
    'voice',
    'physical',
    'mobility',
    'dexterity',
    'hands',
  ],
  color_blind: ['color', 'color blind', 'contrast', 'colorblind'],
  speech_disability: ['speech', 'voice disability', 'cannot speak', 'mute'],
  hearing_impairment: [
    'hearing',
    'deaf',
    'hear',
    'audio',
    'caption',
    'hearing impairment',
  ],
  cognitive_disability: [
    'cognitive',
    'learning',
    'memory',
    'focus',
    'dyslexia',
    'simple',
  ],
  senior_citizen: ['senior', 'senior citizen', 'elderly', 'older'],
  standard: ['standard', 'none', 'default', 'normal', 'no disability'],
}

export default function AccessibilityProfileSetup() {
  const navigate = useNavigate()
  const {
    startListening,
    stopListening,
    transcript,
    speak,
    pauseProcessing,
    resumeProcessing,
  } = useVoice()
  const { setProfile } = useAccessibility()

  const [selected, setSelected] = useState<DisabilityCategory | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [captions, setCaptions] = useState('')
  const [statusLabel, setStatusLabel] = useState('')
  const navigatedRef = useRef(false)

  const speakAndCaption = useCallback(
    async (text: string) => {
      setCaptions(text)
      await speak(text).catch(() => {})
    },
    [speak]
  )

  useEffect(() => {
    pauseProcessing()
    speakAndCaption('Please select your accessibility profile.')
    setStatusLabel('Listening...')
    startListening()
    return () => {
      resumeProcessing()
    }
  }, [])

  useEffect(() => {
    if (navigatedRef.current || !transcript || confirmed) return
    const t = transcript.trim().toLowerCase()

    for (const [profileId, keywords] of Object.entries(PROFILE_VOICE_MAP)) {
      if (keywords.some((kw) => t.includes(kw))) {
        handleSelect(profileId as DisabilityCategory)
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
      setStatusLabel('Listening...')
    }
  }, [transcript, selected, confirmed])

  const handleSelect = useCallback(
    (id: DisabilityCategory) => {
      const profile = PROFILES.find((p) => p.id === id)
      setSelected(id)
      speakAndCaption(
        `You selected ${profile?.label}. Is that correct? Say yes to confirm or select a different profile.`
      )
    },
    [speakAndCaption]
  )

  const handleConfirm = useCallback(() => {
    if (!selected || navigatedRef.current) return
    setConfirmed(true)
    navigatedRef.current = true
    stopListening()
    resumeProcessing()
    setStatusLabel('Thinking...')

    const newProfile = profileFromCategory(selected)
    setProfile(newProfile)

    const homeWelcomeMsg =
      'Welcome to InclusiveCart AI. Your accessibility settings have been applied. How can I help you today?'
    speakAndCaption(homeWelcomeMsg)

    setTimeout(() => {
      setStatusLabel('Completed')
      navigate('/', { replace: true })
    }, 2800)
  }, [
    selected,
    stopListening,
    setProfile,
    navigate,
    speakAndCaption,
    resumeProcessing,
  ])

  const StatusBadge = ({ label }: { label: string }) => {
    if (!label) return null
    const isListening = label === 'Listening...'
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium ${
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
              Your accessibility settings have been applied. Redirecting to
              home...
            </p>
            <div
              className="mt-6 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
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
        className="relative w-full max-w-3xl"
      >
        <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80">
          <div className="mb-6 text-center">
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
              Please select your accessibility profile.
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Choose how you&apos;d like to experience InclusiveCart AI. You can
              speak your selection or click below.
            </p>
          </div>

          <div
            className="mb-4 rounded-lg bg-zinc-50 p-4 text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            aria-live="assertive"
            role="status"
          >
            {captions}
          </div>

          {statusLabel && (
            <div className="mb-6 flex justify-center">
              <StatusBadge label={statusLabel} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => handleSelect(profile.id)}
                className={`group relative rounded-xl border-2 p-4 text-left transition-all active:scale-[0.98] ${
                  selected === profile.id
                    ? 'border-violet-500 bg-violet-50 shadow-lg shadow-violet-500/10 dark:border-violet-400 dark:bg-violet-950/30'
                    : 'border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:hover:bg-zinc-800'
                }`}
              >
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
                    selected === profile.id
                      ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400'
                      : 'bg-zinc-100 text-zinc-600 group-hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {profile.icon}
                </div>
                <h3 className="mb-1 text-sm font-semibold">{profile.label}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">
                  {profile.description}
                </p>
                {selected === profile.id && (
                  <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
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
                  Confirm & Apply Profile
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
