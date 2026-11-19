import { describe, expect, it } from 'vitest'
import { catalog, productA, productC } from '../test/fixtures'
import { cartReducer, emptyCart, lineKey, parseStoredCart, resolveLines, summarize, type CartState } from './cart'

const [c1, c4, c12] = productC.tiers
const add = (state: CartState, product = productC, tier = c4, bundles = 1) =>
  cartReducer(state, { type: 'add', product, tier, bundles })

describe('cart reducer', () => {
  it('keeps different tiers of the same product as separate lines', () => {
    let s = add(emptyCart, productC, c1)
    s = add(s, productC, c4)
    s = add(s, productC, c12)
    expect(s.lines).toHaveLength(3)
    expect(new Set(s.lines.map((l) => l.tierId))).toEqual(new Set(['C1', 'C4', 'C12']))
  })

  it('merges the same product + tier into one line', () => {
    let s = add(emptyCart, productC, c4, 1)
    s = add(s, productC, c4, 1)
    expect(s.lines).toHaveLength(1)
    expect(s.lines[0].bundles).toBe(2)
  })

  it('updates quantity and clamps to valid bounds', () => {
    let s = add(emptyCart)
    const key = lineKey('C', 'C4')
    s = cartReducer(s, { type: 'setBundles', key, bundles: 5 })
    expect(s.lines[0].bundles).toBe(5)
    s = cartReducer(s, { type: 'setBundles', key, bundles: 0 })
    expect(s.lines[0].bundles).toBe(1)
    s = cartReducer(s, { type: 'setBundles', key, bundles: 1000 })
    expect(s.lines[0].bundles).toBe(99)
    s = cartReducer(s, { type: 'setBundles', key, bundles: NaN })
    expect(s.lines[0].bundles).toBe(99) // NaN is ignored
  })

  it('caps merged quantities at the maximum', () => {
    let s = add(emptyCart, productC, c4, 98)
    s = add(s, productC, c4, 5)
    expect(s.lines[0].bundles).toBe(99)
  })

  it('removes a line and clears the cart', () => {
    let s = add(add(emptyCart, productC, c1), productC, c4)
    s = cartReducer(s, { type: 'remove', key: lineKey('C', 'C1') })
    expect(s.lines.map((l) => l.tierId)).toEqual(['C4'])
    expect(cartReducer(s, { type: 'clear' }).lines).toEqual([])
  })

  it('ignores a tier that does not belong to the product', () => {
    expect(add(emptyCart, productA, c4).lines).toHaveLength(0)
  })
})

describe('cart totals', () => {
  it('brief example: 2 x 4-pack shows 8 packs and 39.000 KWD', () => {
    const s = add(emptyCart, productC, c4, 2)
    const [line] = resolveLines(s.lines, catalog)
    expect(line.bundles).toBe(2)
    expect(line.packs).toBe(8)
    expect(line.lineTotalFils).toBe(39000)
  })

  it('sums multiple lines and offers', () => {
    let s = add(emptyCart, productC, c4, 2) // 39.000, 8 packs
    s = add(s, productC, c12, 1) // 55.000, 12 packs
    s = add(s, productA, productA.tiers[0], 3) // 3 x 4.750 = 14.250, 3 packs
    const summary = summarize(resolveLines(s.lines, catalog))
    expect(summary).toEqual({ lineCount: 3, totalBundles: 6, totalPacks: 23, totalFils: 108250 })
  })

  it('prices with live catalog data and flags price changes', () => {
    const s = add(emptyCart, productC, c4, 2)
    const updated = {
      ...productC,
      tiers: productC.tiers.map((t) => (t.id === 'C4' ? { ...t, bundlePriceFils: 18000 } : t)),
    }
    const [line] = resolveLines(s.lines, [updated])
    expect(line.priceChanged).toBe(true)
    expect(line.lineTotalFils).toBe(36000)
  })

  it('marks lines unavailable when the tier was deleted and excludes them from totals', () => {
    const s = add(add(emptyCart, productC, c4, 2), productA, productA.tiers[0], 1)
    const withoutC4 = [productA, { ...productC, tiers: productC.tiers.filter((t) => t.id !== 'C4') }]
    const resolved = resolveLines(s.lines, withoutC4)
    expect(resolved[0].status).toBe('unavailable')
    expect(summarize(resolved).totalFils).toBe(4750)
  })

  it('uses the snapshot while the catalog is still loading', () => {
    const s = add(emptyCart, productC, c4, 2)
    const [line] = resolveLines(s.lines, undefined)
    expect(line.status).toBe('ok')
    expect(line.lineTotalFils).toBe(39000)
  })
})

describe('cart persistence', () => {
  it('round-trips through JSON', () => {
    const s = add(emptyCart, productC, c4, 2)
    expect(parseStoredCart(JSON.stringify(s))).toEqual(s)
  })

  it('drops corrupted or tampered data instead of crashing', () => {
    expect(parseStoredCart('not json')).toEqual(emptyCart)
    expect(parseStoredCart(null)).toEqual(emptyCart)
    const s = add(emptyCart, productC, c4, 2)
    const tampered = {
      lines: [
        { ...s.lines[0], bundles: -3 },
        { ...s.lines[0], tierId: 'C1', bundles: 2.5 },
      ],
    }
    expect(parseStoredCart(JSON.stringify(tampered)).lines).toHaveLength(0)
  })
})
