import { useState, useRef, useEffect } from 'react'
import { Mic, Search, X } from 'lucide-react'
import { useVoice } from '@/context/VoiceContext'
import { useAccessibility } from '@/context/AccessibilityContext'

interface VoiceSearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
  className?: string
}

export default function VoiceSearchBar({
  onSearch,
  placeholder = 'Search products...',
  className = '',
}: VoiceSearchBarProps) {
  const { isVoiceEnabled, areLargeButtons } = useAccessibility()
  const { startListening, stopListening, state, interimText, transcript } =
    useVoice()
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (state === 'listening' && isListening) {
      if (interimText) {
        setInputValue(interimText)
      }
    }
  }, [interimText, state, isListening])

  useEffect(() => {
    if (isListening && state === 'processing') {
      setIsListening(false)
      if (transcript) {
        setInputValue(transcript)
        setShowTranscript(true)
      }
    }
  }, [state, isListening, transcript])

  const handleMicClick = () => {
    if (isListening) {
      stopListening()
      setIsListening(false)
      setShowTranscript(false)
      if (inputValue.trim()) {
        onSearch(inputValue.trim())
      }
    } else {
      setInputValue('')
      setShowTranscript(false)
      setIsListening(true)
      startListening()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue.trim())
      setShowTranscript(false)
    }
  }

  const handleClear = () => {
    setInputValue('')
    setShowTranscript(false)
    if (isListening) {
      stopListening()
      setIsListening(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setShowTranscript(false)
        }}
        placeholder={
          isListening
            ? 'Listening...'
            : showTranscript
              ? 'Searching...'
              : placeholder
        }
        className={`w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-20 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 ${
          areLargeButtons ? 'h-12 text-base' : 'h-10'
        }`}
        aria-label={placeholder}
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-600"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {isVoiceEnabled && (
          <button
            type="button"
            onClick={handleMicClick}
            className={`flex items-center justify-center rounded-lg transition-colors ${
              isListening
                ? 'text-emerald-500 hover:text-emerald-600'
                : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
            } ${areLargeButtons ? 'h-9 w-9' : 'h-8 w-8'}`}
            aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? (
              <div className="relative">
                <Mic className={`${areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'}`} />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
              </div>
            ) : (
              <Mic className={`${areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'}`} />
            )}
          </button>
        )}
      </div>
    </form>
  )
}
