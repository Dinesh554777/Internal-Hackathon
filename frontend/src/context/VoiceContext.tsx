import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react'
import type {
  VoiceState,
  VoiceMessage,
  ListeningMode,
  Intent,
  IntentResult,
  SuggestedCommand,
  AssistantContext,
  DisabilityMode,
} from '@/types/voice'
import {
  speechRecognition,
  type RecognitionCallbacks,
} from '@/services/speechRecognition'
import { speechSynthesis } from '@/services/speechSynthesis'
import { voiceService } from '@/services/voice'
import {
  parseLocally,
  requiresConfirmation,
  mapResponseToIntent,
} from '@/services/intentParser'
import { routeIntent } from '@/services/voiceCommandRouter'
import { accessibilityVoiceManager } from '@/services/accessibilityVoiceManager'
import { useAccessibility } from '@/context/AccessibilityContext'
import type { DisabilityCategory } from '@/types/accessibility'

interface VoiceContextValue {
  state: VoiceState
  transcript: string
  messages: VoiceMessage[]
  error: string | null
  isMuted: boolean
  isPanelOpen: boolean
  listeningMode: ListeningMode
  interimText: string
  confidence: number
  suggestedCommands: SuggestedCommand[]
  pendingConfirmation: boolean
  pendingIntent: Intent | null
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  processText: (text: string) => Promise<void>
  speak: (text: string) => Promise<void>
  toggleMute: () => void
  repeat: () => void
  stopSpeaking: () => void
  setMode: (mode: ListeningMode) => void
  clearHistory: () => void
  openPanel: () => void
  closePanel: () => void
  togglePanel: () => void
  confirmAction: () => void
  cancelAction: () => void
  setAssistantContext: (ctx: Partial<AssistantContext>) => void
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

const SUGGESTED_COMMANDS: SuggestedCommand[] = [
  { label: 'Search products', command: 'Search laptops' },
  { label: 'Go to cart', command: 'Open cart' },
  { label: 'Help', command: 'What can you do' },
  { label: 'Go home', command: 'Go home' },
]

const MAX_MESSAGES = 50

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { profile, isVoiceEnabled } = useAccessibility()
  const [state, setState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [listeningMode, setListeningMode] =
    useState<ListeningMode>('push_to_talk')
  const [interimText, setInterimText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [suggestedCommands] = useState<SuggestedCommand[]>(SUGGESTED_COMMANDS)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null)
  const [_assistantCtx] = useState<AssistantContext>({
    currentPage: window.location.pathname,
  })

  const conversationIdRef = useRef<string>(
    crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  const lastProcessedRef = useRef('')
  const isProcessingRef = useRef(false)

  useEffect(() => {
    const adaptation = accessibilityVoiceManager.getAdaptation()
    speechSynthesis.rate = adaptation.speechRate
  }, [profile?.disabilityCategory])

  useEffect(() => {
    if (profile?.disabilityCategory) {
      const modeMap: Record<DisabilityCategory, DisabilityMode> = {
        blind: 'blind',
        low_vision: 'low_vision',
        motor_disability: 'motor_disability',
        speech_disability: 'speech_disability',
        color_blind: 'none',
        hearing_impairment: 'hearing_impairment',
        cognitive_disability: 'cognitive_disability',
        senior_citizen: 'senior_citizen',
        standard: 'none',
      }
      accessibilityVoiceManager.setMode(
        modeMap[profile.disabilityCategory] || 'none'
      )
    }
  }, [profile?.disabilityCategory])

  const addMessage = useCallback((role: 'user' | 'assistant', text: string) => {
    setMessages((prev) => {
      const next = [...prev, { role, text, timestamp: Date.now() }]
      return next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next
    })
  }, [])

  const handleRecognitionResult: RecognitionCallbacks['onResult'] = useCallback(
    (text, isFinal, conf) => {
      if (isFinal) {
        const trimmed = text.trim().toLowerCase()
        if (trimmed === lastProcessedRef.current || isProcessingRef.current)
          return
        lastProcessedRef.current = trimmed
        setTranscript(text)
        setConfidence(conf)
        setInterimText('')
        addMessage('user', text)
        setState('processing')
        isProcessingRef.current = true

        const local = parseLocally(text)
        if (local && local.confidence >= 0.7) {
          handleIntent(local)
        } else {
          processViaBackend(text)
        }
      } else {
        setInterimText(text)
        setConfidence(conf)
      }
    },
    [addMessage]
  )

  const handleRecognitionError: RecognitionCallbacks['onError'] = useCallback(
    (err) => {
      setError(err)
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    },
    []
  )

  const handleRecognitionState: RecognitionCallbacks['onStateChange'] =
    useCallback((s) => setState(s), [])

  useEffect(() => {
    speechRecognition.setCallbacks({
      onResult: handleRecognitionResult,
      onError: handleRecognitionError,
      onStateChange: handleRecognitionState,
    })
  }, [handleRecognitionResult, handleRecognitionError, handleRecognitionState])

  const handleSynthesisStart = useCallback(() => {
    setState('speaking')
  }, [])

  const handleSynthesisEnd = useCallback(() => {
    setState((prev) => (prev === 'speaking' ? 'idle' : prev))
  }, [])

  const handleSynthesisBoundary = useCallback((text: string) => {
    setTranscript(text)
  }, [])

  useEffect(() => {
    speechSynthesis.setCallbacks({
      onStart: handleSynthesisStart,
      onEnd: handleSynthesisEnd,
      onPause: () => {},
      onResume: () => {},
      onBoundary: handleSynthesisBoundary,
    })
  }, [handleSynthesisStart, handleSynthesisEnd, handleSynthesisBoundary])

  const speak = useCallback(
    async (text: string) => {
      if (isMuted || !text) return
      addMessage('assistant', text)
      speechSynthesis.speak(text)
    },
    [isMuted, addMessage]
  )

  const handleIntent = useCallback(
    async (result: IntentResult) => {
      const action = routeIntent(result.intent, result)

      if (requiresConfirmation(result.intent, result.confidence)) {
        setPendingConfirmation(true)
        setPendingIntent(result.intent)
        const confirmText = `${result.response} Would you like me to continue?`
        await speak(confirmText)
        isProcessingRef.current = false
        return
      }

      setPendingConfirmation(false)
      setPendingIntent(null)

      if (result.response && action.type !== 'stop') {
        await speak(result.response)
      }

      if (action.type === 'stop') {
        speechSynthesis.cancel()
      } else if (action.type === 'repeat') {
        speechSynthesis.repeat()
      }

      isProcessingRef.current = false
    },
    [speak]
  )

  const processViaBackend = useCallback(
    async (text: string) => {
      try {
        const resp = await voiceService.process({
          text,
          conversation_id: conversationIdRef.current,
        })
        const result = mapResponseToIntent(resp)
        await handleIntent(result)
      } catch {
        const local = parseLocally(text)
        if (local) {
          await handleIntent(local)
        } else {
          await speak("I didn't understand that. Could you please repeat?")
        }
      }
      isProcessingRef.current = false
    },
    [handleIntent, speak]
  )

  const processText = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessingRef.current) return
      setState('processing')
      isProcessingRef.current = true
      addMessage('user', text)

      const local = parseLocally(text)
      if (local && local.confidence >= 0.7) {
        await handleIntent(local)
      } else {
        await processViaBackend(text)
      }
    },
    [addMessage, handleIntent, processViaBackend]
  )

  const startListening = useCallback(() => {
    if (!isVoiceEnabled) return
    setError(null)
    lastProcessedRef.current = ''
    speechRecognition.start()
  }, [isVoiceEnabled])

  const stopListening = useCallback(() => {
    speechRecognition.stop()
  }, [])

  const toggleListening = useCallback(() => {
    if (state === 'listening') stopListening()
    else startListening()
  }, [state, startListening, stopListening])

  const toggleMute = useCallback(() => {
    setIsMuted((v) => {
      if (!v) speechSynthesis.cancel()
      return !v
    })
  }, [])

  const repeat = useCallback(() => {
    speechSynthesis.repeat()
  }, [])

  const stopSpeaking = useCallback(() => {
    speechSynthesis.cancel()
  }, [])

  const setMode = useCallback((mode: ListeningMode) => {
    setListeningMode(mode)
    speechRecognition.setMode(mode)
  }, [])

  const clearHistory = useCallback(() => {
    setMessages([])
    setTranscript('')
    setError(null)
    speechRecognition.stop()
    speechSynthesis.cancel()
    voiceService.clear(conversationIdRef.current).catch(() => {})
    conversationIdRef.current = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    isProcessingRef.current = false
    lastProcessedRef.current = ''
    setState('idle')
  }, [])

  const confirmAction = useCallback(() => {
    setPendingConfirmation(false)
    if (pendingIntent) {
      const result: IntentResult = {
        intent: pendingIntent,
        confidence: 1.0,
        entities: {},
        response: 'Proceeding...',
      }
      handleIntent(result)
    }
    setPendingIntent(null)
  }, [pendingIntent, handleIntent])

  const cancelAction = useCallback(() => {
    setPendingConfirmation(false)
    setPendingIntent(null)
    speak('Cancelled.')
  }, [speak])

  const setAssistantContext = useCallback((_ctx: Partial<AssistantContext>) => {
    // context tracking available via parent
  }, [])

  useEffect(() => {
    return () => {
      speechRecognition.destroy()
      speechSynthesis.destroy()
    }
  }, [])

  const value: VoiceContextValue = {
    state,
    transcript,
    messages,
    error,
    isMuted,
    isPanelOpen,
    listeningMode,
    interimText,
    confidence,
    suggestedCommands,
    pendingConfirmation,
    pendingIntent,
    startListening,
    stopListening,
    toggleListening,
    processText,
    speak,
    toggleMute,
    repeat,
    stopSpeaking,
    setMode,
    clearHistory,
    openPanel: () => setIsPanelOpen(true),
    closePanel: () => setIsPanelOpen(false),
    togglePanel: () => setIsPanelOpen((v) => !v),
    confirmAction,
    cancelAction,
    setAssistantContext,
  }

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error('useVoice must be used within VoiceProvider')
  return ctx
}
