import { useEffect, useRef } from 'react'
import { Button } from './ui'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Modal confirmation built on the native <dialog> element (focus trap + Esc handled by the browser). */
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', loading, onConfirm, onCancel }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal?.()
    if (!open && d.open) d.close?.()
  }, [open])

  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault()
        onCancel()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-carton border border-line bg-board p-0 text-ink shadow-[0_24px_60px_-20px_rgb(0_0_0/0.5)] backdrop:bg-black/55"
    >
      {open && (
        <div className="p-6">
          <h2 className="carton-type text-3xl font-bold text-ink">{title}</h2>
          <p className="mt-2 text-sm text-ink-2">{message}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm} loading={loading}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  )
}
