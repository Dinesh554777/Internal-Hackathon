import { useRef } from 'react'

export default function SkipNavigation() {
  const mainRef = useRef<HTMLAnchorElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const main = document.querySelector('main')
    if (main) {
      main.setAttribute('tabindex', '-1')
      main.focus()
      main.addEventListener('blur', () => main.removeAttribute('tabindex'), {
        once: true,
      })
    }
  }

  return (
    <a
      ref={mainRef}
      href="#main-content"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-white focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-zinc-900 focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:bg-zinc-950 dark:focus:text-zinc-100"
    >
      Skip to main content
    </a>
  )
}
