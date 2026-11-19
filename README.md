# CarePlus — Medical E-Commerce with Multi-Tier Pricing

A healthcare storefront and product-management backend built for the **NCG Vibe Coder Assessment**.
Customers browse products by brand and category, choose a bundle offer (pricing tier), and manage a cart.
Store managers maintain products, brands, categories and pricing tiers from an admin panel. All catalog data lives in a real PostgreSQL database (Supabase).

- **Live app:** https://careplus-pharmacy-rho.vercel.app
- **Admin panel:** https://careplus-pharmacy-rho.vercel.app/admin (no login; authentication is out of scope)
- **Source code:** https://github.com/youssef123tt/careplus-pharmacy

---

## Features

| Page | What it does |
|---|---|
| **Home / Product listing** (`/`) | Product grid with images, names and every pricing option. Filter by **category** and **brand** (with product counts) and search by name. Filters are kept in the URL, so they can be shared and work with the back button. You can pick an offer and add it to the cart straight from the card. |
| **Product details** (`/products/:id`) | Image, brand, category and description, plus all offers with per-pack price and the % saved. Choose an offer and a number of bundles; the total and the pack count update live. |
| **Shopping cart** (`/cart`) | Each line shows the product, offer, bundles, internal pack quantity and line price. You can update quantities or remove items, and totals recalculate. Different offers of the same product stay as **separate lines**. |
| **Admin** (`/admin`) | Create, edit and delete products (name, description, image upload or URL, brand, category). Add, edit and remove **any number** of pricing tiers. Manage brands and categories. Every change is saved to the database and shows up on the storefront. |

### Required test products (seeded)

| Brief | Product | Offers |
|---|---|---|
| Product A — one option | Digital Thermometer | 1 pack: 4.750 |
| Product B — two options | Hand Sanitizer Gel 250 ml | 1 pack: 1.250 · 4 packs: 4.500 |
| Product C — three options | Vitamin C 1000 mg Effervescent | 1 pack: **5.500** · 4 packs: **19.500** · 12 packs: **55.000** |

There are 3 more products, and the seed has **3 brands** (VitaWell, PureCare, MediGuard) and **3 categories** (Vitamins & Supplements, Personal Care, First Aid & Devices).

---

## Business logic

- **A pricing tier is an independent bundle offer**: `units_per_bundle` packs sold for one `bundle_price`. That price is the total for the bundle, never a per-pack price.
- **A cart line is keyed by `productId + tierId`**, so different offers of the same product are always separate lines. Adding the same offer again increases that line's bundle count.
- The quantity stored on a line is the **number of bundles**. The internal pack quantity is derived: `packs = units_per_bundle × bundles`.
- **Line total = bundle_price × bundles.** Brief example: 2 × 4-pack @ 19.500 KWD = **8 packs, 39.000 KWD**. This exact case is covered by unit and UI tests.
- **Money is calculated in integer fils** (1 KWD = 1000 fils), so there are no floating-point rounding errors. It is stored as `numeric(10,3)` in Postgres and always displayed in **KWD with 3 decimals** (`39.000 KWD`).
- **Validation in three layers:**
  1. **UI:** the quantity stepper only allows whole numbers from 1 to 99. The admin form uses zod and rejects non-positive prices, prices with more than 3 decimals, non-integer units and duplicate bundle sizes.
  2. **Cart logic:** the reducer clamps every quantity, and stored cart data is re-validated when it loads.
  3. **Database:** `CHECK` constraints on price and units, a unique `(product_id, units_per_bundle)` constraint, and foreign keys with `RESTRICT` so a brand or category that is still in use can't be deleted.
- **Atomic saves:** a product and its tiers are saved through one Postgres function (`save_product`) in a single transaction. It updates existing tiers, inserts new ones and deletes removed ones, so the catalog is never left half-saved.
- **Live prices in the cart:** the cart prices every line with the current catalog data. If an admin changes a price, the line shows a notice. If an admin deletes an offer, the line is marked unavailable and left out of the total.

---

## Tech stack & AI tools

| Area | Technology |
|---|---|
| AI development tool | **Claude Code** (Anthropic): AI pair-programming for planning, implementation, tests and documentation |
| Frontend | React 19 + TypeScript, Vite |
| Styling | Tailwind CSS v4, lucide-react icons |
| Data fetching / caching | TanStack Query |
| Routing | React Router |
| Forms & validation | react-hook-form + zod |
| Backend / database | Supabase (PostgreSQL, PostgREST API, Storage for images) |
| Testing | Vitest, React Testing Library, PGlite (in-process Postgres used to check the SQL) |
| Hosting | Vercel (frontend), Supabase (database) |

---

## Setup

### 1. Database (Supabase)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run these files in order:
   1. [`supabase/schema.sql`](supabase/schema.sql): tables, constraints, the `save_product` function and RLS policies
   2. [`supabase/seed.sql`](supabase/seed.sql): sample brands, categories, products and tiers
   3. [`supabase/storage.sql`](supabase/storage.sql) (optional): a public bucket for image uploads from the admin panel
3. Go to **Project Settings → API** and copy the **Project URL** and the **anon public** key.

