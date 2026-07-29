import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type {
  AccessibilityProfile,
  AccessibilityContextValue,
  FontSize,
  DisabilityCategory,
  AccessibilityFeatures,
} from '@/types/accessibility'
import { DISABILITY_FEATURE_MAP } from '@/types/accessibility'
import { useAuthStore } from '@/store/authStore'

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
)

const DEFAULT_PROFILE: AccessibilityProfile = {
  id: '',
  userId: '',
  disabilityCategory: 'standard',
  preferredFontSize: 'medium',
  theme: 'system',
  voiceEnabled: false,
  highContrast: false,
  keyboardNavigation: true,
  screenReaderSupport: false,
  readingSpeed: 'normal',
  language: 'en',
  speechRate: 'normal',
  reducedMotion: false,
  simplifiedLayout: false,
  largeButtons: false,
  captionsEnabled: true,
  animationsOff: false,
  preferences: {},
  createdAt: '',
  updatedAt: '',
}

function getFontSizeClass(size: FontSize): string {
  switch (size) {
    case 'small':
      return 'text-sm'
    case 'large':
      return 'text-lg'
    case 'xlarge':
      return 'text-xl'
    default:
      return ''
  }
}

function featuresFromCategory(
  category: DisabilityCategory
): AccessibilityFeatures {
  return DISABILITY_FEATURE_MAP[category] ?? DISABILITY_FEATURE_MAP.standard
}

function profileFromCategory(
  category: DisabilityCategory
): AccessibilityProfile {
  const features = featuresFromCategory(category)
  const size: FontSize = features.largeFont ? 'xlarge' : 'medium'
  return {
    ...DEFAULT_PROFILE,
    disabilityCategory: category,
    preferredFontSize: size,
    highContrast: features.highContrast,
    keyboardNavigation: features.keyboardNavigation,
    voiceEnabled: features.voiceAssistant,
    screenReaderSupport: features.screenReaderSupport,
    simplifiedLayout: features.simpleLayout,
    reducedMotion: features.animationsOff,
    largeButtons: features.largeFont,
    animationsOff: features.animationsOff,
  }
}

function mapProfileToApi(
  profile: AccessibilityProfile
): Record<string, unknown> {
  return {
    disability_category: profile.disabilityCategory,
    preferred_font_size: profile.preferredFontSize,
    theme: profile.theme,
    voice_enabled: profile.voiceEnabled,
    high_contrast: profile.highContrast,
    keyboard_navigation: profile.keyboardNavigation,
    screen_reader_support: profile.screenReaderSupport,
    reading_speed: profile.readingSpeed,
    language: profile.language,
    speech_rate: profile.speechRate,
    reduced_motion: profile.reducedMotion,
    simplified_layout: profile.simplifiedLayout,
    large_buttons: profile.largeButtons,
    captions_enabled: profile.captionsEnabled,
    animations_off: profile.animationsOff,
    preferences: profile.preferences,
  }
}

