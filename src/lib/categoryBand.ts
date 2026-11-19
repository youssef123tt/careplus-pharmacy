/**
 * Each category is printed with one band colour, like strength bands on medicine cartons.
 * Known healthcare categories get a fixed hue; any other category gets a stable hue from its name.
 */

const BANDS = [
  'bg-band-orange',
  'bg-band-blue',
  'bg-band-red',
  'bg-band-violet',
  'bg-band-olive',
  'bg-band-magenta',
  'bg-band-slate',
] as const

const KNOWN: [RegExp, (typeof BANDS)[number]][] = [
  [/vitamin|supplement|nutrition/i, 'bg-band-orange'],
  [/personal|skin|hygiene|hair|oral/i, 'bg-band-blue'],
  [/first aid|device|wound|bandage/i, 'bg-band-red'],
  [/baby|mother|kid/i, 'bg-band-violet'],
  [/herbal|natural|organic/i, 'bg-band-olive'],
  [/beauty|cosmetic/i, 'bg-band-magenta'],
]

/** Tailwind background class for a category's band. */
export function categoryBand(name: string): string {
  for (const [re, cls] of KNOWN) if (re.test(name)) return cls
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return BANDS[hash % BANDS.length]
}
