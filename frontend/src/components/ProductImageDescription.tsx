import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { useImageDescription } from '@/hooks/useImageDescription'
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis'
import { Button } from '@/components/ui/button'

interface ProductImageDescriptionProps {
  productId: string
  productName: string
}

export default function ProductImageDescription({
  productId,
}: ProductImageDescriptionProps) {
  const { data, isLoading, isError, error } = useImageDescription(productId)
  const { isSpeaking, speak, cancel, isSupported } = useSpeechSynthesis()

  const handleReadAloud = useCallback(() => {
    if (!data?.description) return
    if (isSpeaking) {
      cancel()
    } else {
      speak(data.description)
    }
  }, [data, isSpeaking, speak, cancel])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900"
      >
        <div className="flex items-center gap-3">
          <svg
            className="h-5 w-5 animate-spin text-zinc-400"
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
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Generating image description for accessibility...
          </span>
        </div>
      </motion.div>
    )
  }

  if (isError) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-600 dark:text-red-400">
          {error instanceof Error
            ? error.message
            : 'Could not generate image description.'}
        </p>
      </div>
    )
  }

  if (!data?.description) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50 to-white p-4 dark:border-zinc-800 dark:from-zinc-900 dark:to-zinc-950"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-zinc-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            AI Image Description
          </span>
          {data.source === 'vision' && (
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              Vision
            </span>
          )}
          {data.source === 'metadata' && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Auto-generated
            </span>
          )}
        </div>
        {isSupported && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReadAloud}
            className="gap-1.5 text-xs"
            aria-label={
              isSpeaking ? 'Stop reading description' : 'Read description aloud'
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
              {isSpeaking ? (
                <rect x="6" y="4" width="4" height="16" />
              ) : (
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              )}
              {isSpeaking ? (
                <rect x="14" y="4" width="4" height="16" />
              ) : (
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              )}
            </svg>
            {isSpeaking ? 'Stop' : 'Read Aloud'}
          </Button>
        )}
      </div>
      <p
        className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
        aria-live="polite"
        tabIndex={0}
        role="region"
        aria-label="AI-generated product description for accessibility"
      >
        {data.description}
      </p>
    </motion.div>
  )
}
