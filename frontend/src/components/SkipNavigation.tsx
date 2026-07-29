import { useEffect, useRef } from 'react'

export default function SkipNavigation() {
  const mainRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && e.target === mainRef.current) {
        const main = document.querySelector('main')
        if (main) {
          e.preventDefault()
          main.setAttribute('tabindex', '-1')
          main.focus()
          main.addEventListener(
            'blur',
            () => main.removeAttribute('tabindex'),
            { once: true }
          )
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <a
      ref={mainRef}
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-zinc-900 focus:px-4 focus:py-3 focus:text-sm focus:font-medium focus:text-white focus:shadow-2xl focus:outline-2 focus:outline-offset-2 focus:outline-zinc-500 dark:focus:bg-zinc-50 dark:focus:text-zinc-900"
      aria-label="Skip to main content"
    >
      Skip to main content
    </a>
  )
}
