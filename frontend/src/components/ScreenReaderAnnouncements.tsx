let counter = 0

export function announce(
  message: string,
  priority: 'polite' | 'assertive' = 'polite'
) {
  counter++
  const el = document.getElementById(
    priority === 'assertive' ? 'sr-assertive' : 'sr-polite'
  )
  if (el) {
    el.textContent = `${message} ${counter}`
  }
}

export default function ScreenReaderAnnouncements() {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span id="sr-polite" />
    </div>
  )
}
