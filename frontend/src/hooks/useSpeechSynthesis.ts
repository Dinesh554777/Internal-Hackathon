import { useState, useCallback, useRef } from 'react'

interface SpeechSynthesisHook {
  isSpeaking: boolean
  isSupported: boolean
  speak: (text: string) => void
  pause: () => void
  resume: () => void
  cancel: () => void
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  const isSupported =
    typeof window !== 'undefined' && 'speechSynthesis' in window

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      utteranceRef.current = utterance
      window.speechSynthesis.speak(utterance)
    },
    [isSupported]
  )

  const pause = useCallback(() => {
    window.speechSynthesis.pause()
  }, [])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  const cancel = useCallback(() => {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  return { isSpeaking, isSupported, speak, pause, resume, cancel }
}
