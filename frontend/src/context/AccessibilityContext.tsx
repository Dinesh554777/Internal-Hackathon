import { createContext, useContext, useEffect, useState } from 'react'
import type {
  AccessibilityProfile,
  AccessibilityContextValue,
  FontSize,
} from '@/types/accessibility'

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
  readingSpeed: 'normal',
  language: 'en',
  speechRate: 'normal',
  reducedMotion: false,
  simplifiedLayout: false,
  largeButtons: false,
  captionsEnabled: true,
  preferences: {},
  createdAt: '',
  updatedAt: '',
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [profile, setProfileState] = useState<AccessibilityProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('accessibilityProfile')
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
      setProfileState({
        ...DEFAULT_PROFILE,
        reducedMotion: prefersReduced,
      })
    }
    setIsLoading(false)
  }, [])

  const setProfile = (newProfile: AccessibilityProfile) => {
    setProfileState(newProfile)
    localStorage.setItem('accessibilityProfile', JSON.stringify(newProfile))
  }

  const updateProfile = (updates: Partial<AccessibilityProfile>) => {
    setProfileState((prev) => {
      if (!prev) return prev
      const updated = { ...prev, ...updates }
      localStorage.setItem('accessibilityProfile', JSON.stringify(updated))
      return updated
    })
  }

  const getFontSizeClass = (): FontSize => {
    return profile?.preferredFontSize || 'medium'
  }

  const value: AccessibilityContextValue = {
    profile,
    setProfile,
    updateProfile,
    isLoading,
    fontSize: getFontSizeClass(),
    isHighContrast: profile?.highContrast ?? false,
    isReducedMotion: profile?.reducedMotion ?? false,
    isVoiceEnabled: profile?.voiceEnabled ?? false,
    isSimplifiedLayout: profile?.simplifiedLayout ?? false,
    areLargeButtons: profile?.largeButtons ?? false,
    areCaptionsEnabled: profile?.captionsEnabled ?? true,
  }

  return (
    <AccessibilityContext.Provider value={value}>
      <div
        className={`${value.isHighContrast ? 'high-contrast' : ''} ${value.isReducedMotion ? 'reduce-motion' : ''} ${value.isSimplifiedLayout ? 'simplified-layout' : ''} ${value.areLargeButtons ? 'large-buttons' : ''} ${
          value.fontSize === 'large'
            ? 'text-lg'
            : value.fontSize === 'xlarge'
              ? 'text-xl'
              : value.fontSize === 'small'
                ? 'text-sm'
                : ''
        }`}
      >
        {children}
      </div>
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
