/**
 * Money helpers for Kuwaiti Dinar (KWD).
 *
 * KWD has 3 decimal places (1 KWD = 1000 fils). All arithmetic is done on
 * integer fils to avoid floating-point errors (e.g. 0.1 + 0.2 !== 0.3).
 */

export const FILS_PER_KWD = 1000

/** Convert a KWD amount (number or numeric string from the DB) to integer fils. */
export function kwdToFils(value: number | string): number {
  const n = typeof value === 'string' ? Number(value) : value
  if (!Number.isFinite(n)) throw new Error(`Invalid KWD amount: ${value}`)
  return Math.round(n * FILS_PER_KWD)
}

/** Convert integer fils to a KWD decimal string with exactly 3 decimals, e.g. 39000 -> "39.000". */
export function filsToKwdString(fils: number): string {
  if (!Number.isInteger(fils)) throw new Error(`Fils must be an integer, got ${fils}`)
  const sign = fils < 0 ? '-' : ''
  const abs = Math.abs(fils)
  const whole = Math.floor(abs / FILS_PER_KWD)
  const fraction = String(abs % FILS_PER_KWD).padStart(3, '0')
  return `${sign}${whole.toLocaleString('en-US')}.${fraction}`
}

/** Format fils for display: 39000 -> "39.000 KWD". */
export function formatKWD(fils: number): string {
  return `${filsToKwdString(fils)} KWD`
}

/**
 * Parse admin input like "19.5" or "19.500" into fils.
 * Returns null when the input is not a valid positive amount with at most 3 decimals.
 */
export function parseKwdInput(input: string): number | null {
  const trimmed = input.trim()
  if (!/^\d+(\.\d{1,3})?$/.test(trimmed)) return null
  const fils = kwdToFils(trimmed)
  return fils > 0 ? fils : null
}
