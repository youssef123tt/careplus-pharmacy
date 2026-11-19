// End-to-end acceptance test against the LIVE site, following the PDF brief section by section.
// Usage: npm run test:e2e [-- <base-url>]   (uses installed Edge; set BROWSER_CHANNEL=chrome for Chrome)
// Note: the admin section creates, edits and then deletes its own test brand/category/product.
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'https://careplus-pharmacy-rho.vercel.app'
const SHOTS = join(fileURLToPath(new URL('.', import.meta.url)), 'screenshots') + '/'
mkdirSync(SHOTS, { recursive: true })
const results = []
let failures = 0
const consoleErrors = []

async function check(name, fn) {
  try {
    await fn()
    results.push(`PASS  ${name}`)
  } catch (e) {
    failures++
    results.push(`FAIL  ${name}\n        ${String(e.message).split('\n')[0]}`)
  }
}
const assert = (cond, msg) => {
  if (!cond) throw new Error(msg)
}

process.on('uncaughtException', (e) => { console.log(results.join('\n')); console.log('CRASH', e.message.split('\n')[0]); process.exit(1) })
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true })
const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } })
const page = await ctx.newPage()
page.on('console', (m) => m.type() === 'error' && consoleErrors.push(m.text()))
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR ' + e.message))

const card = (name) => page.locator('article').filter({ has: page.getByRole('heading', { name }) })
const cartCount = async () => (await page.getByRole('link', { name: /^Cart, \d+ items/ }).getAttribute('aria-label')).match(/\d+/)[0]
const text = async (loc) => (await loc.innerText()).replace(/\s+/g, ' ').trim()
// Product names are uppercased by CSS (carton type), so compare text case-insensitively.
const has = (t, s) => t.toLowerCase().includes(s.toLowerCase())
const waitGrid = () => page.locator('article').first().waitFor({ timeout: 20000 })

// ---------------------------------------------------------------- 01 Home
console.log('== 01 Home / Product listing')
await page.goto(BASE)
await waitGrid()

await page.waitForTimeout(500)
const TOTAL = await page.locator('article').count()
await check('Home shows products with names, images and pricing options', async () => {
  const n = await page.locator('article').count()
  assert(n >= 3, `only ${n} products`)
  const broken = await page.$$eval('article img', (imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).length)
  assert(broken === 0, `${broken} broken images`)
})
await check('Product A has exactly 1 option, B 2, C 3 on the home page', async () => {
  for (const [name, n] of [['Digital Thermometer', 1], ['Hand Sanitizer Gel 250 ml', 2], ['Vitamin C 1000 mg Effervescent', 3]]) {
    const c = await card(name).getByRole('radio').count()
    assert(c === n, `${name}: ${c} options, expected ${n}`)
  }
})
await check('Product C prices are 5.500 / 19.500 / 55.000 KWD (3 decimals)', async () => {
  const t = await text(card('Vitamin C 1000 mg Effervescent'))
  for (const p of ['5.500 KWD', '19.500 KWD', '55.000 KWD']) assert(has(t, p), `missing ${p}`)
})
await check('Brand and category lists are shown (>=2 each)', async () => {
  const filters = page.getByRole('complementary', { name: 'Filters' })
  for (const b of ['VitaWell', 'PureCare', 'MediGuard']) await filters.getByRole('button', { name: new RegExp(b) }).waitFor()
  for (const c of ['Vitamins & Supplements', 'Personal Care']) await filters.getByRole('button', { name: new RegExp(c) }).waitFor()
})
await check('Filter by brand shows only that brand', async () => {
  await page.getByRole('button', { name: /^VitaWell/ }).click()
  await page.waitForURL(/brand=/)
  const expected = Number((await page.getByRole('button', { name: /^VitaWell/ }).innerText()).match(/\d+/)[0])
  await page.waitForFunction((n) => {
    const a = [...document.querySelectorAll('article')]
    return a.length === n && a.every((x) => /vitawell/i.test(x.innerText))
  }, expected)
  assert(expected >= 2, `expected >=2 VitaWell products, got ${expected}`)
})
await check('Filter by category (combined with brand) and clear filters', async () => {
  await page.getByRole('button', { name: 'Clear filters' }).first().click()
  await page.getByRole('button', { name: /^First Aid & Devices/ }).click()
  await page.waitForURL(/category=/)
  await page.waitForFunction(() => [...document.querySelectorAll('article')].every((x) => /first aid/i.test(x.innerText)))
  const names = await page.locator('article h3').allTextContents()
  assert(names.includes('Digital Thermometer') && names.includes('Adhesive Bandages (40 strips)'), names.join(','))
  await page.getByRole('button', { name: 'Clear filters' }).first().click()
  await page.waitForFunction((n) => document.querySelectorAll('article').length === n, TOTAL)
})
await check('Search filters by name', async () => {
  await page.getByRole('searchbox', { name: 'Search products' }).fill('omega')
  await page.waitForFunction(() => document.querySelectorAll('article').length === 1)
  await page.getByRole('searchbox', { name: 'Search products' }).fill('zzzz-nothing')
  await page.getByText('No products found').waitFor()
  await page.getByRole('button', { name: 'Clear filters' }).first().click()
  await waitGrid()
})
await check('Select an offer on a card and add it to the cart', async () => {
  const c = card('Hand Sanitizer Gel 250 ml')
  await c.locator('label', { hasText: '4 packs' }).click()
  await c.getByRole('button', { name: 'Add to cart' }).click()
  await page.getByText('Added Hand Sanitizer Gel 250 ml').waitFor()
  assert((await cartCount()) === '1', 'badge not 1')
})
await check('Open product details from the card', async () => {
  await card('Vitamin C 1000 mg Effervescent').getByRole('link', { name: 'Details' }).click()
  await page.getByRole('heading', { level: 1, name: 'Vitamin C 1000 mg Effervescent' }).waitFor()
})
await page.screenshot({ path: SHOTS + 'desktop-details.png', fullPage: true })

