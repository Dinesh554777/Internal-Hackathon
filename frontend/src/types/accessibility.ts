export type DisabilityCategory =
  | 'blind'
  | 'low_vision'
  | 'motor_disability'
  | 'speech_disability'
  | 'color_blind'
  | 'hearing_impairment'
  | 'cognitive_disability'
  | 'senior_citizen'
  | 'standard'

export type FontSize = 'small' | 'medium' | 'large' | 'xlarge'
export type ReadingSpeed = 'slow' | 'normal' | 'fast'
export type SpeechRate = 'slow' | 'normal' | 'fast'

export interface AccessibilityProfile {
  id: string
  userId: string
  disabilityCategory: DisabilityCategory
  preferredFontSize: FontSize
  theme: 'light' | 'dark' | 'system'
  voiceEnabled: boolean
  highContrast: boolean
  keyboardNavigation: boolean
  screenReaderSupport: boolean
  readingSpeed: ReadingSpeed
  language: string
  speechRate: SpeechRate
  reducedMotion: boolean
  simplifiedLayout: boolean
  largeButtons: boolean
  captionsEnabled: boolean
  animationsOff: boolean
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AccessibilityFeatures {
  largeFont: boolean
  highContrast: boolean
  keyboardNavigation: boolean
  voiceAssistant: boolean
  screenReaderSupport: boolean
  simpleLayout: boolean
  animationsOff: boolean
}

export const DISABILITY_FEATURE_MAP: Record<
  DisabilityCategory,
  AccessibilityFeatures
> = {
  blind: {
    largeFont: true,
    highContrast: true,
    keyboardNavigation: true,
    voiceAssistant: true,
    screenReaderSupport: true,
    simpleLayout: true,
    animationsOff: true,
  },
  low_vision: {
    largeFont: true,
    highContrast: true,
    keyboardNavigation: true,
    voiceAssistant: false,
    screenReaderSupport: true,
    simpleLayout: false,
    animationsOff: false,
  },
  color_blind: {
    largeFont: false,
    highContrast: true,
    keyboardNavigation: true,
    voiceAssistant: false,
    screenReaderSupport: false,
    simpleLayout: false,
    animationsOff: false,
  },
  motor_disability: {
    largeFont: true,
    highContrast: false,
    keyboardNavigation: true,
    voiceAssistant: true,
    screenReaderSupport: false,
    simpleLayout: false,
    animationsOff: false,
  },
  hearing_impairment: {
    largeFont: false,
    highContrast: false,
    keyboardNavigation: true,
    voiceAssistant: true,
    screenReaderSupport: false,
    simpleLayout: false,
    animationsOff: false,
  },
  speech_disability: {
    largeFont: false,
    highContrast: false,
    keyboardNavigation: true,
    voiceAssistant: false,
    screenReaderSupport: true,
    simpleLayout: false,
    animationsOff: false,
  },
  cognitive_disability: {
    largeFont: true,
    highContrast: false,
    keyboardNavigation: true,
    voiceAssistant: false,
    screenReaderSupport: false,
    simpleLayout: true,
    animationsOff: true,
  },
  senior_citizen: {
    largeFont: true,
    highContrast: true,
    keyboardNavigation: true,
    voiceAssistant: false,
    screenReaderSupport: false,
    simpleLayout: true,
    animationsOff: true,
  },
  standard: {
    largeFont: false,
    highContrast: false,
    keyboardNavigation: true,
    voiceAssistant: false,
    screenReaderSupport: false,
    simpleLayout: false,
    animationsOff: false,
  },
}

export const DISABILITY_LABELS: Record<DisabilityCategory, string> = {
  blind: 'Blind',
  low_vision: 'Low Vision',
  motor_disability: 'Motor Disability',
  speech_disability: 'Speech Disability',
  color_blind: 'Color Blind',
  hearing_impairment: 'Hearing Impairment',
  cognitive_disability: 'Cognitive Disability',
  senior_citizen: 'Elderly Mode',
  standard: 'Standard (No Disability)',
}

export const DISABILITY_DESCRIPTIONS: Record<DisabilityCategory, string> = {
  blind: 'Full screen reader support, voice navigation, high contrast',
  low_vision: 'Large fonts, high contrast, screen reader support',
  motor_disability: 'Large buttons, voice control, keyboard navigation',
  speech_disability: 'Keyboard-first, screen reader output',
  color_blind: 'High contrast mode for better differentiation',
  hearing_impairment: 'Visual alerts, captions enabled',
  cognitive_disability: 'Simplified layout, reduced distractions',
  senior_citizen: 'Large text, high contrast, simple layout, no animations',
  standard: 'Default experience with keyboard navigation',
}

export interface AccessibilityContextValue {
  profile: AccessibilityProfile | null
  setProfile: (profile: AccessibilityProfile) => void
  updateProfile: (updates: Partial<AccessibilityProfile>) => void
  isLoading: boolean
  fontSize: FontSize
  isHighContrast: boolean
  isReducedMotion: boolean
  isVoiceEnabled: boolean
  isSimplifiedLayout: boolean
  areLargeButtons: boolean
  areCaptionsEnabled: boolean
  isScreenReaderSupported: boolean
  isKeyboardNavigationEnabled: boolean
  areAnimationsOff: boolean
  showFirstLoginDialog: boolean
  dismissFirstLogin: () => void
}
