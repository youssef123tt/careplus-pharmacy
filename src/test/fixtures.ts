import type { PricingTier, Product } from '../types'

const tier = (productId: string, id: string, units: number, fils: number, label = ''): PricingTier => ({
  id,
  productId,
  label,
  unitsPerBundle: units,
  bundlePriceFils: fils,
  sortOrder: 0,
})

const base = {
  description: '',
  imageUrl: null,
  brand: { id: 'b1', name: 'VitaWell' },
  category: { id: 'c1', name: 'Vitamins' },
}

/** Product A: one option */
export const productA: Product = { ...base, id: 'A', name: 'Thermometer', tiers: [tier('A', 'A1', 1, 4750)] }

/** Product B: two options */
export const productB: Product = {
  ...base,
  id: 'B',
  name: 'Sanitizer',
  tiers: [tier('B', 'B1', 1, 1250), tier('B', 'B4', 4, 4500)],
}

/** Product C: three options — prices from the brief (5.500 / 19.500 / 55.000 KWD) */
export const productC: Product = {
  ...base,
  id: 'C',
  name: 'Vitamin C',
  tiers: [tier('C', 'C1', 1, 5500, 'Single'), tier('C', 'C4', 4, 19500, 'Value'), tier('C', 'C12', 12, 55000, 'Saver')],
}

export const catalog = [productA, productB, productC]
