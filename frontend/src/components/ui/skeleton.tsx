import { cn } from '@/lib/utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
}

export function Skeleton({
  className,
  variant = 'text',
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-zinc-200 dark:bg-zinc-800',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'h-4 w-full rounded',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      {...props}
    />
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200/50 bg-white/80 p-0 shadow-sm dark:border-zinc-800/50 dark:bg-zinc-950/80">
      <Skeleton variant="rectangular" className="aspect-square rounded-t-2xl" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}

export function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton variant="rectangular" className="aspect-square rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-3">
            <Skeleton
              variant="rectangular"
              className="h-12 flex-1 rounded-xl"
            />
            <Skeleton variant="rectangular" className="h-12 w-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}
