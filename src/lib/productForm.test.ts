import { describe, expect, it } from 'vitest'
import { productC } from '../test/fixtures'
import { formValuesToInput, productFormSchema, productToFormValues } from './productForm'

const valid = {
  name: 'Vitamin D3',
  description: '',
  imageUrl: '',
  brandId: 'b1',
  categoryId: 'c1',
  tiers: [
    { label: 'Single', units: '1', price: '2.5' },
    { label: 'Value', units: '4', price: '9.000' },
  ],
}

describe('admin product form validation', () => {
  it('accepts a valid product with any number of tiers', () => {
    expect(productFormSchema.safeParse(valid).success).toBe(true)
    const five = { ...valid, tiers: [1, 2, 3, 6, 24].map((u) => ({ label: '', units: String(u), price: String(u) })) }
    expect(productFormSchema.safeParse(five).success).toBe(true)
  })

  it('rejects zero/negative/decimal units and non-positive prices', () => {
    const badTiers = [
      { label: '', units: '0', price: '1' },
      { label: '', units: '-2', price: '1' },
      { label: '', units: '1.5', price: '1' },
      { label: '', units: '1', price: '0' },
      { label: '', units: '1', price: '-5' },
      { label: '', units: '1', price: '1.2345' },
    ]
    for (const tier of badTiers) {
      expect(productFormSchema.safeParse({ ...valid, tiers: [tier] }).success).toBe(false)
    }
  })

  it('requires at least one tier, a brand and a category', () => {
    expect(productFormSchema.safeParse({ ...valid, tiers: [] }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, brandId: '' }).success).toBe(false)
    expect(productFormSchema.safeParse({ ...valid, categoryId: '' }).success).toBe(false)
  })

  it('rejects two tiers with the same bundle size', () => {
    const dup = {
      ...valid,
      tiers: [
        { label: '', units: '4', price: '1' },
        { label: '', units: '04', price: '2' },
      ],
    }
    const result = productFormSchema.safeParse(dup)
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['tiers', 1, 'units'])
  })

  it('round-trips an existing product into the form and back', () => {
    const values = productToFormValues(productC)
    expect(values.tiers.map((t) => t.price)).toEqual(['5.500', '19.500', '55.000'])
    const input = formValuesToInput(productFormSchema.parse(values), productC.id)
    expect(input.tiers.map((t) => [t.unitsPerBundle, t.bundlePriceFils])).toEqual([
      [1, 5500],
      [4, 19500],
      [12, 55000],
    ])
  })
})
