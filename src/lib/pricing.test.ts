import { describe, expect, it } from 'vitest'
import { productB, productC } from '../test/fixtures'
import {
  clampBundles,
  isValidBundles,
  lineTotalFils,
  packQuantity,
  perPackFils,
  savingsPercent,
  startingPriceFils,
} from './pricing'

describe('bundle pricing', () => {
  const [c1, c4, c12] = productC.tiers

  it('brief example: 2 x 4-pack offer = 8 packs, 39.000 KWD', () => {
    expect(packQuantity(c4.unitsPerBundle, 2)).toBe(8)
    expect(lineTotalFils(c4.bundlePriceFils, 2)).toBe(39000)
  })

  it('uses the bundle price as a TOTAL, never as a per-pack price', () => {
    // wrong logic would be 19.500 x 8 packs = 156.000
    expect(lineTotalFils(c4.bundlePriceFils, 2)).not.toBe(c4.bundlePriceFils * 8)
  })

  it('computes per-pack price and savings vs the single pack', () => {
    expect(perPackFils(c4)).toBe(4875)
    expect(savingsPercent(c1, productC.tiers)).toBe(0)
    expect(savingsPercent(c4, productC.tiers)).toBe(11) // 19.5 vs 22.0
    expect(savingsPercent(c12, productC.tiers)).toBe(17) // 55 vs 66
    expect(savingsPercent(productB.tiers[1], productB.tiers)).toBe(10)
  })

  it('finds the starting price', () => {
    expect(startingPriceFils(productC.tiers)).toBe(5500)
    expect(startingPriceFils([])).toBeNull()
  })

  it('rejects invalid bundle quantities', () => {
    for (const bad of [0, -1, 1.5, 100, NaN, Infinity]) {
      expect(isValidBundles(bad)).toBe(false)
      expect(() => lineTotalFils(1000, bad)).toThrow(RangeError)
    }
    expect(isValidBundles(1)).toBe(true)
    expect(isValidBundles(99)).toBe(true)
  })

  it('clamps user input into the valid range', () => {
    expect(clampBundles(0)).toBe(1)
    expect(clampBundles(-5)).toBe(1)
    expect(clampBundles(3.7)).toBe(3)
    expect(clampBundles(500)).toBe(99)
    expect(clampBundles(NaN)).toBe(1)
  })
})
