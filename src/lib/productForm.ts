import { z } from 'zod'
import type { ProductInput } from '../api/catalog'
import type { Product } from '../types'
import { filsToKwdString, parseKwdInput } from './money'

/**
 * Validation for the admin product form. Values are kept as strings while
 * editing (exactly what the inputs contain) and converted on submit.
 */

export const MAX_UNITS_PER_BUNDLE = 10000

const tierSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().max(60, 'Label is too long (max 60 characters)'),
  units: z
    .string()
    .trim()
    .regex(/^\d+$/, 'Enter a whole number')
    .refine((v) => Number(v) >= 1, 'Must be at least 1')
    .refine((v) => Number(v) <= MAX_UNITS_PER_BUNDLE, `Must be ${MAX_UNITS_PER_BUNDLE} or less`),
  price: z
    .string()
    .trim()
    .refine((v) => parseKwdInput(v) !== null, 'Enter a positive price with up to 3 decimals, e.g. 19.500'),
})

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long (max 120 characters)'),
  description: z.string().max(2000, 'Description is too long (max 2000 characters)'),
  imageUrl: z
    .string()
    .trim()
    .refine((v) => v === '' || v.startsWith('/') || /^https?:\/\/\S+$/i.test(v), 'Enter a valid image URL'),
  brandId: z.string().min(1, 'Select a brand'),
  categoryId: z.string().min(1, 'Select a category'),
  tiers: z
    .array(tierSchema)
    .min(1, 'Add at least one pricing tier')
    .superRefine((tiers, ctx) => {
      const seen = new Map<string, number>()
      tiers.forEach((t, i) => {
        const key = String(Number(t.units))
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: [i, 'units'],
            message: 'Another tier already has this bundle size',
          })
        } else seen.set(key, i)
      })
    }),
})

export type ProductFormValues = z.infer<typeof productFormSchema>

export const emptyTier = (): ProductFormValues['tiers'][number] => ({ label: '', units: '', price: '' })

export function productToFormValues(product?: Product | null): ProductFormValues {
  if (!product) {
    return { name: '', description: '', imageUrl: '', brandId: '', categoryId: '', tiers: [{ label: 'Single pack', units: '1', price: '' }] }
  }
  return {
    name: product.name,
    description: product.description,
    imageUrl: product.imageUrl ?? '',
    brandId: product.brand.id,
    categoryId: product.category.id,
    tiers: product.tiers.map((t) => ({
      id: t.id,
      label: t.label,
      units: String(t.unitsPerBundle),
      price: filsToKwdString(t.bundlePriceFils).replace(/,/g, ''),
    })),
  }
}

export function formValuesToInput(values: ProductFormValues, id?: string): ProductInput {
  return {
    id,
    name: values.name.trim(),
    description: values.description.trim(),
    imageUrl: values.imageUrl.trim() || null,
    brandId: values.brandId,
    categoryId: values.categoryId,
    tiers: values.tiers
      .map((t) => ({
        id: t.id,
        label: t.label.trim(),
        unitsPerBundle: Number(t.units),
        bundlePriceFils: parseKwdInput(t.price)!,
      }))
      .sort((a, b) => a.unitsPerBundle - b.unitsPerBundle),
  }
}
