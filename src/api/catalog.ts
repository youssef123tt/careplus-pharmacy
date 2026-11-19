import type { PostgrestError } from '@supabase/supabase-js'
import { db, PRODUCT_IMAGES_BUCKET } from '../lib/supabase'
import { filsToKwdString, kwdToFils } from '../lib/money'
import type { Brand, Category, PricingTier, Product } from '../types'

// ---------------------------------------------------------------------------
// Row types (database shape) and mapping to domain types
// ---------------------------------------------------------------------------

interface TierRow {
  id: string
  product_id: string
  label: string
  units_per_bundle: number
  bundle_price: number | string
  sort_order: number
}

interface ProductRow {
  id: string
  name: string
  description: string
  image_url: string | null
  brand: Brand | null
  category: Category | null
  pricing_tiers: TierRow[] | null
}

const PRODUCT_SELECT = `
  id, name, description, image_url,
  brand:brands ( id, name ),
  category:categories ( id, name ),
  pricing_tiers ( id, product_id, label, units_per_bundle, bundle_price, sort_order )
`

export function mapTier(row: TierRow): PricingTier {
  return {
    id: row.id,
    productId: row.product_id,
    label: row.label,
    unitsPerBundle: row.units_per_bundle,
    bundlePriceFils: kwdToFils(row.bundle_price),
    sortOrder: row.sort_order,
  }
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    imageUrl: row.image_url,
    brand: row.brand ?? { id: '', name: 'Unknown brand' },
    category: row.category ?? { id: '', name: 'Uncategorised' },
    tiers: (row.pricing_tiers ?? [])
      .map(mapTier)
      .sort((a, b) => a.unitsPerBundle - b.unitsPerBundle || a.sortOrder - b.sortOrder),
  }
}

// ---------------------------------------------------------------------------
// Error handling: turn database errors into messages a store manager understands
// ---------------------------------------------------------------------------

export class ApiError extends Error {}

function toApiError(error: PostgrestError | Error, context: string): ApiError {
  const code = 'code' in error ? error.code : undefined
  const msg = error.message ?? ''
  if (code === '23505' || msg.includes('duplicate key')) {
    if (msg.includes('pricing_tiers_unique_size')) {
      return new ApiError('Two pricing tiers cannot have the same number of units per bundle.')
    }
    return new ApiError(`${context}: a record with this name already exists.`)
  }
  // 23503 = foreign_key_violation, 23001 = restrict_violation (ON DELETE RESTRICT)
  if (code === '23503' || code === '23001') {
    return new ApiError(`${context}: it is still used by one or more products. Reassign or delete those products first.`)
  }
  if (code === '23514') return new ApiError(`${context}: one of the values is out of the allowed range.`)
  if (code === '22P02') return new ApiError(`${context}: invalid value.`)
  if (msg.toLowerCase().includes('failed to fetch')) {
    return new ApiError('Could not reach the server. Check your internet connection and try again.')
  }
  return new ApiError(`${context}: ${msg || 'unexpected error'}`)
}

function check<T>(result: { data: T | null; error: PostgrestError | null }, context: string): T {
  if (result.error) throw toApiError(result.error, context)
  return result.data as T
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductFilters {
  brandId?: string
  categoryId?: string
  search?: string
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let query = db().from('products').select(PRODUCT_SELECT).order('created_at', { ascending: true })
  if (filters.brandId) query = query.eq('brand_id', filters.brandId)
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId)
  const term = filters.search?.trim()
  if (term) query = query.ilike('name', `%${term.replace(/[%_]/g, '\\$&')}%`)
  const rows = check(await query, 'Loading products') as unknown as ProductRow[]
  return rows.map(mapProduct)
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const result = await db().from('products').select(PRODUCT_SELECT).eq('id', id).maybeSingle()
  if (result.error?.code === '22P02') return null // malformed uuid in the URL
  const row = check(result, 'Loading product') as unknown as ProductRow | null
  return row ? mapProduct(row) : null
}

export interface TierInput {
  id?: string
  label: string
  unitsPerBundle: number
  bundlePriceFils: number
}

export interface ProductInput {
  id?: string
  name: string
  description: string
  imageUrl: string | null
  brandId: string
  categoryId: string
  tiers: TierInput[]
}

/** Create/update a product together with its tiers in one database transaction (RPC). */
export async function saveProduct(input: ProductInput): Promise<string> {
  const result = await db().rpc('save_product', {
    p_product: {
      id: input.id ?? null,
      name: input.name.trim(),
      description: input.description.trim(),
      image_url: input.imageUrl,
      brand_id: input.brandId,
      category_id: input.categoryId,
    },
    p_tiers: input.tiers.map((t) => ({
      id: t.id ?? null,
      label: t.label.trim(),
      units_per_bundle: t.unitsPerBundle,
      // send as an exact decimal string so no float rounding happens on the way
      bundle_price: filsToKwdString(t.bundlePriceFils).replace(/,/g, ''),
    })),
  })
  return check(result, 'Saving product') as string
}

export async function deleteProduct(id: string): Promise<void> {
  check(await db().from('products').delete().eq('id', id), 'Deleting product')
}

export async function uploadProductImage(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new ApiError('Please choose an image file.')
  if (file.size > 5 * 1024 * 1024) throw new ApiError('Image must be smaller than 5 MB.')
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${crypto.randomUUID()}.${ext}`
  const storage = db().storage.from(PRODUCT_IMAGES_BUCKET)
  const { error } = await storage.upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new ApiError(`Uploading image: ${error.message}`)
  return storage.getPublicUrl(path).data.publicUrl
}

// ---------------------------------------------------------------------------
// Brands & categories (same shape, so one generic implementation)
// ---------------------------------------------------------------------------

export type TaxonomyTable = 'brands' | 'categories'

export interface TaxonomyWithCount {
  id: string
  name: string
  productCount: number
}

const label = (table: TaxonomyTable) => (table === 'brands' ? 'Brand' : 'Category')

export async function fetchTaxonomy(table: TaxonomyTable): Promise<TaxonomyWithCount[]> {
  const rows = check(
    await db().from(table).select('id, name, products(count)').order('name'),
    `Loading ${table}`,
  ) as unknown as { id: string; name: string; products: { count: number }[] }[]
  return rows.map((r) => ({ id: r.id, name: r.name, productCount: r.products?.[0]?.count ?? 0 }))
}

export async function createTaxonomy(table: TaxonomyTable, name: string): Promise<void> {
  check(await db().from(table).insert({ name: name.trim() }), `Creating ${label(table).toLowerCase()}`)
}

export async function renameTaxonomy(table: TaxonomyTable, id: string, name: string): Promise<void> {
  check(await db().from(table).update({ name: name.trim() }).eq('id', id), `Renaming ${label(table).toLowerCase()}`)
}

export async function deleteTaxonomy(table: TaxonomyTable, id: string): Promise<void> {
  check(await db().from(table).delete().eq('id', id), `Cannot delete ${label(table).toLowerCase()}`)
}
