import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Accept common copy/paste mistakes: trailing slash or the "/rest/v1" API path.
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)
  ?.trim()
  .replace(/\/+$/, '')
  .replace(/\/rest\/v1$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True when the Supabase environment variables are present. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/** Supabase client, or null when not configured (the UI then shows setup instructions). */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, { auth: { persistSession: false } })
  : null

export function db(): SupabaseClient {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.')
  }
  return supabase
}

export const PRODUCT_IMAGES_BUCKET = 'product-images'
