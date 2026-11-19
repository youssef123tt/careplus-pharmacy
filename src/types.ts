/** Domain types shared across the app. Prices are stored in fils (1 KWD = 1000 fils). */

export interface Brand {
  id: string
  name: string
}

export interface Category {
  id: string
  name: string
}

/** One independent bundle offer: `unitsPerBundle` packs sold together for `bundlePriceFils`. */
export interface PricingTier {
  id: string
  productId: string
  label: string
  unitsPerBundle: number
  /** Total price of the whole bundle (NOT per pack), in fils. */
  bundlePriceFils: number
  sortOrder: number
}

export interface Product {
  id: string
  name: string
  description: string
  imageUrl: string | null
  brand: Brand
  category: Category
  /** Sorted by bundle size ascending. */
  tiers: PricingTier[]
}

/** A line in the cart. Identified by product + tier: different tiers are separate lines. */
export interface CartLine {
  productId: string
  tierId: string
  /** Number of bundles the customer buys (not packs). */
  bundles: number
  /** Snapshot shown if the product/tier is later removed from the catalog. */
  snapshot: {
    productName: string
    tierLabel: string
    unitsPerBundle: number
    bundlePriceFils: number
    imageUrl: string | null
  }
}
