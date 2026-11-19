# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: shoppers in Kuwait buying everyday healthcare products (vitamins, personal care, first aid) online, on phone or desktop. They want to find a product, understand the bundle offers, and see exactly what they will pay in KWD.

Secondary: the store manager, who maintains the catalog (products, brands, categories, pricing tiers) from the admin panel without touching code.

The product is also evaluated by National Care Group reviewers as a technical assessment; they judge it as if it were a real store.

## Product Purpose

A medical e-commerce storefront with multi-tier bundle pricing. Each product offers one or more independent bundle offers (e.g. 1 pack / 4 packs / 12 packs), each with its own total price. Success: a customer can browse by brand and category, choose an offer and number of bundles, and trust the totals; a manager can change the catalog and see it reflected on the storefront immediately.

## Positioning

Bundle offers are first-class: the bundle price is always a total for the bundle (never a per-pack price), different offers of the same product stay separate in the cart, and the internal pack quantity is always shown (2 × 4-pack = 8 packs).

## Operating Context

- Storefront: home/listing with brand and category filters and search, product details, cart.
- Admin: products list, product form with dynamic pricing-tier editor, brands, categories.
- Prices in Kuwaiti dinar with three decimals (e.g. 39.000 KWD).
- Out of scope: authentication, checkout, payment, delivery, orders, inventory.

## Capabilities and Constraints

- React + TypeScript + Tailwind CSS v4, Supabase (PostgreSQL) backend, deployed on Vercel.
- English only; no Arabic/RTL.
- Existing accessible names and `data-testid` attributes are relied on by the unit and end-to-end test suites and must be preserved.
- Light and dark themes are required.

## Brand Commitments

- Name: **CarePlus** (keep).
- Sample brands: VitaWell, PureCare, MediGuard (invented). Sample data only.

## Evidence on Hand

- Product illustrations: `public/products/*.svg` (6 seed products).
- No real testimonials, reviews, delivery promises, licences, or certifications exist; do not fabricate them.

## Product Principles

1. Price clarity over persuasion: totals, pack counts and savings are always explicit and correct.
2. Trustworthy like a local pharmacy, not flashy like a marketplace.
3. Fast, obvious paths: browse → choose offer → cart in a few taps on a phone.
4. The admin is a calm working tool: scanability and correctness before expression.