### 2. Frontend

```bash
npm install
cp .env.example .env      # then fill in the two values
npm run dev               # http://localhost:5173
```

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

If the variables are missing, the app shows a setup screen instead of crashing.

### 3. Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm test` | Run the unit and component tests |
| `npm run test:e2e` | Run the browser acceptance tests against the live site (needs Edge or Chrome) |
| `npm run build` | Typecheck and build for production |
| `npm run lint` | Lint with oxlint |

### 4. Deploy (Vercel)

1. Import the project on Vercel (framework preset: **Vite**).
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
3. Deploy. `vercel.json` rewrites every route to `index.html`, so deep links like `/products/:id` and `/admin` work.

---

## Project structure

```
supabase/
  schema.sql            Tables, constraints, save_product() transaction, RLS
  seed.sql              Sample healthcare catalog (products A/B/C + extras)
  storage.sql           Image bucket + policies
public/products/        Seed product illustrations (SVG)
src/
  types.ts              Domain types (Product, PricingTier, CartLine…)
  lib/
    money.ts            KWD <-> fils conversion and formatting
    pricing.ts          Bundle maths: line total, packs, per-pack, savings, quantity limits
    cart.ts             Cart reducer, live-price resolution, totals, safe persistence
    productForm.ts      Admin form schema (zod) + mapping to/from API input
    supabase.ts         Supabase client
  api/
    catalog.ts          All database access + friendly error messages
    hooks.ts            TanStack Query hooks; mutations refresh the storefront
  context/CartContext.tsx  Cart state, persisted per browser, synced across tabs
  components/           Layout, ProductCard, TierSelector, QuantityStepper, ConfirmDialog, UI states
  pages/
    HomePage.tsx  ProductDetailsPage.tsx  CartPage.tsx
    admin/        AdminLayout, AdminProductsPage, ProductFormPage, TaxonomyPage
  **/*.test.ts(x)       Tests next to the code they cover
```

The business rules live in pure functions in `src/lib/`, separate from React and from the database, which makes them easy to test and reason about. UI components call those functions and never repeat the price maths.

---

## Testing

`npm test` runs **31 automated tests**:

- **`money.test.ts`**: 3-decimal KWD formatting, float-safe conversion, admin price parsing.
- **`pricing.test.ts`**: the brief's 2 × 4-pack = 8 packs / 39.000 KWD example, the bundle price treated as a total (not per pack), savings, quantity validation and clamping.
- **`cart.test.ts`**: separate lines per offer, merging, quantity bounds, removal, multi-line totals, live price changes, deleted offers, and recovery from corrupted saved cart data.
- **`productForm.test.ts`**: admin validation (zero, negative and decimal units; invalid prices; duplicate bundle sizes; any number of tiers).
- **`storefront.test.tsx`**: UI flow tests. On the product details page: select the 4-pack, choose 2 bundles, see 39.000 KWD, add to cart. On the cart page: separate lines, quantity change, invalid input corrected, removal, empty state.

The SQL (schema, seed, the `save_product` transaction and all constraints) was also run against a real Postgres engine (PGlite). That run covered create and update with tier swaps and deletions, rejection of duplicate tier sizes, zero prices and zero units, blocked deletion of a brand in use, and cascade deletion of tiers.

### End-to-end acceptance tests (live site)

`npm run test:e2e` drives a real browser (Edge, via Playwright) against the **deployed** app. It runs **46 checks** that follow the PDF section by section:

- **Home:** products A/B/C show exactly 1/2/3 options, the Product C prices are correct, filtering works by brand, category and search, and you can add to cart from a card.
- **Details:** brand, category, image and all offers are shown; 4-pack × 2 gives **39.000 KWD / 8 packs**; other tiers recalculate; invalid quantities (0, 1000, letters) are corrected.
- **Cart:** separate lines per offer, correct line and grand totals, quantity updates, invalid quantity blocked, cart kept after a refresh, removal.
- **Admin:** create and rename a brand and a category (duplicates rejected); validation blocks bad prices, units and duplicate bundle sizes; create a product with 2 tiers and see it on the storefront after a refresh; edit it (rename, change price, add and remove tiers) and see the edits on the details page; a changed price is flagged in the cart; deleting a brand in use is blocked; deleting the product, brand and category works. The test cleans up after itself.
- **States:** product not found, page not found, empty cart, loading state, and error state with a working retry when the backend is unreachable.
- **Responsive:** no horizontal overflow at 375 px on the home, details, cart, admin list and admin form pages.
- No JavaScript errors in the console during the run.

Screenshots are saved to `e2e/screenshots/`.

---

## Known limitations

- **No authentication on the admin panel** (out of scope in the brief). RLS policies allow the public anon key to write to the catalog. In production, writes would be limited to an authenticated admin role.
- **The cart is stored per browser** (localStorage). The brief requires the catalog, not the cart, to be in the database. Prices are always re-checked against the database.
- Checkout, payment, orders and inventory are out of scope and not implemented. The checkout button is disabled.
- Uploaded images are not deleted from storage when a product is deleted or its image is replaced.
- The bundle quantity per cart line is capped at 99.
