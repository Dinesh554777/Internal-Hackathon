import { useAccessibility } from '@/context/AccessibilityContext'
import type {
  FontSize,
  ColorBlindType,
  DisabilityCategory,
} from '@/types/accessibility'

const DISABILITY_LABELS: Record<DisabilityCategory, string> = {
  blind: 'Blind',
  low_vision: 'Low Vision',
  motor_disability: 'Motor Disability',
  speech_disability: 'Speech Disability',
  color_blind: 'Color Blind',
  hearing_impairment: 'Hearing Impairment',
  cognitive_disability: 'Cognitive Disability',
  senior_citizen: 'Elderly',
  standard: 'Standard',
}

export default function AccessibilitySettings() {
  const a11y = useAccessibility()

  const toggleFeature = (key: string) => {
    const val = !(a11y as any)[key]
    a11y.updateProfile({ [key]: val } as any)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        Accessibility Settings
      </h1>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Font Size
        </h2>
        <div className="flex gap-2">
          {(['small', 'medium', 'large', 'xlarge'] as FontSize[]).map(
            (size) => (
              <button
                key={size}
                onClick={() => a11y.updateProfile({ preferredFontSize: size })}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  a11y.fontSize === size
                    ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                    : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
                }`}
              >
                {size.charAt(0).toUpperCase() + size.slice(1)}
              </button>
            )
          )}
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Visual Adjustments
        </h2>
        <div className="space-y-3">
          <ToggleRow
            label="High Contrast"
            description="Increase color contrast for better readability"
            enabled={a11y.isHighContrast}
            onToggle={() => toggleFeature('highContrast')}
          />
          <ToggleRow
            label="Reduced Motion"
            description="Disable animations and motion effects"
            enabled={a11y.isReducedMotion}
            onToggle={() => toggleFeature('reducedMotion')}
          />
          <ToggleRow
            label="Simplified Layout"
            description="Remove complex layouts and distractions"
            enabled={a11y.isSimplifiedLayout}
            onToggle={() => toggleFeature('simplifiedLayout')}
          />
          <ToggleRow
            label="Large Buttons"
            description="Increase touch target sizes"
            enabled={a11y.areLargeButtons}
            onToggle={() => toggleFeature('largeButtons')}
          />
          <ToggleRow
            label="Captions"
            description="Show captions for audio and video content"
            enabled={a11y.areCaptionsEnabled}
            onToggle={() => toggleFeature('captionsEnabled')}
          />
          <ToggleRow
            label="Dyslexia-Friendly Mode"
            description="Specialized font, letter spacing, and line height"
            enabled={a11y.isDyslexiaMode}
            onToggle={() => a11y.setDyslexiaMode(!a11y.isDyslexiaMode)}
          />
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Color Blind Simulation
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Simulate different types of color blindness to test your interface
        </p>
        <div className="flex flex-wrap gap-2">
          {(
            [
              'none',
              'protanopia',
              'deuteranopia',
              'tritanopia',
              'achromatopsia',
            ] as ColorBlindType[]
          ).map((type) => (
            <button
              key={type}
              onClick={() => a11y.setColorBlindMode(type)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                a11y.colorBlindMode === type
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              {type === 'none'
                ? 'Off'
                : type === 'protanopia'
                  ? 'Protanopia (Red)'
                  : type === 'deuteranopia'
                    ? 'Deuteranopia (Green)'
                    : type === 'tritanopia'
                      ? 'Tritanopia (Blue)'
                      : 'Achromatopsia (Grayscale)'}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Disability Profile
        </h2>
        <div className="flex flex-wrap gap-2">
          {(
            Object.entries(DISABILITY_LABELS) as [DisabilityCategory, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => a11y.updateProfile({ disabilityCategory: key })}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                a11y.profile?.disabilityCategory === key
                  ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900'
                  : 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Settings are saved locally. Sign in to sync across devices.
        </p>
      </div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 ${enabled ? 'bg-zinc-900 dark:bg-zinc-50' : 'bg-zinc-200 dark:bg-zinc-700'}`}
      >
        <span
          className="block h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
          style={{
            transform: enabled ? 'translateX(22px)' : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  )
}
