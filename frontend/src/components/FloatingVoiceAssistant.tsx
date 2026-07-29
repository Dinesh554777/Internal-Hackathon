import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { useAccessibility } from '@/context/AccessibilityContext'
import { Button } from '@/components/ui/button'

interface VoiceAssistantProps {
  message?: string
  onConfirm?: () => void
  onRetry?: () => void
  onResponse?: (text: string) => void
  listening?: boolean
  transcript?: string
  captions?: string
  showActions?: boolean
}

export default function FloatingVoiceAssistant({
  message = '',
  onConfirm,
  onRetry,
  onResponse,
  listening: externalListening,
  transcript: externalTranscript,
  captions,
  showActions = false,
}: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [inputText, setInputText] = useState('')
  const [showTyping, setShowTyping] = useState(false)
  const { areCaptionsEnabled } = useAccessibility()
  const { isSpeaking, isSupported, cancel } = useSpeechSynthesis()

  const speakMessage = () => {
    if (isSupported && message) {
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.rate = 0.9
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }

  useEffect(() => {
    if (message && isOpen) {
      speakMessage()
    }
  }, [message, isOpen, speakMessage])

  const handleTypingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputText.trim() && onResponse) {
      onResponse(inputText.trim())
      setInputText('')
    }
  }

  const listening = externalListening ?? false
  const transcript = externalTranscript ?? ''

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      role="dialog"
      aria-label="Voice Assistant"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-zinc-200/50 bg-white/90 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/90"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-sm text-white dark:bg-zinc-50 dark:text-zinc-900">
            AI
          </span>
          <span className="text-sm font-medium">Voice Assistant</span>
        </div>
        <div className="flex gap-1">
          {isSpeaking && (
            <Button
              variant="ghost"
              size="sm"
              onClick={cancel}
              className="h-7 px-2 text-xs"
              aria-label="Stop speaking"
            >
              Mute
            </Button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Close voice assistant"
          >
            ×
          </button>
        </div>
      </div>

      {listening && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <span className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Listening...
          </span>
        </div>
      )}

      {areCaptionsEnabled && (
        <div className="mb-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p
            className="text-sm text-zinc-700 dark:text-zinc-300"
            aria-live="assertive"
          >
            {captions || transcript || message}
          </p>
        </div>
      )}

      {showTyping ? (
        <form onSubmit={handleTypingSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Type your response..."
            aria-label="Type your response"
            autoFocus
          />
          <Button type="submit" size="sm">
            Send
          </Button>
        </form>
      ) : (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTyping(true)}
            className="text-xs"
            aria-label="Type instead of speaking"
          >
            Type
          </Button>
          {showActions && (
            <>
              {onConfirm && (
                <Button
                  size="sm"
                  onClick={onConfirm}
                  className="flex-1"
                  aria-label="Confirm"
                >
                  Yes
                </Button>
              )}
              {onRetry && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="flex-1"
                  aria-label="Try again"
                >
                  Try Again
                </Button>
              )}
            </>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
        <span className="text-[10px] text-zinc-400">
          {isSupported ? 'Speech supported' : 'Speech not supported'}
        </span>
        {showTyping && (
          <button
            onClick={() => setShowTyping(false)}
            className="text-[10px] text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Voice mode
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function VoiceAssistantFAB({
  onClick,
  isOpen,
}: {
  onClick: () => void
  isOpen: boolean
}) {
  if (isOpen) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 dark:bg-zinc-50 dark:text-zinc-900"
      aria-label="Open voice assistant"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  )
}