// ---------------------------------------------------------------- 02 Details
console.log('== 02 Product details')
await check('Details page shows info, image, brand, category and all 3 offers', async () => {
  const main = page.locator('main')
  const t = await text(main)
  for (const s of ['VitaWell', 'Vitamins & Supplements', 'immune', 'Choose an offer (3 available)']) assert(has(t, s), `missing "${s}"`)
  assert((await main.getByRole('radio').count()) === 3, 'not 3 offers')
  const ok = await page.$eval('main img', (i) => i.complete && i.naturalWidth > 0)
  assert(ok, 'image not loaded')
})
await check('Brief example: 4-pack x 2 bundles = 39.000 KWD, 8 packs', async () => {
  await page.locator('main label', { hasText: '4 packs' }).click()
  await page.getByRole('button', { name: 'Increase bundles' }).click()
  const total = await text(page.getByTestId('details-total'))
  assert(total === '39.000 KWD', `total ${total}`)
  assert(has(await text(page.locator('main')), '8 packs in total'), 'no 8 packs')
})
await check('Price recalculates for other offers (12-pack x 3 = 165.000)', async () => {
  await page.locator('main label', { hasText: '12 packs' }).click()
  await page.getByRole('button', { name: 'Increase bundles' }).click()
  assert((await text(page.getByTestId('details-total'))) === '165.000 KWD', 'wrong 12-pack total')
})
await check('Invalid bundle input (0, -5, 1000, letters) is rejected/corrected', async () => {
  const qty = page.getByRole('spinbutton', { name: 'Number of bundles' })
  for (const [input, expected] of [['0', '1'], ['1000', '99'], ['abc', '1']]) {
    await qty.fill('')
    await qty.pressSequentially(input)
    await qty.blur()
    const v = await qty.inputValue()
    assert(v === expected, `input ${input} -> ${v}, expected ${expected}`)
  }
  assert((await page.getByRole('button', { name: 'Decrease bundles' }).isDisabled()), 'minus should be disabled at 1')
})
await check('Add selected offer to cart (4-pack x 2)', async () => {
  await page.locator('main label', { hasText: '4 packs' }).click()
  await page.getByRole('button', { name: 'Increase bundles' }).click()
  await page.getByRole('button', { name: /Add to cart — 39\.000 KWD/ }).click()
  await page.getByText('Added to cart').waitFor()
  // Same product, different offer -> 1-pack x 1
  await page.locator('main label', { hasText: '1 pack' }).first().click()
  const qty = page.getByRole('spinbutton', { name: 'Number of bundles' })
  await qty.fill('1')
  await qty.blur()
  await page.getByRole('button', { name: /Add to cart — 5\.500 KWD/ }).click()
  assert((await cartCount()) === '3', `badge ${await cartCount()}`)
})

