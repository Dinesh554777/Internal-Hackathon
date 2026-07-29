import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useVoiceAssistantContext } from '@/context/VoiceAssistantContext'
import { Button } from '@/components/ui/button'
import { useAccessibility } from '@/context/AccessibilityContext'

export default function FloatingVoiceAssistant() {
  const {
    state,
    isMuted,
    isOpen,
    transcript,
    messages,
    error,
    lastIntent,
    startListening,
    stopListening,
    toggleMute,
    close,
  } = useVoiceAssistantContext()
  const { areCaptionsEnabled } = useAccessibility()
  const navigate = useNavigate()

  const getDataValue = (key: string): string | number | undefined => {
    if (!lastIntent?.data) return undefined
    if (Array.isArray(lastIntent.data)) return undefined
    return lastIntent.data[key] as string | number | undefined
  }

  const handleAction = () => {
    if (!lastIntent?.action) return
    switch (lastIntent.action) {
      case 'navigate_home':
        navigate('/shop')
        break
      case 'navigate_cart':
        navigate('/cart')
        break
      case 'navigate_checkout':
        navigate('/checkout')
        break
      case 'navigate_orders':
        navigate('/orders')
        break
      case 'navigate_search': {
        const q =
          (getDataValue('query') as string) ||
          (getDataValue('category') as string) ||
          ''
        navigate(`/search?q=${encodeURIComponent(q)}`)
        break
      }
      case 'navigate_product': {
        const id = getDataValue('id') as string
        if (id) navigate(`/products/${id}`)
        break
      }
    }
  }

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages])
  const displayText =
    lastMessage?.role === 'assistant' ? lastMessage.text : transcript

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      role="dialog"
      aria-label="Voice Shopping Assistant"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 w-72 sm:w-80 rounded-2xl border border-zinc-200/50 bg-white/95 p-4 shadow-2xl backdrop-blur-xl dark:border-zinc-800/50 dark:bg-zinc-950/95"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.span
            animate={state === 'processing' ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              repeat: state === 'processing' ? Infinity : 0,
              duration: 1,
              ease: 'linear',
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-600 text-sm text-white dark:from-zinc-100 dark:to-zinc-400 dark:text-zinc-900"
          >
            AI
          </motion.span>
          <span className="text-sm font-medium">Voice Assistant</span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={toggleMute}
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
              isMuted
                ? 'bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800'
            }`}
            aria-label={
              isMuted ? 'Unmute voice assistant' : 'Mute voice assistant'
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMuted ? (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              ) : (
                <>
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                </>
              )}
            </svg>
          </button>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Close voice assistant"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {displayText && (areCaptionsEnabled || state !== 'speaking') && (
        <div className="mb-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800">
          <p
            className="text-sm text-zinc-700 dark:text-zinc-300"
            aria-live="assertive"
          >
            {displayText}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-3 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {state === 'listening' && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
          <motion.span
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="h-3 w-3 rounded-full bg-green-500"
          />
          <span className="text-sm text-green-700 dark:text-green-300">
            Listening...
          </span>
        </div>
      )}

      {state === 'processing' && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
          <svg
            className="h-4 w-4 animate-spin text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Thinking...
          </span>
        </div>
      )}

      <div className="flex gap-2">
        {state === 'listening' ? (
          <Button
            variant="destructive"
            size="sm"
            onClick={stopListening}
            className="flex-1"
            aria-label="Stop listening"
          >
            Stop Listening
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={startListening}
            disabled={state === 'processing'}
            className="flex-1 gap-2"
            aria-label="Start listening"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
            {state === 'idle' || state === 'speaking' ? 'Start' : 'Start'}
          </Button>
        )}
      </div>

      {lastIntent?.action && lastIntent.action.startsWith('navigate_') && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAction}
            className="w-full text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            aria-label="Execute action"
          >
            Go to {lastIntent.action.replace('navigate_', '')}
          </Button>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2 dark:border-zinc-800">
        <span className="text-[10px] text-zinc-400">{state}</span>
        <span className="text-[10px] text-zinc-400">
          {messages.length} message{messages.length !== 1 ? 's' : ''}
        </span>
      </div>
    </motion.div>
  )
}

export function VoiceAssistantFAB({
  onClick,
  isOpen: isPanelOpen,
}: {
  onClick: () => void
  isOpen: boolean
}) {
  if (isPanelOpen) return null

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-zinc-900 to-zinc-700 text-white shadow-2xl transition-shadow hover:shadow-3xl dark:from-zinc-100 dark:to-zinc-300 dark:text-zinc-900"
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
    </motion.button>
  )
}
