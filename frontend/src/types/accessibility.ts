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
  readingSpeed: ReadingSpeed
  language: string
  speechRate: SpeechRate
  reducedMotion: boolean
  simplifiedLayout: boolean
  largeButtons: boolean
  captionsEnabled: boolean
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
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
}
