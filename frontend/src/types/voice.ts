export type VoiceState =
  | 'idle'
  | 'listening'
  | 'processing'
  | 'confirming'
  | 'clarifying'
  | 'executing'
  | 'speaking'
  | 'completed'
  | 'error'

export type VoiceStatusPhase =
  | 'listening'
  | 'understanding'
  | 'confirming'
  | 'executing'
  | 'completed'
  | 'error'

export type ListeningMode = 'push_to_talk' | 'continuous'

export interface VoiceMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

export type Intent =
  | 'SEARCH_PRODUCT'
  | 'FILTER_RESULTS'
  | 'SORT_RESULTS'
  | 'OPEN_PRODUCT'
  | 'READ_PRODUCT'
  | 'COMPARE_PRODUCTS'
  | 'ADD_TO_CART'
  | 'REMOVE_FROM_CART'
  | 'OPEN_CART'
  | 'CHECKOUT'
  | 'PLACE_ORDER'
  | 'TRACK_ORDER'
  | 'CANCEL_ORDER'
  | 'OPEN_PROFILE'
  | 'OPEN_SETTINGS'
  | 'OPEN_CATEGORY'
  | 'GO_HOME'
  | 'GO_BACK'
  | 'GO_FORWARD'
  | 'OPEN_WISHLIST'
  | 'DELETE_WISHLIST'
  | 'HELP'
  | 'STOP'
  | 'REPEAT'
  | 'SCROLL'
  | 'INCREASE_QUANTITY'
  | 'DECREASE_QUANTITY'
  | 'APPLY_COUPON'
  | 'SAVE_FOR_LATER'
  | 'MOVE_TO_WISHLIST'
  | 'CONFIRM'
  | 'CANCEL'
  | 'GREETING'
  | 'UNKNOWN'
  | 'SET_EMAIL'

export interface IntentResult {
  intent: Intent
  confidence: number
  entities: Record<string, unknown>
  response: string
  options?: ClarificationOption[]
}

export interface ClarificationOption {
  label: string
  description?: string
  intent: Intent
  entities?: Record<string, unknown>
  response?: string
}

export interface VoiceCommandResult {
  intent: Intent
  confidence: number
  response: string
  action: string | null
  data: Record<string, unknown> | unknown[] | null
}

export type NavigationCommand =
  | 'home'
  | 'categories'
  | 'cart'
  | 'wishlist'
  | 'orders'
  | 'profile'
  | 'settings'
  | 'accessibility'
  | 'search'
  | 'checkout'
  | 'back'
  | 'forward'
  | 'scroll_up'
  | 'scroll_down'
  | 'product'

export type DisabilityMode =
  | 'blind'
  | 'motor_disability'
  | 'hearing_impairment'
  | 'speech_disability'
  | 'low_vision'
  | 'cognitive_disability'
  | 'senior_citizen'
  | 'none'

export interface VoiceAdaptation {
  speechRate: number
  verbosity: 'minimal' | 'normal' | 'detailed'
  requireConfirmation: boolean
  autoReadPage: boolean
  describeButtons: boolean
  largeText: boolean
  highContrast: boolean
  slowSpeech: boolean
  stepByStep: boolean
  captionsRequired: boolean
  voiceOptional: boolean
}

export interface SuggestedCommand {
  label: string
  command: string
  icon?: string
}

export interface AssistantContext {
  currentPage: string
  currentProductId?: string
  currentCategory?: string
  searchResults?: { id: string; name: string; price?: number }[]
  lastSearchQuery?: string
  lastProductIndex?: number
  lastListedItems?: { name: string; index: number }[]
}

export interface ContextMemoryItem {
  role: 'user' | 'assistant' | 'system'
  intent?: Intent
  text: string
  entities?: Record<string, unknown>
  timestamp: number
}
