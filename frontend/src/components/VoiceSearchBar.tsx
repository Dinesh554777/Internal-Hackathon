import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Search } from 'lucide-react'
import { speechRecognition } from '@/services/speechRecognition'
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
  const [isListening, setIsListening] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const setTranscript = (text: string) => setInputValue(text)

  useEffect(() => {
    speechRecognition.setCallbacks({
      onResult: (text, isFinal, _confidence) => {
        if (isFinal) {
          setTranscript(text)
          setInputValue(text)
          setIsListening(false)
          speechRecognition.stop()
          onSearch(text)
        } else {
          setInputValue(text)
        }
      },
      onError: () => {
        setIsListening(false)
      },
      onStateChange: (s) => {
        if (s === 'idle' || s === 'error') setIsListening(false)
      },
    })
  }, [onSearch])

  const handleMicClick = () => {
    if (isListening) {
      speechRecognition.stop()
      setIsListening(false)
      if (inputValue.trim()) {
        onSearch(inputValue.trim())
      }
    } else {
      setTranscript('')
      setIsListening(true)
      speechRecognition.setMode('push_to_talk')
      speechRecognition.start()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim()) {
      onSearch(inputValue.trim())
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={isListening ? 'Listening...' : placeholder}
        className={`w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-12 text-sm placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 ${
          areLargeButtons ? 'h-12 text-base' : 'h-10'
        }`}
        aria-label={placeholder}
      />
      {isVoiceEnabled && (
        <button
          type="button"
          onClick={handleMicClick}
          className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-lg transition-colors ${
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
            <MicOff className={`${areLargeButtons ? 'h-5 w-5' : 'h-4 w-4'}`} />
          )}
        </button>
      )}
    </form>
  )
}
