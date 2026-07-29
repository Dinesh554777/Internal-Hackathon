import { useState, useCallback, useRef, useEffect } from 'react'

interface SpeechRecognitionHook {
  isListening: boolean
  transcript: string
  isSupported: boolean
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognitionAPI()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const current = event.results[event.results.length - 1]
      if (current.isFinal) {
        setTranscript(current[0].transcript)
      }
    }

    recognition.onerror = (event) => {
      setError(event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [isSupported])

  const start = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    setTranscript('')
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      setError('Failed to start speech recognition')
    }
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const reset = useCallback(() => {
    setTranscript('')
    setError(null)
  }, [])

  return { isListening, transcript, isSupported, error, start, stop, reset }
}
