import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  RotateCcw,
  Square,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Send,
  HelpCircle,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useVoice } from '@/context/VoiceContext'
import { useAccessibility } from '@/context/AccessibilityContext'
import type { VoiceStatusPhase } from '@/types/voice'

export function VoiceAssistantFAB() {
  const { isPanelOpen, openPanel, state } = useVoice()
  const { areLargeButtons } = useAccessibility()

  if (isPanelOpen) return null

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={openPanel}
      className={`fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:shadow-xl ${
        areLargeButtons ? 'h-16 w-16' : 'h-14 w-14'
      }`}
      aria-label="Open voice assistant"
    >
      <Mic className={areLargeButtons ? 'h-7 w-7' : 'h-6 w-6'} />
      {state === 'listening' && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500" />
        </span>
      )}
    </motion.button>
  )
}

function StatusIndicator({ phase }: { phase: VoiceStatusPhase }) {
  const config: Record<
    VoiceStatusPhase,
    { icon: React.ReactNode; label: string; color: string }
  > = {
    listening: {
      icon: <Mic className="h-3.5 w-3.5" />,
      label: 'Listening',
      color: 'text-emerald-500',
    },
    understanding: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: 'Understanding',
      color: 'text-blue-500',
    },
    confirming: {
      icon: <HelpCircle className="h-3.5 w-3.5" />,
      label: 'Confirming',
      color: 'text-amber-500',
    },
    executing: {
      icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
      label: 'Executing',
      color: 'text-purple-500',
    },
    completed: {
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Completed',
      color: 'text-emerald-500',
    },
    error: {
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Error',
      color: 'text-red-500',
    },
  }

  const c = config[phase]
  return (
    <span className={`flex items-center gap-1 text-xs font-medium ${c.color}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

function WaveBars() {
  return (
    <div className="flex items-center justify-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="h-3 w-1 animate-pulse rounded-full bg-emerald-400"
          style={{
            animationDelay: `${i * 0.15}s`,
            height: `${12 + Math.sin(i * 1.5) * 10}px`,
          }}
        />
      ))}
    </div>
  )
}

export default function VoiceAssistantPanel() {
  const {
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
    clarificationOptions,
    currentCaptions,
    failedAttempts,
    startListening,
    toggleListening,
    toggleMute,
    repeat,
    stopSpeaking,
    setMode,
    clearHistory,
    closePanel,
    togglePanel,
    confirmAction,
    cancelAction,
    selectClarificationOption,
    processText,
    setFailedAttempts,
  } = useVoice()
  const { areLargeButtons, areCaptionsEnabled, isVoiceEnabled } =
    useAccessibility()
  const [showHistory, setShowHistory] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [inputText, setInputText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, showHistory])

  useEffect(() => {
    if (failedAttempts >= 2) {
      inputRef.current?.focus()
    }
  }, [failedAttempts])

  useEffect(() => {
    if (state === 'listening') {
      setFailedAttempts(0)
    }
  }, [state, setFailedAttempts])

  if (!isPanelOpen) return null

  const phase: VoiceStatusPhase =
    state === 'listening'
      ? 'listening'
      : state === 'processing'
        ? 'understanding'
        : state === 'confirming' || state === 'clarifying'
          ? 'confirming'
          : state === 'executing'
            ? 'executing'
            : state === 'completed'
              ? 'completed'
              : state === 'error'
                ? 'error'
                : 'listening'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-zinc-200/50 bg-white shadow-2xl dark:border-zinc-800/50 dark:bg-zinc-900 ${
        areLargeButtons ? 'w-[440px]' : 'w-[400px]'
      } max-h-[680px]`}
      role="dialog"
      aria-label="Voice Assistant"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200/50 px-4 py-3 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            AI Shopping Assistant
          </span>
          <StatusIndicator phase={phase} />
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label={showHistory ? 'Hide history' : 'Show history'}
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            />
          </button>
          <button
            onClick={toggleMute}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isMuted
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50'
                : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800'
            }`}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={closePanel}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"
            aria-label="Close assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {showHistory ? (
          /* History View */
          <div className="space-y-3">
            {messages.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">
                No conversation yet. Start by speaking or typing.
              </p>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Status View */
          <div className="flex flex-col items-center justify-center py-4">
            {/* Idle State */}
            {state === 'idle' && !error && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-950 dark:to-cyan-950">
                  <Mic className="h-8 w-8 text-blue-500" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Tap the mic and start talking
                </p>
                <p className="mt-1 text-xs text-zinc-400">
                  Try "Search laptops" or "Open cart"
                </p>
              </div>
            )}

            {/* Listening State */}
            {state === 'listening' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                      <Mic className="h-8 w-8 text-emerald-500" />
                    </div>
                  </div>
                </div>
                <WaveBars />
                {interimText && (
                  <p className="mt-3 max-w-sm text-sm italic text-zinc-600 dark:text-zinc-400">
                    {interimText}
                  </p>
                )}
                {confidence > 0 && (
                  <p className="mt-1 text-xs text-zinc-400">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            )}

            {/* Processing / Understanding State */}
            {state === 'processing' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Understanding...
                </p>
                {transcript && (
                  <p className="mt-2 max-w-sm text-sm text-zinc-700 dark:text-zinc-300">
                    "{transcript}"
                  </p>
                )}
              </div>
            )}

            {/* Confirming State */}
            {state === 'confirming' && (
              <div className="w-full text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                  <HelpCircle className="h-8 w-8 text-amber-500" />
                </div>
                {currentCaptions && (
                  <p className="mb-4 max-w-sm text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {currentCaptions}
                  </p>
                )}
              </div>
            )}

            {/* Clarifying State */}
            {state === 'clarifying' && (
              <div className="w-full text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950">
                  <HelpCircle className="h-8 w-8 text-amber-500" />
                </div>
                {currentCaptions && (
                  <p className="mb-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {currentCaptions}
                  </p>
                )}
              </div>
            )}

            {/* Executing State */}
            {state === 'executing' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  Executing...
                </p>
              </div>
            )}

            {/* Completed State */}
            {state === 'completed' && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                </div>
                {currentCaptions && (
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {currentCaptions}
                  </p>
                )}
              </div>
            )}

            {/* Error State */}
            {state === 'error' && error && (
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <p className="text-sm font-medium text-red-500">{error}</p>
                <button
                  onClick={startListening}
                  className="mt-2 text-xs text-blue-500 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Captions */}
      {areCaptionsEnabled &&
        currentCaptions &&
        state === 'speaking' &&
        !showHistory && (
          <div className="mx-4 mb-2 rounded-lg bg-zinc-50 px-3 py-2 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {currentCaptions}
          </div>
        )}

      {/* Clarification Options */}
      {clarificationOptions.length > 0 && (
        <div className="mx-4 mb-2 space-y-1.5">
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            Did you mean:
          </p>
          {clarificationOptions.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectClarificationOption(opt)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              <span className="font-medium">{opt.label}</span>
              {opt.description && (
                <span className="ml-2 text-xs text-zinc-400">
                  {opt.description}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Confirmation */}
      {pendingConfirmation && !clarificationOptions.length && (
        <div className="mx-4 mb-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/50">
          <div className="mb-2 text-center text-sm text-amber-700 dark:text-amber-400">
            {currentCaptions || 'Confirm this action?'}
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={confirmAction}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Yes
            </button>
            <button
              onClick={cancelAction}
              className="rounded-lg bg-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              No
            </button>
            <button
              onClick={repeat}
              className="rounded-lg bg-zinc-200 px-4 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
            >
              Repeat
            </button>
          </div>
        </div>
      )}

      {/* Text Fallback */}
      {failedAttempts >= 2 && (
        <div className="mx-4 mb-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-center text-xs text-amber-600 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-400">
          I couldn't understand clearly. Type your request below.
        </div>
      )}

      {/* Suggested Commands */}
      {listeningMode === 'continuous' &&
        state !== 'listening' &&
        state !== 'processing' &&
        state !== 'confirming' &&
        state !== 'clarifying' &&
        state !== 'executing' && (
          <div className="mx-4 mb-2">
            <div className="flex flex-wrap gap-1.5">
              {suggestedCommands.slice(0, 4).map((cmd) => (
                <button
                  key={cmd.command}
                  onClick={() => processText(cmd.command)}
                  className="rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  {cmd.label}
                </button>
              ))}
            </div>
          </div>
        )}

      {/* Input Bar */}
      <div className="border-t border-zinc-200/50 p-3 dark:border-zinc-800/50">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleListening}
            disabled={!isVoiceEnabled}
            className={`flex items-center justify-center rounded-xl font-medium text-white shadow-sm transition-all active:scale-95 disabled:opacity-50 ${
              areLargeButtons ? 'h-12 w-12' : 'h-10 w-10'
            } ${
              state === 'listening'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-md'
            }`}
            aria-label={
              state === 'listening' ? 'Stop listening' : 'Start listening'
            }
          >
            {state === 'listening' ? (
              <Square className={areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'} />
            ) : (
              <Mic className={areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'} />
            )}
          </button>

          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputText.trim()) {
                  processText(inputText.trim())
                  setInputText('')
                  setFailedAttempts(0)
                }
              }}
              placeholder="Type a command..."
              className={`w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 text-zinc-700 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 ${
                areLargeButtons ? 'h-12 text-sm' : 'h-10 text-xs'
              }`}
              aria-label="Type a command"
            />
            {inputText.trim() && (
              <button
                onClick={() => {
                  processText(inputText.trim())
                  setInputText('')
                  setFailedAttempts(0)
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            onClick={repeat}
            disabled={messages.length === 0}
            className={`flex items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-30 dark:hover:bg-zinc-800 ${
              areLargeButtons ? 'h-12 w-12' : 'h-10 w-10'
            }`}
            aria-label="Repeat last message"
          >
            <RotateCcw className={areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'} />
          </button>

          <button
            onClick={stopSpeaking}
            disabled={state !== 'speaking' && state !== 'executing'}
            className={`flex items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-30 dark:hover:bg-zinc-800 ${
              areLargeButtons ? 'h-12 w-12' : 'h-10 w-10'
            }`}
            aria-label="Stop"
          >
            <Square className={areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'} />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={() =>
              setMode(
                listeningMode === 'continuous' ? 'push_to_talk' : 'continuous'
              )
            }
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
              listeningMode === 'continuous'
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
            }`}
          >
            {listeningMode === 'continuous' ? 'Continuous' : 'Push to Talk'}
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={clearHistory}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              Clear
            </button>
            <button
              onClick={togglePanel}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
            >
              {showHistory ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronUp className="h-3 w-3" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