// ---------------------------------------------------------------- 03 Cart
console.log('== 03 Cart')
await page.goto(BASE + '/cart'); await page.screenshot({ path: SHOTS + 'debug-cart.png' })
await page.getByRole('heading', { name: 'Shopping cart' }).waitFor()
const lines = () => page.getByRole('list', { name: 'Cart items' }).getByRole('listitem')
const lineFor = (re) => lines().filter({ hasText: re })
await page.screenshot({ path: SHOTS + 'desktop-cart.png', fullPage: true })

await check('Cart shows product, offer, bundle quantity, packs and line price', async () => {
  const l = lineFor(/Vitamin C[\s\S]*4 packs/)
  const t = await text(l)
  for (const s of ['Vitamin C 1000 mg Effervescent', 'Offer: 4 packs', '19.500 KWD / bundle', '2 × 4 packs = 8 packs', '39.000 KWD']) assert(has(t, s), `missing "${s}" in: ${t}`)
})
await check('Different offers of the same product are separate cart lines', async () => {
  const vit = await lines().filter({ hasText: 'Vitamin C' }).count()
  assert(vit === 2, `${vit} Vitamin C lines`)
  assert((await lines().count()) === 3, 'expected 3 lines')
})
await check('Cart total is correct: 39.000 + 5.500 + 4.500 = 49.000 KWD', async () => {
  assert((await text(page.getByTestId('cart-total'))) === '49.000 KWD', await text(page.getByTestId('cart-total')))
})
await check('Quantity update recalculates line and total', async () => {
  await lineFor(/Hand Sanitizer/).getByRole('button', { name: 'Increase bundles' }).click()
  assert((await text(lineFor(/Hand Sanitizer/).getByTestId('line-total'))) === '9.000 KWD', 'line not 9.000')
  assert((await text(lineFor(/Hand Sanitizer/).getByTestId('line-packs'))).includes('= 8 packs'), 'packs not 8')
  assert((await text(page.getByTestId('cart-total'))) === '53.500 KWD', await text(page.getByTestId('cart-total')))
})
await check('Invalid cart quantity (0) is prevented', async () => {
  const qty = lineFor(/Hand Sanitizer/).getByRole('spinbutton')
  await qty.fill('0')
  await qty.blur()
  assert((await qty.inputValue()) === '1', 'qty not corrected to 1')
  assert((await text(page.getByTestId('cart-total'))) === '49.000 KWD', 'total wrong after correction')
})
await check('Cart persists after refresh', async () => {
  await page.reload()
  await lines().first().waitFor()
  assert((await lines().count()) === 3, 'lines lost after reload')
  assert((await text(page.getByTestId('cart-total'))) === '49.000 KWD', 'total changed after reload')
})
await check('Remove item recalculates totals', async () => {
  await lineFor(/Hand Sanitizer/).getByRole('button', { name: /Remove/ }).click()
  assert((await lines().count()) === 2, 'not removed')
  assert((await text(page.getByTestId('cart-total'))) === '44.500 KWD', await text(page.getByTestId('cart-total')))
})

// ---------------------------------------------------------------- 04 Admin
console.log('== 04 Admin')
const S = Date.now().toString().slice(-5)
const BRAND = `E2E Brand ${S}`
const CAT = `E2E Category ${S}`
const PROD = `E2E Test Product ${S}`
const toast = (t) => page.locator('[data-sonner-toast]', { hasText: t }).first().waitFor({ timeout: 15000 })

await page.goto(BASE + '/admin')
await page.getByRole('heading', { name: 'Store management' }).waitFor()
await page.locator('main li').first().waitFor()
await page.screenshot({ path: SHOTS + 'desktop-admin.png', fullPage: true })

