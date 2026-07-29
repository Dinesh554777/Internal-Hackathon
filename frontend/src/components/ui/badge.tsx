import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900',
        secondary:
          'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100',
        outline:
          'border border-zinc-200 text-zinc-900 dark:border-zinc-700 dark:text-zinc-100',
        success:
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300',
        warning:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
        danger: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        className={cn(badgeVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge, badgeVariants }
