import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  useVoiceAssistant,
  type VoiceState,
  type VoiceMessage,
} from '@/hooks/useVoiceAssistant'
import type { VoiceProcessResponse } from '@/services/voice'

interface VoiceAssistantContextValue {
  state: VoiceState
  isMuted: boolean
  isOpen: boolean
  transcript: string
  messages: VoiceMessage[]
  error: string | null
  lastIntent: VoiceProcessResponse | null
  startListening: () => void
  stopListening: () => void
  processText: (text: string) => Promise<void>
  toggleMute: () => void
  speak: (text: string) => Promise<void>
  open: () => void
  close: () => void
  toggleOpen: () => void
  reset: () => void
}

const VoiceAssistantContext = createContext<VoiceAssistantContextValue | null>(
  null
)

export function VoiceAssistantProvider({ children }: { children: ReactNode }) {
  const voice = useVoiceAssistant()
  const [isOpen, setIsOpen] = useState(true)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggleOpen = useCallback(() => setIsOpen((v) => !v), [])

  return (
    <VoiceAssistantContext.Provider
      value={{
        ...voice,
        isOpen,
        open,
        close,
        toggleOpen,
      }}
    >
      {children}
    </VoiceAssistantContext.Provider>
  )
}

export function useVoiceAssistantContext(): VoiceAssistantContextValue {
  const ctx = useContext(VoiceAssistantContext)
  if (!ctx) {
    throw new Error(
      'useVoiceAssistantContext must be used within VoiceAssistantProvider'
    )
  }
  return ctx
}
