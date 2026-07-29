import { motion } from 'framer-motion'
import { useAccessibility } from '@/context/AccessibilityContext'

interface CheckItem {
  name: string
  description: string
  wcag: string
  level: 'A' | 'AA' | 'AAA'
  status: 'pass' | 'partial' | 'fail' | 'unknown'
  recommendation?: string
}

function getChecks(profile: ReturnType<typeof useAccessibility>): CheckItem[] {
  return [
    {
      name: 'Keyboard Navigation',
      description: 'All functionality is operable through a keyboard interface',
      wcag: '2.1.1',
      level: 'A',
      status: 'pass',
    },
    {
      name: 'Focus Indicators',
      description: 'Visible focus indicator for keyboard focus',
      wcag: '2.4.7',
      level: 'AA',
      status: 'pass',
    },
    {
      name: 'Skip Navigation',
      description: 'Skip to main content link available',
      wcag: '2.4.1',
      level: 'A',
      status: 'pass',
    },
    {
      name: 'ARIA Labels',
      description: 'Interactive elements have accessible names',
      wcag: '4.1.2',
      level: 'A',
      status: 'pass',
    },
    {
      name: 'Color Contrast',
      description: 'Text has sufficient contrast against background',
      wcag: '1.4.3',
      level: 'AA',
      status: profile.isHighContrast ? 'pass' : 'partial',
      recommendation:
        'Enable High Contrast mode for WCAG AAA compliance (7:1 ratio)',
    },
    {
      name: 'Screen Reader Optimization',
      description: 'Content is structured for screen reader navigation',
      wcag: '1.3.1',
      level: 'A',
      status: 'pass',
    },
    {
      name: 'Reduced Motion',
      description: 'Animations can be disabled for vestibular disorders',
      wcag: '2.3.3',
      level: 'AAA',
      status: profile.isReducedMotion ? 'pass' : 'partial',
      recommendation: 'Enable Reduced Motion to prevent vestibular triggers',
    },
    {
      name: 'Text Resize',
      description: 'Text can be resized up to 200% without loss of content',
      wcag: '1.4.4',
      level: 'AA',
      status: profile.fontSize !== 'small' ? 'pass' : 'partial',
      recommendation: 'Consider increasing font size for better readability',
    },
    {
      name: 'Dyslexia-Friendly Mode',
      description: 'Specialized font and spacing for dyslexic users',
      wcag: '3.1.5',
      level: 'AAA',
      status: profile.isDyslexiaMode ? 'pass' : 'partial',
      recommendation: 'Enable Dyslexia Mode for specialized reading support',
    },
    {
      name: 'Color Blind Simulation',
      description: 'Content remains distinguishable when color is removed',
      wcag: '1.4.1',
      level: 'A',
      status: profile.colorBlindMode !== 'none' ? 'pass' : 'unknown',
      recommendation:
        'Test your interface with different Color Blind simulations',
    },
    {
      name: 'Large Buttons',
      description: 'Touch targets are at least 44x44 pixels',
      wcag: '2.5.5',
      level: 'AAA',
      status: profile.areLargeButtons ? 'pass' : 'partial',
      recommendation: 'Enable Large Buttons for better touch accessibility',
    },
    {
      name: 'Captions for Media',
      description: 'Captions provided for all audio/video content',
      wcag: '1.2.2',
      level: 'A',
      status: profile.areCaptionsEnabled ? 'pass' : 'fail',
    },
  ]
}

const statusConfig = {
  pass: {
    label: 'Pass',
    color:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    bar: 'bg-green-500',
  },
  partial: {
    label: 'Partial',
    color:
      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    bar: 'bg-amber-500',
  },
  fail: {
    label: 'Fail',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    bar: 'bg-red-500',
  },
  unknown: {
    label: 'N/A',
    color: 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500',
    bar: 'bg-zinc-300 dark:bg-zinc-600',
  },
}

export default function AccessibilityDashboard() {
  const profile = useAccessibility()
  const checks = getChecks(profile)

  const total = checks.length
  const passed = checks.filter((c) => c.status === 'pass').length
  const partial = checks.filter((c) => c.status === 'partial').length
  const failed = checks.filter((c) => c.status === 'fail').length
  const score = Math.round(((passed + partial * 0.5) / total) * 100)

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Accessibility Score Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          WCAG 2.2 AA compliance overview for your current session
        </p>
      </motion.div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {score}%
          </p>
          <p className="text-xs text-zinc-500">Overall Score</p>
          <div className="mt-2 h-2 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                score >= 80
                  ? 'bg-green-500'
                  : score >= 50
                    ? 'bg-amber-500'
                    : 'bg-red-500'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950/30">
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {passed}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">Passed</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
            {partial}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">Partial</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {failed}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400">Failed</p>
        </div>
      </div>

      <div className="space-y-3">
        {checks.map((check, i) => {
          const cfg = statusConfig[check.status]
          return (
            <motion.div
              key={check.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100">
                      {check.name}
                    </h3>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      {check.wcag}
                    </span>
                    <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                      Level {check.level}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {check.description}
                  </p>
                  {check.recommendation && (
                    <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                      {check.recommendation}
                    </p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium ${cfg.color}`}
                >
                  {cfg.label}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div
                  className={`h-1.5 rounded-full transition-all duration-500 ${cfg.bar}`}
                  style={{
                    width:
                      check.status === 'pass'
                        ? '100%'
                        : check.status === 'partial'
                          ? '50%'
                          : check.status === 'fail'
                            ? '0%'
                            : '25%',
                  }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
