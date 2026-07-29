import { useRef, useEffect, useState } from 'react'

let globalAnnounce: (
  message: string,
  priority?: 'polite' | 'assertive'
) => void = () => {}

export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  globalAnnounce(message, priority)
}

export default function ScreenReaderAnnouncements() {
  const [politeMessage, setPoliteMessage] = useState('')
  const [assertiveMessage, setAssertiveMessage] = useState('')
  const politeCounter = useRef(0)
  const assertiveCounter = useRef(0)

  useEffect(() => {
    globalAnnounce = (
      message: string,
      priority: 'polite' | 'assertive' = 'polite'
    ) => {
      if (priority === 'assertive') {
        assertiveCounter.current += 1
        setAssertiveMessage(`${message} [${assertiveCounter.current}]`)
      } else {
        politeCounter.current += 1
        setPoliteMessage(`${message} [${politeCounter.current}]`)
      }
    }
    return () => {
      globalAnnounce = () => {}
    }
  }, [])

  return (
    <>
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </>
  )
}
