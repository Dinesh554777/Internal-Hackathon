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
  ColorBlindType,
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
  const [dyslexiaMode, setDyslexiaMode] = useState(false)
  const [colorBlindMode, setColorBlindMode] = useState<ColorBlindType>('none')

  useEffect(() => {
    const stored = localStorage.getItem('accessibilityProfile')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setProfileState(parsed)
        setDyslexiaMode(parsed.dyslexiaMode ?? false)
        setColorBlindMode(parsed.colorBlindMode ?? 'none')
      } catch {
        setProfileState(DEFAULT_PROFILE)
      }
    } else {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
      setProfileState({ ...DEFAULT_PROFILE, reducedMotion: prefersReduced })
    }
    setIsLoading(false)
  }, [])

  const setProfile = useCallback((newProfile: AccessibilityProfile) => {
    setProfileState(newProfile)
    localStorage.setItem('accessibilityProfile', JSON.stringify(newProfile))
  }, [])

  const updateProfile = useCallback(
    (updates: Partial<AccessibilityProfile>) => {
      setProfileState((prev) => {
        if (!prev) return prev
        const updated = { ...prev, ...updates }
        localStorage.setItem('accessibilityProfile', JSON.stringify(updated))
        return updated
      })
    },
    []
  )

  const getFontSizeClass = (): FontSize =>
    profile?.preferredFontSize || 'medium'

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
    isDyslexiaMode: dyslexiaMode,
    colorBlindMode,
    setDyslexiaMode: setDyslexiaMode,
    setColorBlindMode: setColorBlindMode,
  }

  const fontSizeClass =
    value.fontSize === 'large'
      ? 'text-lg'
      : value.fontSize === 'xlarge'
        ? 'text-xl'
        : value.fontSize === 'small'
          ? 'text-sm'
          : ''

  const colorBlindFilterMap: Record<ColorBlindType, string> = {
    none: 'none',
    protanopia: 'url(#protanopia)',
    deuteranopia: 'url(#deuteranopia)',
    tritanopia: 'url(#tritanopia)',
    achromatopsia: 'url(#achromatopsia)',
  }
  const colorBlindFilter = colorBlindFilterMap[colorBlindMode]

  return (
    <AccessibilityContext.Provider value={value}>
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <filter id="protanopia">
          <feColorMatrix
            type="matrix"
            values="0.567,0.433,0,0,0  0.558,0.442,0,0,0  0,0.242,0.758,0,0  0,0,0,1,0"
          />
        </filter>
        <filter id="deuteranopia">
          <feColorMatrix
            type="matrix"
            values="0.625,0.375,0,0,0  0.7,0.3,0,0,0  0,0.3,0.7,0,0  0,0,0,1,0"
          />
        </filter>
        <filter id="tritanopia">
          <feColorMatrix
            type="matrix"
            values="0.95,0.05,0,0,0  0,0.433,0.567,0,0  0,0.475,0.525,0,0  0,0,0,1,0"
          />
        </filter>
        <filter id="achromatopsia">
          <feColorMatrix
            type="matrix"
            values="0.299,0.587,0.114,0,0  0.299,0.587,0.114,0,0  0.299,0.587,0.114,0,0  0,0,0,1,0"
          />
        </filter>
      </svg>
      <div
        className={[
          value.isHighContrast ? 'high-contrast' : '',
          value.isReducedMotion ? 'reduce-motion' : '',
          value.isSimplifiedLayout ? 'simplified-layout' : '',
          value.areLargeButtons ? 'large-buttons' : '',
          dyslexiaMode ? 'dyslexia-mode' : '',
          fontSizeClass,
        ]
          .filter(Boolean)
          .join(' ')}
        style={
          colorBlindMode !== 'none' ? { filter: colorBlindFilter } : undefined
        }
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
