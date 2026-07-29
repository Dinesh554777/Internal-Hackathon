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
  VoiceStatusPhase,
  ClarificationOption,
  ContextMemoryItem,
} from '@/types/voice'
import {
  speechRecognition,
  type RecognitionCallbacks,
} from '@/services/speechRecognition'
import { speechSynthesis } from '@/services/speechSynthesis'
import { voiceService } from '@/services/voice'
import {
  parseLocally,
  parseWithClarification,
  shouldAutoExecute,
  needsConfirmation,
  isTooUncertain,
  mapResponseToIntent,
} from '@/services/intentParser'
import { executeIntent } from '@/services/voiceCommandExecutor'
import { accessibilityVoiceManager } from '@/services/accessibilityVoiceManager'
import { useAccessibility } from '@/context/AccessibilityContext'
import type { DisabilityCategory } from '@/types/accessibility'

interface VoiceContextValue {
  state: VoiceState
  statusPhase: VoiceStatusPhase
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
  clarificationOptions: ClarificationOption[]
  currentCaptions: string
  failedAttempts: number
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
  selectClarificationOption: (option: ClarificationOption) => void
  setAssistantContext: (ctx: Partial<AssistantContext>) => void
  setFailedAttempts: (n: number) => void
}

const VoiceContext = createContext<VoiceContextValue | null>(null)

const SUGGESTED_COMMANDS: SuggestedCommand[] = [
  { label: 'Search laptops', command: 'Search laptops' },
  { label: 'Go to cart', command: 'Open cart' },
  { label: 'Help', command: 'What can you do' },
  { label: 'Go home', command: 'Go home' },
  { label: 'Search under 5000', command: 'Search products under 5000' },
]

const MAX_MESSAGES = 100
const MAX_CONTEXT_ITEMS = 30

