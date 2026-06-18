import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export function Alert({ className, variant = 'default', children, ...props }) {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        variant === 'destructive' && 'border-destructive/50 text-destructive',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function AlertDescription({ className, ...props }) {
  return (
    <div
      className={cn('text-sm [&_p]:leading-relaxed', className)}
      {...props}
    />
  )
}
