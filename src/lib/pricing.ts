import type { PricingTier } from '../types'

/** Limits for how many bundles of one offer can be in the cart. */
export const MIN_BUNDLES = 1
export const MAX_BUNDLES = 99

/** Line total = bundle price x number of bundles. The bundle price is a TOTAL, never per pack. */
export function lineTotalFils(bundlePriceFils: number, bundles: number): number {
  assertValidBundles(bundles)
  return bundlePriceFils * bundles
}

/** Internal pack quantity for a line: 2 bundles of a 4-pack offer = 8 packs. */
export function packQuantity(unitsPerBundle: number, bundles: number): number {
  assertValidBundles(bundles)
  return unitsPerBundle * bundles
}

/** Effective price of one pack inside a bundle, rounded to the nearest fils (display only). */
export function perPackFils(tier: Pick<PricingTier, 'bundlePriceFils' | 'unitsPerBundle'>): number {
  return Math.round(tier.bundlePriceFils / tier.unitsPerBundle)
}

/**
 * Saving of a tier compared with buying the same number of packs from the
 * smallest-bundle offer. Returns 0 when there is no saving.
 */
export function savingsPercent(tier: PricingTier, tiers: PricingTier[]): number {
  const base = smallestTier(tiers)
  if (!base || base.id === tier.id) return 0
  const baseCostForSamePacks = (base.bundlePriceFils / base.unitsPerBundle) * tier.unitsPerBundle
  const saving = 1 - tier.bundlePriceFils / baseCostForSamePacks
  return saving > 0 ? Math.round(saving * 100) : 0
}

export function smallestTier(tiers: PricingTier[]): PricingTier | undefined {
  return tiers.reduce<PricingTier | undefined>(
    (min, t) => (!min || t.unitsPerBundle < min.unitsPerBundle ? t : min),
    undefined,
  )
}

/** Lowest bundle price among the offers ("from X KWD"). */
export function startingPriceFils(tiers: PricingTier[]): number | null {
  if (tiers.length === 0) return null
  return Math.min(...tiers.map((t) => t.bundlePriceFils))
}

export function isValidBundles(n: number): boolean {
  return Number.isInteger(n) && n >= MIN_BUNDLES && n <= MAX_BUNDLES
}

/** Clamp any user input (possibly NaN / decimal / negative) into a valid bundle count. */
export function clampBundles(n: number): number {
  if (!Number.isFinite(n)) return MIN_BUNDLES
  return Math.min(MAX_BUNDLES, Math.max(MIN_BUNDLES, Math.trunc(n)))
}

function assertValidBundles(bundles: number) {
  if (!isValidBundles(bundles)) {
    throw new RangeError(`Bundles must be an integer between ${MIN_BUNDLES} and ${MAX_BUNDLES}, got ${bundles}`)
  }
}

/** Human label for a tier, e.g. "4 packs" or the admin-defined label. */
export function tierSizeLabel(unitsPerBundle: number): string {
  return unitsPerBundle === 1 ? '1 pack' : `${unitsPerBundle} packs`
}
