import { z } from 'zod'
import type { CartLine, PricingTier, Product } from '../types'
import { clampBundles, isValidBundles, lineTotalFils, packQuantity } from './pricing'

/**
 * Cart business logic as pure functions (easy to unit test).
 *
 * Rules from the brief:
 *  - A cart line is identified by product + pricing tier, so different offers
 *    of the same product are always separate lines.
 *  - The quantity stored per line is the number of BUNDLES.
 *  - Pack quantity is derived: unitsPerBundle x bundles.
 *  - Line total is bundle price x bundles (bundle price is a total, not per pack).
 */

export interface CartState {
  lines: CartLine[]
}

export type CartAction =
  | { type: 'add'; product: Product; tier: PricingTier; bundles: number }
  | { type: 'setBundles'; key: string; bundles: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }
  | { type: 'replace'; state: CartState }

export const emptyCart: CartState = { lines: [] }

export function lineKey(productId: string, tierId: string): string {
  return `${productId}:${tierId}`
}

export const keyOf = (line: Pick<CartLine, 'productId' | 'tierId'>) => lineKey(line.productId, line.tierId)

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const { product, tier } = action
      if (tier.productId !== product.id) return state
      const bundles = clampBundles(action.bundles)
      const key = lineKey(product.id, tier.id)
      const snapshot = {
        productName: product.name,
        tierLabel: tier.label,
        unitsPerBundle: tier.unitsPerBundle,
        bundlePriceFils: tier.bundlePriceFils,
        imageUrl: product.imageUrl,
      }
      const existing = state.lines.find((l) => keyOf(l) === key)
      if (existing) {
        return {
          lines: state.lines.map((l) =>
            keyOf(l) === key ? { ...l, bundles: clampBundles(l.bundles + bundles), snapshot } : l,
          ),
        }
      }
      return { lines: [...state.lines, { productId: product.id, tierId: tier.id, bundles, snapshot }] }
    }
    case 'setBundles': {
      if (!Number.isFinite(action.bundles)) return state
      const bundles = clampBundles(action.bundles)
      return { lines: state.lines.map((l) => (keyOf(l) === action.key ? { ...l, bundles } : l)) }
    }
    case 'remove':
      return { lines: state.lines.filter((l) => keyOf(l) !== action.key) }
    case 'clear':
      return emptyCart
    case 'replace':
      return action.state
  }
}

// ---------------------------------------------------------------------------
// Resolving cart lines against the live catalog
// ---------------------------------------------------------------------------

export interface ResolvedLine {
  key: string
  line: CartLine
  /** 'unavailable' when the product or the tier no longer exists in the catalog. */
  status: 'ok' | 'unavailable'
  /** True when the live bundle price differs from the price at the time it was added. */
  priceChanged: boolean
  product?: Product
  productName: string
  tierLabel: string
  imageUrl: string | null
  unitsPerBundle: number
  bundlePriceFils: number
  bundles: number
  packs: number
  lineTotalFils: number
}

/** Always price the cart with the CURRENT catalog prices; fall back to the snapshot for display only. */
export function resolveLines(lines: CartLine[], products: Product[] | undefined): ResolvedLine[] {
  const byId = new Map((products ?? []).map((p) => [p.id, p]))
  return lines.map((line) => {
    const product = byId.get(line.productId)
    const tier = product?.tiers.find((t) => t.id === line.tierId)
    const bundles = clampBundles(line.bundles)
    if (!product || !tier) {
      return {
        key: keyOf(line),
        line,
        status: products ? 'unavailable' : 'ok',
        priceChanged: false,
        productName: line.snapshot.productName,
        tierLabel: line.snapshot.tierLabel,
        imageUrl: line.snapshot.imageUrl,
        unitsPerBundle: line.snapshot.unitsPerBundle,
        bundlePriceFils: line.snapshot.bundlePriceFils,
        bundles,
        packs: packQuantity(line.snapshot.unitsPerBundle, bundles),
        lineTotalFils: lineTotalFils(line.snapshot.bundlePriceFils, bundles),
      }
    }
    return {
      key: keyOf(line),
      line,
      status: 'ok',
      priceChanged:
        tier.bundlePriceFils !== line.snapshot.bundlePriceFils ||
        tier.unitsPerBundle !== line.snapshot.unitsPerBundle,
      product,
      productName: product.name,
      tierLabel: tier.label,
      imageUrl: product.imageUrl,
      unitsPerBundle: tier.unitsPerBundle,
      bundlePriceFils: tier.bundlePriceFils,
      bundles,
      packs: packQuantity(tier.unitsPerBundle, bundles),
      lineTotalFils: lineTotalFils(tier.bundlePriceFils, bundles),
    }
  })
}

export interface CartSummary {
  lineCount: number
  totalBundles: number
  totalPacks: number
  totalFils: number
}

/** Totals over the lines that can actually be bought (unavailable lines are excluded). */
export function summarize(resolved: ResolvedLine[]): CartSummary {
  return resolved
    .filter((r) => r.status === 'ok')
    .reduce<CartSummary>(
      (acc, r) => ({
        lineCount: acc.lineCount + 1,
        totalBundles: acc.totalBundles + r.bundles,
        totalPacks: acc.totalPacks + r.packs,
        totalFils: acc.totalFils + r.lineTotalFils,
      }),
      { lineCount: 0, totalBundles: 0, totalPacks: 0, totalFils: 0 },
    )
}

// ---------------------------------------------------------------------------
// Persistence (the cart is per-browser; the catalog lives in the database)
// ---------------------------------------------------------------------------

export const CART_STORAGE_KEY = 'careplus.cart.v1'

const cartLineSchema = z.object({
  productId: z.string().min(1),
  tierId: z.string().min(1),
  bundles: z.number().refine(isValidBundles),
  snapshot: z.object({
    productName: z.string(),
    tierLabel: z.string(),
    unitsPerBundle: z.number().int().positive(),
    bundlePriceFils: z.number().int().positive(),
    imageUrl: z.string().nullable(),
  }),
})

/** Parse stored JSON defensively: invalid or tampered lines are dropped, never crash the app. */
export function parseStoredCart(raw: string | null): CartState {
  if (!raw) return emptyCart
  try {
    const data: unknown = JSON.parse(raw)
    const lines = (data as { lines?: unknown })?.lines
    if (!Array.isArray(lines)) return emptyCart
    const valid: CartLine[] = []
    const seen = new Set<string>()
    for (const candidate of lines) {
      const parsed = cartLineSchema.safeParse(candidate)
      if (parsed.success && !seen.has(keyOf(parsed.data))) {
        seen.add(keyOf(parsed.data))
        valid.push(parsed.data)
      }
    }
    return { lines: valid }
  } catch {
    return emptyCart
  }
}