await check('Admin lists products with their tiers', async () => {
  const t = await text(page.locator('main'))
  for (const s of ['Digital Thermometer', 'Vitamin C 1000 mg Effervescent', '12 packs · 55.000 KWD']) assert(has(t, s), `missing ${s}`)
})
await check('Create brand and category', async () => {
  await page.getByRole('link', { name: 'Brands' }).click()
  await page.locator('#new-name').fill(BRAND)
  await page.getByRole('button', { name: 'Add brand' }).click()
  await toast(`Added brand "${BRAND}"`)
  await page.locator('main li', { hasText: BRAND }).waitFor()
  await page.locator('#new-name').fill('vitawell') // duplicate (case-insensitive)
  await page.getByRole('button', { name: 'Add brand' }).click()
  await page.getByText(/already exists/).waitFor()
  await page.locator('#new-name').fill('')
  await page.getByRole('link', { name: 'Categories' }).click()
  await page.locator('#new-name').fill(CAT)
  await page.getByRole('button', { name: 'Add category' }).click()
  await toast(`Added category "${CAT}"`)
})
await check('Rename brand', async () => {
  await page.getByRole('link', { name: 'Brands' }).click()
  await page.getByRole('button', { name: `Rename ${BRAND}` }).click()
  await page.getByRole('textbox', { name: 'Name' }).first().fill(BRAND + ' X')
  await page.getByRole('button', { name: 'Save name' }).click()
  await page.locator('main li', { hasText: BRAND + ' X' }).waitFor()
  await page.getByRole('button', { name: `Rename ${BRAND} X` }).click()
  await page.getByRole('textbox', { name: 'Name' }).first().fill(BRAND)
  await page.getByRole('button', { name: 'Save name' }).click()
  await page.getByRole('button', { name: `Rename ${BRAND}`, exact: true }).waitFor()
})

