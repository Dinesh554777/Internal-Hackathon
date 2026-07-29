import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  useAccessibility,
  profileFromCategory,
} from '@/context/AccessibilityContext'
import type { DisabilityCategory, FontSize } from '@/types/accessibility'
import { DISABILITY_LABELS } from '@/types/accessibility'
import type { AccessibilityFeatures } from '@/types/accessibility'

const ICONS: Record<DisabilityCategory, React.ReactNode> = {
  blind: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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
      width="24"
      height="24"
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

interface ToggleItem {
  key: keyof AccessibilityFeatures
  label: string
  description: string
}

const TOGGLES: ToggleItem[] = [
  {
    key: 'largeFont',
    label: 'Large Font',
    description: 'Increase text size for better readability',
  },
  {
    key: 'highContrast',
    label: 'High Contrast',
    description: 'Enhance color contrast for better visibility',
  },
  {
    key: 'keyboardNavigation',
    label: 'Keyboard Navigation',
    description: 'Navigate all elements using keyboard',
  },
  {
    key: 'voiceAssistant',
    label: 'Voice Assistant',
    description: 'Enable voice commands and speech output',
  },
  {
    key: 'screenReaderSupport',
    label: 'Screen Reader Support',
    description: 'Optimize for screen reader compatibility',
  },
  {
    key: 'simpleLayout',
    label: 'Simple Layout',
    description: 'Reduce visual complexity and clutter',
  },
  {
    key: 'animationsOff',
    label: 'Animations Off',
    description: 'Disable motion animations',
  },
]

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

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'xlarge', label: 'X-Large' },
]

export default function AccessibilitySettings() {
  const navigate = useNavigate()
  const {
    profile,
    updateProfile,
    isHighContrast,
    isReducedMotion,
    isVoiceEnabled,
    isSimplifiedLayout,
    areLargeButtons,
    isScreenReaderSupported,
    isKeyboardNavigationEnabled,
    areAnimationsOff,
    fontSize,
  } = useAccessibility()

  const features: AccessibilityFeatures = {
    largeFont: areLargeButtons || fontSize === 'large' || fontSize === 'xlarge',
    highContrast: isHighContrast,
    keyboardNavigation: isKeyboardNavigationEnabled,
    voiceAssistant: isVoiceEnabled,
    screenReaderSupport: isScreenReaderSupported,
    simpleLayout: isSimplifiedLayout,
    animationsOff: areAnimationsOff || isReducedMotion,
  }

  const toggleFeature = (key: keyof AccessibilityFeatures) => {
    switch (key) {
      case 'largeFont':
        const next: FontSize =
          fontSize === 'xlarge'
            ? 'medium'
            : fontSize === 'large'
              ? 'xlarge'
              : 'large'
        updateProfile({
          preferredFontSize: next,
          largeButtons: next === 'large' || next === 'xlarge',
        })
        break
      case 'highContrast':
        updateProfile({ highContrast: !isHighContrast })
        break
      case 'keyboardNavigation':
        updateProfile({ keyboardNavigation: !isKeyboardNavigationEnabled })
        break
      case 'voiceAssistant':
        updateProfile({ voiceEnabled: !isVoiceEnabled })
        break
      case 'screenReaderSupport':
        updateProfile({ screenReaderSupport: !isScreenReaderSupported })
        break
      case 'simpleLayout':
        updateProfile({ simplifiedLayout: !isSimplifiedLayout })
        break
      case 'animationsOff':
        updateProfile({
          reducedMotion: !isReducedMotion,
          animationsOff: !areAnimationsOff,
        })
        break
    }
  }

  const currentCategory = profile?.disabilityCategory || 'standard'

  const saveCategory = (cat: DisabilityCategory) => {
    const p = profileFromCategory(cat)
    updateProfile(p)
    try {
      const token = localStorage.getItem('accessToken')
      if (token) {
        import('@/services/api').then((mod) => {
          mod.default
            .put('/accessibility/profile', {
              disability_category: cat,
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
    <div className="relative min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 py-12 dark:from-zinc-950 dark:to-zinc-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl dark:from-blue-500/10 dark:to-cyan-500/10" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl dark:from-purple-500/10 dark:to-pink-500/10" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          aria-label="Go back"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
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
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Accessibility Settings
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Customise your experience. Changes apply immediately.
          </p>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Your Profile
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              Currently set to:{' '}
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {DISABILITY_LABELS[currentCategory]}
              </span>
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => saveCategory(cat)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all active:scale-[0.97] ${
                    cat === currentCategory
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700'
                  }`}
                >
                  <div
                    className={`${cat === currentCategory ? 'text-blue-500 dark:text-blue-400' : 'text-zinc-400'}`}
                  >
                    {ICONS[cat]}
                  </div>
                  <span className="text-[10px] font-medium leading-tight text-center">
                    {DISABILITY_LABELS[cat]}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Font Size
              </h2>
              <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                {fontSize === 'xlarge'
                  ? 'X-Large'
                  : fontSize === 'large'
                    ? 'Large'
                    : fontSize === 'small'
                      ? 'Small'
                      : 'Medium'}
              </span>
            </div>
            <div className="flex gap-2">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.value}
                  onClick={() =>
                    updateProfile({
                      preferredFontSize: s.value,
                      largeButtons: s.value === 'large' || s.value === 'xlarge',
                    })
                  }
                  className={`flex-1 rounded-xl border py-3 text-center text-sm font-medium transition-all active:scale-[0.97] ${
                    fontSize === s.value
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                      : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
          >
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Accessibility Features
            </h2>
            <div className="space-y-3">
              {TOGGLES.map((t) => {
                const isOn = features[t.key]
                return (
                  <div
                    key={t.key}
                    className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white p-4 transition-all dark:border-zinc-800 dark:bg-zinc-900"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {t.label}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {t.description}
                      </p>
                    </div>
                    <button
                      role="switch"
                      aria-checked={isOn}
                      onClick={() => toggleFeature(t.key)}
                      className={`relative h-7 w-12 flex-shrink-0 rounded-full transition-all ${
                        isOn
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-500'
                          : 'bg-zinc-200 dark:bg-zinc-700'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                          isOn ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-2xl border border-zinc-200/50 bg-white/80 p-6 shadow-lg backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/80"
          >
            <h2 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Screen Reader
            </h2>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              This site supports screen readers. Enable ARIA live regions and
              semantic landmarks for optimal compatibility.
            </p>
            <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-emerald-600 dark:text-emerald-400"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    WCAG 2.2 AA Compliant
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    All pages follow Web Content Accessibility Guidelines
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          All preferences are saved locally and synced to your account when
          logged in.
        </p>
      </div>
    </div>
  )
}