function mapApiToProfile(data: Record<string, unknown>): AccessibilityProfile {
  return {
    id: (data.id as string) || '',
    userId: (data.user_id as string) || '',
    disabilityCategory:
      (data.disability_category as DisabilityCategory) || 'standard',
    preferredFontSize: (data.preferred_font_size as FontSize) || 'medium',
    theme: (data.theme as 'light' | 'dark' | 'system') || 'system',
    voiceEnabled: (data.voice_enabled as boolean) || false,
    highContrast: (data.high_contrast as boolean) || false,
    keyboardNavigation: (data.keyboard_navigation as boolean) ?? true,
    screenReaderSupport: (data.screen_reader_support as boolean) || false,
    readingSpeed:
      (data.reading_speed as 'slow' | 'normal' | 'fast') || 'normal',
    language: (data.language as string) || 'en',
    speechRate: (data.speech_rate as 'slow' | 'normal' | 'fast') || 'normal',
    reducedMotion: (data.reduced_motion as boolean) || false,
    simplifiedLayout: (data.simplified_layout as boolean) || false,
    largeButtons: (data.large_buttons as boolean) || false,
    captionsEnabled: (data.captions_enabled as boolean) ?? true,
    animationsOff: (data.animations_off as boolean) || false,
    preferences: (data.preferences as Record<string, unknown>) || {},
    createdAt: (data.created_at as string) || '',
    updatedAt: (data.updated_at as string) || '',
  }
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfileState] = useState<AccessibilityProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showFirstLoginDialog, setShowFirstLoginDialog] = useState(false)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  const fetchFromBackend = useCallback(async () => {
    const { default: api } = await import('@/services/api')
    const { data } = await api.get('/accessibility/profile')
    return mapApiToProfile(data)
  }, [])

  useEffect(() => {
    async function loadProfile() {
      const stored = localStorage.getItem('accessibilityProfile')
      const firstLoginDone = localStorage.getItem('accessibilityFirstLoginDone')

      if (isAuthenticated && user) {
        try {
          const mapped = await fetchFromBackend()
          setProfileState(mapped)
          localStorage.setItem('accessibilityProfile', JSON.stringify(mapped))
          if (!firstLoginDone) {
            setShowFirstLoginDialog(true)
          }
        } catch {
          if (stored) {
            try {
              setProfileState(JSON.parse(stored))
            } catch {
              setProfileState(DEFAULT_PROFILE)
            }
          } else {
            setProfileState(DEFAULT_PROFILE)
          }
          if (!firstLoginDone) {
            setShowFirstLoginDialog(true)
          }
        }
      } else {
        if (stored) {
          try {
            setProfileState(JSON.parse(stored))
          } catch {
            setProfileState(DEFAULT_PROFILE)
          }
        } else {
          const prefersReduced = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
          ).matches
          setProfileState({ ...DEFAULT_PROFILE, reducedMotion: prefersReduced })
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [isAuthenticated, user, fetchFromBackend])

  const saveToBackend = useCallback(
    async (p: AccessibilityProfile) => {
      if (!isAuthenticated) return
      try {
        const { default: api } = await import('@/services/api')
        await api.put('/accessibility/profile', mapProfileToApi(p))
      } catch {
        // silent fail - localStorage fallback works
      }
    },
    [isAuthenticated]
  )

  const setProfile = useCallback(
    (newProfile: AccessibilityProfile) => {
      setProfileState(newProfile)
      localStorage.setItem('accessibilityProfile', JSON.stringify(newProfile))
      saveToBackend(newProfile)
    },
    [saveToBackend]
  )

  const updateProfile = useCallback(
    (updates: Partial<AccessibilityProfile>) => {
      setProfileState((prev) => {
        if (!prev) return prev
        const updated = { ...prev, ...updates }
        localStorage.setItem('accessibilityProfile', JSON.stringify(updated))
        saveToBackend(updated)
        return updated
      })
    },
    [saveToBackend]
  )

  const dismissFirstLogin = useCallback(() => {
    localStorage.setItem('accessibilityFirstLoginDone', 'true')
    setShowFirstLoginDialog(false)
  }, [])

  const fontSize: FontSize = profile?.preferredFontSize || 'medium'

  const value: AccessibilityContextValue = {
    profile,
    setProfile,
    updateProfile,
    isLoading,
    fontSize,
    isHighContrast: profile?.highContrast ?? false,
    isReducedMotion: profile?.reducedMotion ?? false,
    isVoiceEnabled: profile?.voiceEnabled ?? false,
    isSimplifiedLayout: profile?.simplifiedLayout ?? false,
    areLargeButtons: profile?.largeButtons ?? false,
    areCaptionsEnabled: profile?.captionsEnabled ?? true,
    isScreenReaderSupported: profile?.screenReaderSupport ?? false,
    isKeyboardNavigationEnabled: profile?.keyboardNavigation ?? true,
    areAnimationsOff: profile?.animationsOff ?? false,
    showFirstLoginDialog: showFirstLoginDialog && isAuthenticated,
    dismissFirstLogin,
  }

  const classes = [
    value.isHighContrast ? 'high-contrast' : '',
    value.isReducedMotion ? 'reduce-motion' : '',
    value.isSimplifiedLayout ? 'simplified-layout' : '',
    value.areLargeButtons ? 'large-buttons' : '',
    value.isScreenReaderSupported ? 'screen-reader-support' : '',
    value.isKeyboardNavigationEnabled ? 'keyboard-nav' : '',
    value.areAnimationsOff ? 'animations-off' : '',
    getFontSizeClass(fontSize),
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <AccessibilityContext.Provider value={value}>
      <div className={classes}>{children}</div>
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext)
  if (!context) {
    throw new Error(
      'useAccessibility must be used within an AccessibilityProvider'
    )
  }
  return context
}

export { profileFromCategory, featuresFromCategory, DISABILITY_FEATURE_MAP }
