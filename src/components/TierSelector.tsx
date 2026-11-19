import { formatKWD } from '../lib/money'
import { perPackFils, savingsPercent } from '../lib/pricing'
import type { PricingTier } from '../types'

interface Props {
  tiers: PricingTier[]
  selectedId: string | undefined
  onSelect: (tierId: string) => void
  /** Compact layout for product cards. */
  compact?: boolean
  name: string
}

/**
 * Bundle offers as "strength chips" on the carton's side panel: the pack count
 * is the largest figure, the bundle total sits under it. Native radio group for a11y.
 */
export function TierSelector({ tiers, selectedId, onSelect, compact = false, name }: Props) {
  return (
    <fieldset>
      <legend className="sr-only">Choose an offer</legend>
      <div
        className={
          compact
            ? 'grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-1.5'
            : 'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5'
        }
      >
        {tiers.map((tier) => {
          const selected = tier.id === selectedId
          const saving = savingsPercent(tier, tiers)
          const unit = tier.unitsPerBundle === 1 ? 'pack' : 'packs'
          return (
            <label
              key={tier.id}
              className={`group relative flex cursor-pointer flex-col rounded-carton border transition-[color,background-color,border-color,transform] duration-150 ease-out active:scale-[0.97] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${
                compact ? 'px-2.5 pb-2 pt-1.5' : 'px-4 pb-3.5 pt-3'
              } ${
                selected
                  ? 'border-ink bg-ink text-board'
                  : 'border-line-2 bg-board text-ink hover:border-ink'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={tier.id}
                checked={selected}
                onChange={() => onSelect(tier.id)}
                className="sr-only"
              />
              <span className="flex items-baseline gap-1">
                <span className={`carton-type price font-bold ${compact ? 'text-[1.75rem]' : 'text-5xl'}`}>{tier.unitsPerBundle}</span>{' '}
                <span className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>{unit}</span>
              </span>
              {!compact && tier.label && (
                <span className={`mt-0.5 text-sm ${selected ? 'text-board/75' : 'text-ink-2'}`}>{tier.label}</span>
              )}
              <span className={`price font-semibold ${compact ? 'mt-0.5 text-[13px]' : 'mt-2.5 text-lg'}`}>
                {formatKWD(tier.bundlePriceFils)}
              </span>
              {!compact && tier.unitsPerBundle > 1 && (
                <span className={`price text-xs ${selected ? 'text-board/75' : 'text-ink-3'}`}>
                  {formatKWD(perPackFils(tier))} per pack
                </span>
              )}
              {saving > 0 && (
                <span
                  className={`font-semibold ${compact ? 'text-[11px]' : 'mt-1.5 text-xs'} ${
                    selected ? 'text-board/90' : 'text-save'
                  }`}
                >
                  Save {saving}%
                </span>
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
