import { motion, AnimatePresence } from 'framer-motion'
import {
  useAccessibility,
  profileFromCategory,
} from '@/context/AccessibilityContext'
import type { DisabilityCategory } from '@/types/accessibility'
import {
  DISABILITY_LABELS,
  DISABILITY_DESCRIPTIONS,
  DISABILITY_FEATURE_MAP,
} from '@/types/accessibility'
import type { AccessibilityFeatures } from '@/types/accessibility'

const ICONS: Record<DisabilityCategory, React.ReactNode> = {
  blind: (
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
  low_vision: (
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
  motor_disability: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      <path d="M16 22v-7l-2.5-1.5L15 11h-6l1.5 2.5L8 15v7" />
    </svg>
  ),
  speech_disability: (
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
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  color_blind: (
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
      <path d="M12 2a7 7 0 0 1 7 7c0 2.5-2 4.5-4 6a4 4 0 0 0-2 3.5" />
      <path d="M12 2a7 7 0 0 0-7 7c0 2.5 2 4.5 4 6a4 4 0 0 1 2 3.5" />
    </svg>
  ),
  hearing_impairment: (
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
  cognitive_disability: (
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
  senior_citizen: (
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
  standard: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
}

const FEATURE_LABELS: Record<keyof AccessibilityFeatures, string> = {
  largeFont: 'Large Font',
  highContrast: 'High Contrast',
  keyboardNavigation: 'Keyboard Navigation',
  voiceAssistant: 'Voice Assistant',
  screenReaderSupport: 'Screen Reader',
  simpleLayout: 'Simple Layout',
  animationsOff: 'Animations Off',
}

const CATEGORIES: DisabilityCategory[] = [
  'blind',
  'low_vision',
  'color_blind',
  'motor_disability',
  'hearing_impairment',
  'speech_disability',
  'cognitive_disability',
  'senior_citizen',
  'standard',
]

export default function DisabilitySelectionDialog() {
  const { showFirstLoginDialog, dismissFirstLogin } = useAccessibility()
  const { setProfile } = useAccessibility()

  const handleSelect = (category: DisabilityCategory) => {
    const p = profileFromCategory(category)
    setProfile(p)
    localStorage.setItem('accessibilityFirstLoginDone', 'true')
    dismissFirstLogin()
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        import('@/services/api').then((mod) => {
          const api = mod.default
          api
            .post('/accessibility/profile', {
              disability_category: category,
              preferred_font_size: p.preferredFontSize,
              high_contrast: p.highContrast,
              keyboard_navigation: p.keyboardNavigation,
              voice_enabled: p.voiceEnabled,
              screen_reader_support: p.screenReaderSupport,
              simplified_layout: p.simplifiedLayout,
              reduced_motion: p.reducedMotion,
              large_buttons: p.largeButtons,
              animations_off: p.animationsOff,
            })
            .catch(() => {})
        })
      }
    } catch {}
  }

  return (
    <AnimatePresence>
      {showFirstLoginDialog && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-950"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-zinc-50 to-zinc-100 px-8 py-10 text-center dark:from-zinc-900 dark:to-zinc-800">
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />
              </div>
              <div className="relative">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.5"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4" />
                    <path d="M12 8h.01" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Personalise Your Experience
                </h2>
                <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                  Select your needs so we can tailor the interface for you. You
                  can change these anytime.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 px-8 py-6 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((cat, i) => {
                const features = DISABILITY_FEATURE_MAP[cat]
                return (
                  <motion.button
                    key={cat}
                    onClick={() => handleSelect(cat)}
                    className="group relative flex flex-col items-start rounded-2xl border border-zinc-200 bg-white p-5 text-left transition-all hover:border-zinc-300 hover:shadow-md active:scale-[0.98] dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                  >
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-200 text-zinc-600 transition-all group-hover:from-blue-500/20 group-hover:to-cyan-500/20 group-hover:text-blue-600 dark:from-zinc-800 dark:to-zinc-700 dark:text-zinc-400 dark:group-hover:text-blue-400">
                      {ICONS[cat]}
                    </div>
                    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      {DISABILITY_LABELS[cat]}
                    </h3>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {DISABILITY_DESCRIPTIONS[cat]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(
                        Object.keys(features) as (keyof AccessibilityFeatures)[]
                      )
                        .filter((k) => features[k])
                        .slice(0, 3)
                        .map((k) => (
                          <span
                            key={k}
                            className="inline-block rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                          >
                            {FEATURE_LABELS[k]}
                          </span>
                        ))}
                      {Object.values(features).filter(Boolean).length > 3 && (
                        <span className="inline-block rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                          +{Object.values(features).filter(Boolean).length - 3}{' '}
                          more
                        </span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-zinc-200 px-8 py-4 dark:border-zinc-800">
              <p className="text-xs text-zinc-400">
                You can change these settings later in Accessibility Settings
              </p>
              <button
                onClick={() => {
                  handleSelect('standard')
                }}
                className="rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.97]"
              >
                Get Started
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
