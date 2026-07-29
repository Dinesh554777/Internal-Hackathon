import { useState, useCallback, useRef } from 'react'
import { voiceService } from '@/services/voice'
import type { VoiceProcessResponse } from '@/services/voice'

export type VoiceState =
  'idle' | 'listening' | 'processing' | 'speaking' | 'error'

export interface VoiceMessage {
  role: 'user' | 'assistant'
  text: string
  timestamp: number
}

interface UseVoiceAssistantReturn {
  state: VoiceState
  isMuted: boolean
  transcript: string
  messages: VoiceMessage[]
  error: string | null
  lastIntent: VoiceProcessResponse | null
  startListening: () => void
  stopListening: () => void
  processText: (text: string) => Promise<void>
  toggleMute: () => void
  speak: (text: string) => Promise<void>
  reset: () => void
}

export function useVoiceAssistant(): UseVoiceAssistantReturn {
  const [state, setState] = useState<VoiceState>('idle')
  const [isMuted, setIsMuted] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lastIntent, setLastIntent] = useState<VoiceProcessResponse | null>(
    null
  )
  const convIdRef = useRef<string>(crypto.randomUUID())
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isProcessingRef = useRef(false)
  const speechSynthRef = useRef<SpeechSynthesis | null>(null)

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    if (!isMuted && speechSynthRef.current) {
      speechSynthRef.current.cancel()
    }
  }, [isMuted])

  const startListening = useCallback(() => {
    if (isProcessingRef.current) return
    const SpeechRecognitionAPI =
      window.SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.')
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.results[event.results.length - 1]
      const text = current[0].transcript
      setTranscript(text)

      if (current.isFinal) {
        recognition.stop()
        setState('idle')
        const trimmed = text.trim()
        setTranscript(trimmed)
        if (trimmed) {
          setMessages((prev) => [
            ...prev,
            { role: 'user', text: trimmed, timestamp: Date.now() },
          ])
          processText(trimmed)
        }
      }
    }

    recognition.onerror = (event) => {
      setError(`Recognition error: ${event.error}`)
      setState('idle')
      isProcessingRef.current = false
    }

    recognition.onend = () => {
      setState('idle')
      isProcessingRef.current = false
    }

    recognitionRef.current = recognition
    isProcessingRef.current = true
    setTimeout(() => {
      try {
        recognition.start()
        setState('listening')
        setError(null)
      } catch {
        setState('idle')
        isProcessingRef.current = false
      }
    }, 300)
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    isProcessingRef.current = false
    setState('idle')
  }, [])

  const speak = useCallback(
    (text: string): Promise<void> => {
      return new Promise((resolve) => {
        if (isMuted || !('speechSynthesis' in window)) {
          resolve()
          return
        }
        try {
          window.speechSynthesis.cancel()
        } catch {}
        const synth = window.speechSynthesis
        speechSynthRef.current = synth
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = 0.85
        utterance.pitch = 1.0
        utterance.volume = 1.0
        utterance.onstart = () => setState('speaking')
        utterance.onend = () => {
          setState('idle')
          resolve()
        }
        utterance.onerror = () => {
          setState('idle')
          resolve()
        }
        synth.speak(utterance)
      })
    },
    [isMuted]
  )

  const processText = useCallback(
    async (text: string) => {
      setState('processing')
      setError(null)
      try {
        const result = await voiceService.process({
          text,
          conversation_id: convIdRef.current,
        })
        setLastIntent(result)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: result.response, timestamp: Date.now() },
        ])
        setTranscript(result.response)
        if (!isMuted) {
          await speak(result.response)
        }
        return
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Failed to process voice command'
        setError(msg)
        setState('idle')
      }
    },
    [isMuted, speak]
  )

  const reset = useCallback(() => {
    recognitionRef.current?.abort()
    try {
      window.speechSynthesis?.cancel()
    } catch {}
    recognitionRef.current = null
    speechSynthRef.current = null
    isProcessingRef.current = false
    setState('idle')
    setTranscript('')
    setError(null)
    setMessages([])
    setLastIntent(null)
    convIdRef.current = crypto.randomUUID()
    voiceService.clear(convIdRef.current).catch(() => {})
  }, [])

  return {
    state,
    isMuted,
    transcript,
    messages,
    error,
    lastIntent,
    startListening,
    stopListening,
    processText,
    toggleMute,
    speak,
    reset,
  }
}
