-- =====================================================================
-- Healthcare Store — sample data (run after schema.sql)
-- Required test products:
--   Product A (1 pricing option): Digital Thermometer
--   Product B (2 pricing options): Hand Sanitizer Gel
--   Product C (3 pricing options): Vitamin C 1000mg  -> 5.500 / 19.500 / 55.000 KWD
-- Images are served by the frontend from /public/products/*.svg
-- =====================================================================

truncate public.pricing_tiers, public.products, public.brands, public.categories cascade;

insert into public.brands (id, name) values
  ('b0000000-0000-0000-0000-000000000001', 'VitaWell'),
  ('b0000000-0000-0000-0000-000000000002', 'PureCare'),
  ('b0000000-0000-0000-0000-000000000003', 'MediGuard');

insert into public.categories (id, name) values
  ('c0000000-0000-0000-0000-000000000001', 'Vitamins & Supplements'),
  ('c0000000-0000-0000-0000-000000000002', 'Personal Care'),
  ('c0000000-0000-0000-0000-000000000003', 'First Aid & Devices');

insert into public.products (id, name, description, image_url, brand_id, category_id) values
  ('a0000000-0000-0000-0000-000000000001',
   'Digital Thermometer',
   'Fast and accurate digital thermometer with a flexible tip. Reads oral, underarm or rectal temperature in about 10 seconds, with fever alarm and memory of the last reading. Battery included.',
   '/products/thermometer.svg',
   'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003'),

  ('a0000000-0000-0000-0000-000000000002',
   'Hand Sanitizer Gel 250 ml',
   'Alcohol-based hand sanitizer gel (70% ethanol) enriched with aloe vera to keep hands soft. Kills 99.9% of common germs without water. Pump bottle, 250 ml per pack.',
   '/products/sanitizer.svg',
   'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002'),

  ('a0000000-0000-0000-0000-000000000003',
   'Vitamin C 1000 mg Effervescent',
   'High-strength vitamin C effervescent tablets with zinc to support the immune system. Orange flavour, sugar free. One tablet daily dissolved in water. 20 tablets per pack.',
   '/products/vitamin-c.svg',
   'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),

  ('a0000000-0000-0000-0000-000000000004',
   'Omega-3 Fish Oil 1000 mg',
   'Purified fish oil softgels providing EPA and DHA to support heart, brain and eye health. Odourless, enteric-coated. 60 softgels per pack.',
   '/products/omega3.svg',
   'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),

  ('a0000000-0000-0000-0000-000000000005',
   'Adhesive Bandages (40 strips)',
   'Breathable, water-resistant adhesive bandages in assorted sizes with a non-stick wound pad. Ideal for minor cuts and scrapes at home or on the go. 40 strips per pack.',
   '/products/bandages.svg',
   'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003'),

  ('a0000000-0000-0000-0000-000000000006',
   'Gentle Moisturizing Lotion 400 ml',
   'Fragrance-free daily moisturizer with ceramides and glycerin for dry and sensitive skin. Dermatologist tested, non-greasy. 400 ml per pack.',
   '/products/lotion.svg',
   'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002');

insert into public.pricing_tiers (product_id, label, units_per_bundle, bundle_price, sort_order) values
  -- Product A: exactly one option
  ('a0000000-0000-0000-0000-000000000001', 'Single pack', 1, 4.750, 0),

  -- Product B: exactly two options
  ('a0000000-0000-0000-0000-000000000002', 'Single pack', 1, 1.250, 0),
  ('a0000000-0000-0000-0000-000000000002', 'Family pack', 4, 4.500, 1),

  -- Product C: exactly three options (prices from the brief)
  ('a0000000-0000-0000-0000-000000000003', 'Single pack',  1,  5.500, 0),
  ('a0000000-0000-0000-0000-000000000003', 'Value pack',   4, 19.500, 1),
  ('a0000000-0000-0000-0000-000000000003', 'Saver pack',  12, 55.000, 2),

  -- Extra catalog items
  ('a0000000-0000-0000-0000-000000000004', 'Single pack', 1, 6.250, 0),
  ('a0000000-0000-0000-0000-000000000004', 'Triple pack', 3, 17.000, 1),

  ('a0000000-0000-0000-0000-000000000005', 'Single pack', 1, 0.950, 0),
  ('a0000000-0000-0000-0000-000000000005', 'Value pack',  4, 3.400, 1),
  ('a0000000-0000-0000-0000-000000000005', 'Clinic pack', 12, 9.600, 2),

  ('a0000000-0000-0000-0000-000000000006', 'Single pack', 1, 3.900, 0);
