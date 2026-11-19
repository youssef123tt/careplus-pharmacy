import { Check } from 'lucide-react'
import { formatKWD } from '../lib/money'
import { perPackFils, savingsPercent, tierSizeLabel } from '../lib/pricing'
import type { PricingTier } from '../types'

interface Props {
  tiers: PricingTier[]
  selectedId: string | undefined
  onSelect: (tierId: string) => void
  /** Compact layout for product cards. */
  compact?: boolean
  name: string
}

/** Accessible radio group of bundle offers. Shows bundle price, pack count, per-pack price and savings. */
export function TierSelector({ tiers, selectedId, onSelect, compact = false, name }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">Choose an offer</legend>
      <div className={compact ? 'flex flex-col gap-1.5' : 'grid gap-3 sm:grid-cols-2'}>
        {tiers.map((tier) => {
          const selected = tier.id === selectedId
          const saving = savingsPercent(tier, tiers)
          return (
            <label
              key={tier.id}
              className={`relative flex cursor-pointer items-center justify-between gap-3 rounded-xl border bg-white transition ${
                compact ? 'px-3 py-2' : 'px-4 py-3.5'
              } ${selected ? 'border-brand-600 ring-2 ring-brand-600/20' : 'border-slate-200 hover:border-slate-300'}`}
            >
              <input
                type="radio"
                name={name}
                value={tier.id}
                checked={selected}
                onChange={() => onSelect(tier.id)}
                className="sr-only"
              />
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden
                  className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                    selected ? 'border-brand-700 bg-brand-700 text-white' : 'border-slate-300'
                  }`}
                >
                  {selected && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className={`block font-semibold text-slate-800 ${compact ? 'text-sm' : ''}`}>
                    {tierSizeLabel(tier.unitsPerBundle)}
                    {tier.label && !compact && <span className="font-normal text-slate-500"> · {tier.label}</span>}
                  </span>
                  {!compact && tier.unitsPerBundle > 1 && (
                    <span className="price block text-xs text-slate-500">{formatKWD(perPackFils(tier))} per pack</span>
                  )}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <span className={`price font-bold text-slate-900 ${compact ? 'text-sm' : 'text-base'}`}>
                  {formatKWD(tier.bundlePriceFils)}
                </span>
                {saving > 0 && (
                  <span className="text-xs font-semibold text-emerald-700">Save {saving}%</span>
                )}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
