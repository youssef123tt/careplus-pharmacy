import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { MAX_BUNDLES, MIN_BUNDLES, clampBundles } from '../lib/pricing'

interface Props {
  value: number
  onChange: (value: number) => void
  label?: string
  size?: 'sm' | 'md'
}

/**
 * Bundle quantity input. Only whole numbers between MIN_BUNDLES and MAX_BUNDLES
 * can ever be emitted; free typing is allowed and corrected on blur.
 */
export function QuantityStepper({ value, onChange, label = 'Number of bundles', size = 'md' }: Props) {
  const [draft, setDraft] = useState(String(value))
  // Reset the draft when the value changes from outside (adjusting state during render).
  const [prevValue, setPrevValue] = useState(value)
  if (prevValue !== value) {
    setPrevValue(value)
    setDraft(String(value))
  }

  const commit = (raw: string) => {
    const next = clampBundles(Number.parseInt(raw, 10))
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  const btn = size === 'sm' ? 'size-8' : 'size-10'
  const invalid = draft !== '' && (!/^\d+$/.test(draft) || Number(draft) < MIN_BUNDLES || Number(draft) > MAX_BUNDLES)

  return (
    <div className="inline-flex flex-col">
      <div className={`inline-flex items-center rounded-carton border bg-board ${invalid ? "border-danger" : "border-ink/70"}`}>
        <button
          type="button"
          aria-label="Decrease bundles"
          disabled={value <= MIN_BUNDLES}
          onClick={() => onChange(clampBundles(value - 1))}
          className={`${btn} flex items-center justify-center text-ink hover:bg-board-2 disabled:cursor-not-allowed disabled:text-ink-3/50`}
        >
          <Minus className="size-4" aria-hidden />
        </button>
        <input
          type="number"
          inputMode="numeric"
          aria-label={label}
          min={MIN_BUNDLES}
          max={MAX_BUNDLES}
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={(e) => commit(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
            if (['e', 'E', '+', '-', '.', ','].includes(e.key)) e.preventDefault()
          }}
          className={`price w-12 border-x border-line bg-transparent text-center font-semibold text-ink ${size === 'sm' ? 'h-8 text-sm' : 'h-10'}`}
        />
        <button
          type="button"
          aria-label="Increase bundles"
          disabled={value >= MAX_BUNDLES}
          onClick={() => onChange(clampBundles(value + 1))}
          className={`${btn} flex items-center justify-center text-ink hover:bg-board-2 disabled:cursor-not-allowed disabled:text-ink-3/50`}
        >
          <Plus className="size-4" aria-hidden />
        </button>
      </div>
      {invalid && (
        <span className="mt-1 text-xs text-danger">
          Enter a whole number from {MIN_BUNDLES} to {MAX_BUNDLES}
        </span>
      )}
    </div>
  )
}
