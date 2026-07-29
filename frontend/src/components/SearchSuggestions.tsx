import { useEffect, useRef } from 'react'
import { useProductSuggestions } from '@/hooks/useProducts'

interface SearchSuggestionsProps {
  query: string
  onSelect: (suggestion: string) => void
  onClose: () => void
  show: boolean
}

export default function SearchSuggestions({
  query,
  onSelect,
  onClose,
  show,
}: SearchSuggestionsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { data: suggestions = [] } = useProductSuggestions(query)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    if (show) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [show, onClose])

  if (!show || !query || query.length < 2 || suggestions.length === 0)
    return null

  return (
    <div
      ref={ref}
      className="absolute top-full left-0 right-0 z-50 mt-1 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
    >
      <div className="px-3 py-2 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
        Suggestions
      </div>
      {suggestions.map((s, i) => (
        <button
          key={i}
          onClick={() => {
            onSelect(s)
            onClose()
          }}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-zinc-700 transition-colors hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>{s}</span>
        </button>
      ))}
    </div>
  )
}