export function VoiceProvider({ children }: { children: ReactNode }) {
  const { profile, isVoiceEnabled } = useAccessibility()
  const [state, setState] = useState<VoiceState>('idle')
  const [statusPhase, setStatusPhase] = useState<VoiceStatusPhase>('listening')
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [listeningMode, setListeningMode] =
    useState<ListeningMode>('continuous')
  const [interimText, setInterimText] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [suggestedCommands] = useState<SuggestedCommand[]>(SUGGESTED_COMMANDS)
  const [pendingConfirmation, setPendingConfirmation] = useState(false)
  const [pendingIntent, setPendingIntent] = useState<Intent | null>(null)
  const [pendingEntities, setPendingEntities] = useState<
    Record<string, unknown>
  >({})
  const [pendingResponse, setPendingResponse] = useState('')
  const [clarificationOptions, setClarificationOptions] = useState<
    ClarificationOption[]
  >([])
  const [currentCaptions, setCurrentCaptions] = useState('')
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [assistantCtx, setAssistantCtx] = useState<AssistantContext>({
    currentPage: window.location.pathname,
  })
  const contextMemoryRef = useRef<ContextMemoryItem[]>([])

  const conversationIdRef = useRef<string>(
    crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  )
  const lastProcessedRef = useRef('')
  const isProcessingRef = useRef(false)
  const lastSpeechTimeRef = useRef(0)

  useEffect(() => {
    const observation = new MutationObserver(() => {
      setAssistantCtx((prev) => ({
        ...prev,
        currentPage: window.location.pathname,
      }))
    })
    const pushState = history.pushState.bind(history)
    history.pushState = (...args) => {
      pushState(...args)
      setAssistantCtx((prev) => ({
        ...prev,
        currentPage: window.location.pathname,
      }))
    }
    const replaceState = history.replaceState.bind(history)
    history.replaceState = (...args) => {
      replaceState(...args)
      setAssistantCtx((prev) => ({
        ...prev,
        currentPage: window.location.pathname,
      }))
    }
    window.addEventListener('popstate', () => {
      setAssistantCtx((prev) => ({
        ...prev,
        currentPage: window.location.pathname,
      }))
    })
    observation.observe(
      document.querySelector('title') || document.documentElement,
      {
        subtree: true,
        characterData: true,
        childList: true,
      }
    )
    return () => {
      observation.disconnect()
      history.pushState = pushState
      history.replaceState = replaceState
    }
  }, [])

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

  const addContextMemory = useCallback(
    (
      role: ContextMemoryItem['role'],
      text: string,
      intent?: Intent,
      entities?: Record<string, unknown>
    ) => {
      contextMemoryRef.current = [
        ...contextMemoryRef.current,
        { role, text, intent, entities, timestamp: Date.now() },
      ].slice(-MAX_CONTEXT_ITEMS)
    },
    []
  )

  const getContextSummary = useCallback((): string => {
    const items = contextMemoryRef.current.slice(-10)
    return items.map((i) => `${i.role}: ${i.text}`).join('\n')
  }, [])

  const setCurrentTranscript = useCallback((text: string) => {
    setTranscript(text)
    setCurrentCaptions(text)
  }, [])

  const handleRecognitionResult: RecognitionCallbacks['onResult'] = useCallback(
    (text, isFinal, conf) => {
      if (state === 'speaking' && isFinal) {
        return
      }

      if (isFinal) {
        const now = Date.now()
        if (now - lastSpeechTimeRef.current < 500) return
        lastSpeechTimeRef.current = now

        const trimmed = text.trim()
        if (!trimmed) return

        const normalized = trimmed.toLowerCase()
        if (normalized === lastProcessedRef.current || isProcessingRef.current)
          return
        lastProcessedRef.current = normalized
        setTranscript(trimmed)
        setConfidence(conf)
        setInterimText('')
        addMessage('user', trimmed)
        addContextMemory('user', trimmed)
        setStatusPhase('understanding')
        setState('processing')
        isProcessingRef.current = true

        processCommand(trimmed, conf)
      } else {
        setInterimText(text)
        setConfidence(conf)
      }
    },
    [state, addMessage, addContextMemory]
  )

  const handleRecognitionError: RecognitionCallbacks['onError'] = useCallback(
    (err) => {
      setError(err)
      setStatusPhase('error')
      setState('error')
      setTimeout(() => {
        setState('idle')
        setStatusPhase('listening')
      }, 2000)
    },
    []
  )

  const handleRecognitionState: RecognitionCallbacks['onStateChange'] =
    useCallback((s) => {
      if (s !== 'listening' && s !== 'idle') return
      setState((prev) => {
        if (prev === 'listening' || prev === 'idle') return s
        return prev
      })
    }, [])

  useEffect(() => {
    speechRecognition.setCallbacks({
      onResult: handleRecognitionResult,
      onError: handleRecognitionError,
      onStateChange: handleRecognitionState,
    })
  }, [handleRecognitionResult, handleRecognitionError, handleRecognitionState])

  const handleSynthesisStart = useCallback(() => {
    setState('speaking')
    setStatusPhase('listening')
  }, [])

  const handleSynthesisEnd = useCallback(() => {
    setState((prev) => (prev === 'speaking' ? 'idle' : prev))
    if (listeningMode === 'continuous') {
      setTimeout(() => {
        if (!isProcessingRef.current) {
          speechRecognition.start()
        }
      }, 100)
    }
  }, [listeningMode])

  const handleSynthesisWord = useCallback(
    (_charIndex: number, _charLength: number) => {},
    []
  )

  const handleSynthesisBoundary = useCallback(
    (text: string) => {
      setCurrentCaptions(text)
    },
    [setCurrentCaptions]
  )

  useEffect(() => {
    speechSynthesis.setCallbacks({
      onStart: handleSynthesisStart,
      onEnd: handleSynthesisEnd,
      onPause: () => {},
      onResume: () => {},
      onBoundary: handleSynthesisBoundary,
      onWord: handleSynthesisWord,
    })
  }, [
    handleSynthesisStart,
    handleSynthesisEnd,
    handleSynthesisBoundary,
    handleSynthesisWord,
  ])

  const processCommand = useCallback(
    async (text: string, conf: number) => {
      setFailedAttempts(0)

      let result: IntentResult | null = null

      if (conf >= 0.7) {
        result = parseLocally(text)
      }

      if (!result) {
        try {
          const contextSummary = getContextSummary()
          const resp = await voiceService.process({
            text,
            conversation_id: conversationIdRef.current,
            context: contextSummary,
          })
          result = mapResponseToIntent(resp)
        } catch {
          result = parseWithClarification(text, 0)
        }
      }

      if (!result) {
        result = parseWithClarification(text, 0)
      }

      await handleIntentResult(result, text)
    },
    [getContextSummary]
  )

  const processText = useCallback(
    async (text: string) => {
      if (!text.trim() || isProcessingRef.current) return
      const trimmed = text.trim()
      setState('processing')
      setStatusPhase('understanding')
      isProcessingRef.current = true
      addMessage('user', trimmed)
      addContextMemory('user', trimmed)

      let result = parseLocally(trimmed)
      if (!result) {
        result = parseWithClarification(trimmed, 0)
      }

      await handleIntentResult(result, trimmed)
    },
    [addMessage, addContextMemory]
  )

  const handleIntentResult = useCallback(
    async (result: IntentResult, originalText: string) => {
      addContextMemory(
        'assistant',
        result.response,
        result.intent,
        result.entities
      )

      if (result.intent === 'CONFIRM') {
        if (pendingConfirmation) {
          setPendingConfirmation(false)
          setStatusPhase('executing')
          setState('executing')
          const finalResult: IntentResult = {
            intent: pendingIntent!,
            confidence: 1.0,
            entities: pendingEntities,
            response: pendingResponse || 'Proceeding...',
          }
          await executeAndRespond(finalResult)
        }
        isProcessingRef.current = false
        return
      }

      if (result.intent === 'CANCEL') {
        setPendingConfirmation(false)
        setPendingIntent(null)
        setPendingEntities({})
        setPendingResponse('')
        setClarificationOptions([])
        await speakText('Cancelled.')
        isProcessingRef.current = false
        return
      }

      if (result.intent === 'STOP') {
        speechSynthesis.cancel()
        setPendingConfirmation(false)
        setClarificationOptions([])
        isProcessingRef.current = false
        return
      }

      if (result.intent === 'REPEAT') {
        speechSynthesis.repeat()
        isProcessingRef.current = false
        return
      }

      if (result.intent === 'SET_EMAIL') {
        setPendingConfirmation(true)
        setPendingIntent('SET_EMAIL')
        setPendingEntities(result.entities)
        setPendingResponse(result.response)
        setState('confirming')
        setStatusPhase('confirming')
        await speakText(result.response)
        isProcessingRef.current = false
        return
      }

      if (
        result.intent === 'UNKNOWN' &&
        result.options &&
        result.options.length > 0
      ) {
        setClarificationOptions(result.options)
        setState('clarifying')
        setStatusPhase('confirming')
        await speakText(
          result.response || "I'm not sure. Did you mean one of these?"
        )
        isProcessingRef.current = false
        return
      }

      if (isTooUncertain(result.confidence)) {
        setFailedAttempts((prev) => {
          const next = prev + 1
          if (next >= 2) {
            speakText(
              "I couldn't understand clearly. You can type your request below."
            )
            return next
          }
          speakText("Sorry, I didn't catch that. Could you please repeat?")
          return next
        })
        isProcessingRef.current = false
        return
      }

      if (shouldAutoExecute(result.confidence) && !result.options) {
        if (result.intent === 'GREETING' || result.intent === 'HELP') {
          await speakText(result.response)
          isProcessingRef.current = false
          return
        }
        setState('executing')
        setStatusPhase('executing')
        await executeAndRespond(result)
        isProcessingRef.current = false
        return
      }

      if (
        needsConfirmation(result.confidence) ||
        requiresConfirmation(result)
      ) {
        setPendingConfirmation(true)
        setPendingIntent(result.intent)
        setPendingEntities(result.entities)
        setPendingResponse(result.response)
        setState('confirming')
        setStatusPhase('confirming')
        await speakText(`${result.response} Should I proceed?`)
        isProcessingRef.current = false
        return
      }

      await speakText(result.response)
      isProcessingRef.current = false
    },
    [pendingConfirmation, pendingIntent, pendingEntities, pendingResponse]
  )

  function requiresConfirmation(result: IntentResult): boolean {
    return [
      'CHECKOUT',
      'PLACE_ORDER',
      'CANCEL_ORDER',
      'DELETE_WISHLIST',
      'ADD_TO_CART',
    ].includes(result.intent)
  }

  const executeAndRespond = useCallback(
    async (result: IntentResult) => {
      const execution = executeIntent(result.intent, result)

      if (execution.action === 'stop') {
        speechSynthesis.cancel()
        setStatusPhase('completed')
        setTimeout(() => setStatusPhase('listening'), 500)
        return
      }

      if (execution.action === 'repeat') {
        speechSynthesis.repeat()
        setStatusPhase('completed')
        setTimeout(() => setStatusPhase('listening'), 500)
        return
      }

      if (execution.response) {
        await speakText(execution.response)
      }

      setStatusPhase('completed')
      setCurrentTranscript(
        execution.success
          ? execution.response || 'Done!'
          : 'Something went wrong.'
      )
      setTimeout(() => {
        setStatusPhase('listening')
      }, 1000)
    },
    [setCurrentTranscript]
  )

  const speakText = useCallback(
    async (text: string) => {
      if (isMuted || !text) return
      addMessage('assistant', text)
      setCurrentCaptions(text)
      speechSynthesis.speak(text)
    },
    [isMuted, addMessage, setCurrentCaptions]
  )

  const speak = useCallback(
    async (text: string) => {
      await speakText(text)
    },
    [speakText]
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
    setCurrentCaptions('')
    setError(null)
    setClarificationOptions([])
    setPendingConfirmation(false)
    setPendingIntent(null)
    setPendingEntities({})
    setPendingResponse('')
    setFailedAttempts(0)
    speechRecognition.stop()
    speechSynthesis.cancel()
    voiceService.clear(conversationIdRef.current).catch(() => {})
    contextMemoryRef.current = []
    conversationIdRef.current = crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    isProcessingRef.current = false
    lastProcessedRef.current = ''
    lastSpeechTimeRef.current = 0
    setState('idle')
    setStatusPhase('listening')
  }, [setCurrentCaptions])

  const confirmAction = useCallback(() => {
    setPendingConfirmation(false)
    if (pendingIntent) {
      setState('executing')
      setStatusPhase('executing')
      const result: IntentResult = {
        intent: pendingIntent,
        confidence: 1.0,
        entities: pendingEntities,
        response: pendingResponse || 'Proceeding...',
      }
      executeAndRespond(result)
    }
    setPendingIntent(null)
    setPendingEntities({})
    setPendingResponse('')
  }, [pendingIntent, pendingEntities, pendingResponse, executeAndRespond])

  const cancelAction = useCallback(() => {
    setPendingConfirmation(false)
    setPendingIntent(null)
    setPendingEntities({})
    setPendingResponse('')
    setClarificationOptions([])
    speakText('Cancelled.')
  }, [speakText])

  const selectClarificationOption = useCallback(
    async (option: ClarificationOption) => {
      setClarificationOptions([])
      const result: IntentResult = {
        intent: option.intent,
        confidence: 1.0,
        entities: option.entities || {},
        response: option.response || 'Proceeding...',
      }
      addContextMemory(
        'assistant',
        result.response,
        result.intent,
        result.entities
      )
      setState('executing')
      setStatusPhase('executing')
      await executeAndRespond(result)
    },
    [addContextMemory, executeAndRespond]
  )

  useEffect(() => {
    return () => {
      speechRecognition.destroy()
      speechSynthesis.destroy()
    }
  }, [])

  const value: VoiceContextValue = {
    state,
    statusPhase,
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
    clarificationOptions,
    currentCaptions,
    failedAttempts,
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
    selectClarificationOption,
    setAssistantContext: (ctx: Partial<AssistantContext>) =>
      setAssistantCtx((prev) => ({ ...prev, ...ctx })),
    setFailedAttempts,
  }

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>
}

export function useVoice(): VoiceContextValue {
  const ctx = useContext(VoiceContext)
  if (!ctx) throw new Error('useVoice must be used within VoiceProvider')
  return ctx
}
