// Design review captures: every page, light + dark, desktop + mobile.
// Usage: node e2e/screens.mjs [base-url] [out-dir]
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright-core'

const BASE = process.argv[2] ?? 'http://localhost:5179'
const OUT = (process.argv[3] ?? 'e2e/screenshots/design') + '/'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge', headless: true })
const errors = []

for (const theme of ['light', 'dark']) {
  for (const [vp, size] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport: size, colorScheme: theme, deviceScaleFactor: vp === 'mobile' ? 2 : 1 })
    await ctx.addInitScript((t) => localStorage.setItem('careplus.theme', t), theme)
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errors.push(e.message))
    const shot = async (name, full = true) => {
      await page.waitForTimeout(400)
      // force lazy images to load before a full-page capture
      await page.evaluate(() => document.querySelectorAll('img[loading=lazy]').forEach((i) => (i.loading = 'eager')))
      await page.waitForLoadState('networkidle')
      await page.screenshot({ path: `${OUT}${vp}-${theme}-${name}.png`, fullPage: full })
    }
    await page.goto(BASE + '/')
    await page.locator('article').first().waitFor()
    await shot('home', vp === 'mobile' ? false : true)
    if (vp === 'mobile') await shot('home-full')
    await page.goto(BASE + '/products/a0000000-0000-0000-0000-000000000003')
    await page.locator('h1').waitFor()
    await page.locator('main label', { hasText: '4 packs' }).click()
    await page.getByRole('button', { name: 'Increase bundles' }).click()
    await shot('details')
    await page.getByRole('button', { name: /Add to cart/ }).click()
    await page.locator('main label', { hasText: '12 packs' }).click()
    await page.getByRole('button', { name: /Add to cart/ }).click()
    await page.goto(BASE + '/cart')
    await page.getByTestId('cart-total').waitFor()
    await shot('cart')
    await page.goto(BASE + '/admin')
    await page.locator('main li').first().waitFor()
    await shot('admin')
    await page.goto(BASE + '/admin/products/a0000000-0000-0000-0000-000000000003/edit')
    await page.locator('form').waitFor()
    await shot('admin-form')
    await page.goto(BASE + '/admin/brands')
    await page.locator('main li').first().waitFor()
    await shot('admin-brands', false)
    await ctx.close()
  }
}
await browser.close()
console.log(errors.length ? 'ERRORS: ' + errors.join(' | ') : 'no page errors', '-> ' + OUT)
