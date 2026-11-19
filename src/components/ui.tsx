import { AlertTriangle, Loader2, PackageOpen, RotateCw } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-action text-action-ink hover:bg-action-hover disabled:opacity-45',
  secondary: 'bg-board text-ink border border-ink/80 hover:bg-board-2 disabled:opacity-45',
  ghost: 'text-ink-2 hover:bg-board-2 hover:text-ink disabled:opacity-40',
  danger: 'bg-danger text-board hover:opacity-90 disabled:opacity-45',
}

export function Button({
  variant = 'primary',
  loading = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-carton px-4 py-2.5 text-sm font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3 py-24 text-ink-2">
      <Loader2 className="size-7 animate-spin text-action" aria-hidden />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof Error ? error.message : 'Something went wrong.'
  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center gap-3 overflow-hidden rounded-carton border border-line bg-board px-6 pb-10 text-center">
      <div className="-mx-6 mb-7 h-1.5 self-stretch bg-band-red" aria-hidden />
      <AlertTriangle className="size-7 text-danger" aria-hidden />
      <p className="carton-type text-2xl font-bold">We couldn't load this</p>
      <p className="text-sm text-ink-2">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="mt-2">
          <RotateCw className="size-4" aria-hidden /> Try again
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ title, message, action }: { title: string; message?: string; action?: ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-carton border border-dashed border-line-2 bg-board px-6 py-14 text-center">
      <PackageOpen className="size-9 text-ink-3" strokeWidth={1.5} aria-hidden />
      <p className="carton-type text-2xl font-bold">{title}</p>
      {message && <p className="max-w-xs text-sm text-ink-2">{message}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function Badge({ children, band }: { children: ReactNode; band?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-carton border border-line bg-board px-2 py-1 text-xs font-semibold text-ink">
      {band && <span className={`size-2.5 rounded-[1px] ${band}`} aria-hidden />}
      {children}
    </span>
  )
}