const tierInputs = (label) => page.getByLabel(label, { exact: true })
await check('Product form validation blocks invalid data', async () => {
  await page.goto(BASE + '/admin/products/new')
  await page.getByRole('heading', { name: 'New product' }).waitFor()
  await page.getByRole('button', { name: 'Create product' }).click()
  await page.getByText('Name is required').waitFor()
  await page.getByText('Select a brand').nth(1).waitFor()
  await tierInputs('Bundle price (KWD)').first().fill('0')
  await page.getByRole('button', { name: 'Create product' }).click()
  await page.getByText(/Enter a positive price/).waitFor()
  await page.getByRole('button', { name: 'Add tier' }).click()
  await tierInputs('Units per bundle').nth(1).fill('1')
  await tierInputs('Bundle price (KWD)').nth(1).fill('2')
  await page.getByRole('button', { name: 'Create product' }).click()
  await page.getByText('Another tier already has this bundle size').waitFor()
  await tierInputs('Units per bundle').nth(1).fill('-3')
  await page.getByRole('button', { name: 'Create product' }).click()
  await page.getByText('Enter a whole number').waitFor()
  assert(page.url().endsWith('/admin/products/new'), 'should not have navigated')
})
await check('Create product with 2 pricing tiers (saved to DB)', async () => {
  await page.getByLabel('Name', { exact: true }).fill(PROD)
  await page.getByLabel('Description').fill('Created by the automated acceptance test.')
  await page.getByLabel('Brand').selectOption({ label: BRAND })
  await page.getByLabel('Category').selectOption({ label: CAT })
  await page.getByLabel('…or image URL').fill('/products/omega3.svg')
  await tierInputs('Bundle price (KWD)').nth(0).fill('2.250')
  await tierInputs('Label (optional)').nth(1).fill('Big box')
  await tierInputs('Units per bundle').nth(1).fill('6')
  await tierInputs('Bundle price (KWD)').nth(1).fill('12')
  await page.getByText('≈ 2.000 KWD per pack').waitFor()
  await page.getByRole('button', { name: 'Create product' }).click()
  await toast('Product created')
  await page.waitForURL(/\/admin$/)
  await page.getByText(PROD).waitFor()
})
await check('New product appears on storefront after refresh, filterable by its brand', async () => {
  await page.goto(BASE + '/')
  await waitGrid()
  await page.getByRole('button', { name: new RegExp('^' + BRAND) }).click()
  await page.waitForFunction(() => document.querySelectorAll('article').length === 1)
  const t = await text(card(PROD))
  for (const s of ['2.250 KWD', '12.000 KWD', '6 packs']) assert(has(t, s), `missing ${s}: ${t}`)
  assert((await card(PROD).getByRole('radio').count()) === 2, 'not 2 options')
})
await check('Edit product: change price, add a 3rd tier, rename', async () => {
  await page.goto(BASE + '/admin')
  await page.locator('main li', { hasText: PROD }).getByRole('link', { name: 'Edit' }).click()
  await page.getByRole('heading', { name: 'Edit product' }).waitFor()
  assert((await tierInputs('Bundle price (KWD)').nth(1).inputValue()) === '12.000', 'price not loaded with 3 decimals')
  await page.getByLabel('Name', { exact: true }).fill(PROD + ' v2')
  await tierInputs('Bundle price (KWD)').nth(1).fill('11.500')
  await page.getByRole('button', { name: 'Add tier' }).click()
  await tierInputs('Units per bundle').nth(2).fill('24')
  await tierInputs('Bundle price (KWD)').nth(2).fill('40.000')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await toast('Product updated')
  await page.getByText(PROD + ' v2').waitFor()
})
await check('Edits persist and show on the product details page', async () => {
  await page.goto(BASE + '/')
  await waitGrid()
  await card(PROD + ' v2').getByRole('link', { name: 'Details' }).click()
  await page.getByRole('heading', { level: 1, name: PROD + ' v2' }).waitFor()
  await page.reload()
  await page.getByText('Choose an offer (3 available)').waitFor()
  const t = await text(page.locator('main'))
  for (const s of ['11.500 KWD', '40.000 KWD', '24 packs', BRAND, CAT]) assert(has(t, s), `missing ${s}`)
})
await check('Cart flags a price change made by the admin', async () => {
  await page.locator('main label', { hasText: '6 packs' }).click()
  await page.getByRole('button', { name: /Add to cart/ }).click()
  await page.goto(BASE + '/admin')
  await page.locator('main li', { hasText: PROD }).getByRole('link', { name: 'Edit' }).click()
  await page.getByRole('heading', { name: 'Edit product' }).waitFor()
  await tierInputs('Bundle price (KWD)').nth(1).fill('10.000')
  // also delete the 24-pack tier
  await page.getByRole('button', { name: 'Remove tier 3' }).click()
  await page.getByRole('button', { name: 'Save changes' }).click()
  await toast('Product updated')
  await page.goto(BASE + '/cart')
  const l = lineFor(new RegExp(PROD))
  await l.getByText('The price of this offer was updated').waitFor()
  assert((await text(l.getByTestId('line-total'))) === '10.000 KWD', 'cart did not use live price')
  await l.getByRole('button', { name: /Remove/ }).click()
})
await check('Deleted tier no longer shown (2 offers left)', async () => {
  await page.goto(BASE + '/')
  await waitGrid()
  assert((await card(PROD + ' v2').getByRole('radio').count()) === 2, 'tier not deleted')
})
await check('Deleting a brand that is in use is blocked with a clear message', async () => {
  await page.goto(BASE + '/admin/brands')
  await page.getByRole('button', { name: `Delete ${BRAND}` }).click()
  await page.getByText(/used by 1 product/).waitFor()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await toast('still used by one or more products')
  await page.getByText(BRAND).first().waitFor()
})
await check('Delete product (with confirmation)', async () => {
  await page.goto(BASE + '/admin')
  await page.getByRole('button', { name: `Delete ${PROD} v2` }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await toast(`Deleted "${PROD} v2"`)
  await page.reload()
  await page.locator('main li').first().waitFor()
  assert(!has(await text(page.locator('main')), PROD), 'product still listed')
})
await check('Delete brand and category once unused', async () => {
  await page.goto(BASE + '/admin/brands')
  await page.getByRole('button', { name: `Delete ${BRAND}` }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await toast(`Deleted "${BRAND}"`)
  await page.goto(BASE + '/admin/categories')
  await page.getByRole('button', { name: `Delete ${CAT}` }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click()
  await toast(`Deleted "${CAT}"`)
})
await check('Catalog is back to its original size after the admin test', async () => {
  await page.goto(BASE + '/')
  await waitGrid()
  await page.waitForFunction((n) => document.querySelectorAll('article').length === n, TOTAL)
})

// ---------------------------------------------------------------- States
console.log('== States')
await check('Unknown product shows "Product not found"', async () => {
  await page.goto(BASE + '/products/00000000-0000-0000-0000-000000000000')
  await page.getByText('Product not found').waitFor()
  await page.goto(BASE + '/products/not-a-uuid')
  await page.getByText('Product not found').waitFor()
})
await check('Unknown route shows "Page not found"', async () => {
  await page.goto(BASE + '/nope')
  await page.getByText('Page not found').waitFor()
})
await check('Empty cart state', async () => {
  await page.goto(BASE + '/cart')
  await page.getByRole('button', { name: 'Clear cart' }).click()
  await page.getByText('Your cart is empty').waitFor()
})
await check('Loading state is shown while data loads', async () => {
  const p2 = await ctx.newPage()
  await p2.route('**/rest/v1/**', async (r) => { await new Promise((res) => setTimeout(res, 1500)); await r.continue() })
  await p2.goto(BASE + '/')
  await p2.getByText('Loading products…').waitFor({ timeout: 3000 })
  await p2.screenshot({ path: SHOTS + 'state-loading.png' })
  await p2.close()
})
await check('Error state with retry when the backend is unreachable', async () => {
  const p2 = await ctx.newPage()
  await p2.route('**/rest/v1/**', (r) => r.abort())
  await p2.goto(BASE + '/')
  await p2.getByText("We couldn't load this").waitFor({ timeout: 20000 })
  await p2.getByRole('button', { name: 'Try again' }).waitFor()
  await p2.screenshot({ path: SHOTS + 'state-error.png' })
  await p2.unroute('**/rest/v1/**')
  await p2.getByRole('button', { name: 'Try again' }).click()
  await p2.locator('article').first().waitFor({ timeout: 20000 })
  await p2.close()
})

// ---------------------------------------------------------------- Responsive
console.log('== Responsive')
const mobile = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true })
const m = await mobile.newPage()
m.on('pageerror', (e) => consoleErrors.push('PAGEERROR(mobile) ' + e.message))
for (const [name, path, ready] of [
  ['home', '/', 'article'],
  ['details', '/products/a0000000-0000-0000-0000-000000000003', 'h1'],
  ['admin', '/admin', 'main li'],
  ['admin-form', '/admin/products/a0000000-0000-0000-0000-000000000003/edit', 'form'],
]) {
  await check(`Mobile 375px: ${name} has no horizontal overflow`, async () => {
    await m.goto(BASE + path)
    await m.locator(ready).first().waitFor({ timeout: 20000 })
    await m.waitForTimeout(400)
    const over = await m.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - 375)
    await m.screenshot({ path: SHOTS + `mobile-${name}.png`, fullPage: true })
    assert(over <= 0, `overflows by ${over}px`)
  })
}
await check('Mobile 375px: cart with items has no horizontal overflow', async () => {
  await m.goto(BASE + '/products/a0000000-0000-0000-0000-000000000003')
  await m.locator('main label', { hasText: '12 packs' }).click()
  await m.getByRole('button', { name: /Add to cart/ }).click()
  await m.goto(BASE + '/cart')
  await m.getByTestId('cart-total').waitFor()
  const over = await m.evaluate(() => Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - 375)
  await m.screenshot({ path: SHOTS + 'mobile-cart.png', fullPage: true })
  assert(over <= 0, `overflows by ${over}px`)
})
await check('No JavaScript errors during the whole run', async () => {
  const real = consoleErrors.filter((e) => !/Failed to load resource|ERR_FAILED|net::/.test(e))
  assert(real.length === 0, real.slice(0, 3).join(' | '))
})

await browser.close()
console.log('\n' + results.join('\n'))
console.log(`\n${results.length - failures}/${results.length} passed`)
process.exit(failures ? 1 : 0)
