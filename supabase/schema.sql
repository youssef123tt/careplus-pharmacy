-- =====================================================================
-- Healthcare Store — database schema (PostgreSQL / Supabase)
-- Run this once in the Supabase SQL editor, then run seed.sql.
-- Safe to re-run: drops and recreates the catalog objects.
-- =====================================================================

drop function if exists public.save_product(jsonb, jsonb);
drop table if exists public.pricing_tiers cascade;
drop table if exists public.products cascade;
drop table if exists public.brands cascade;
drop table if exists public.categories cascade;

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Brands & categories
-- ---------------------------------------------------------------------
create table public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 1 and 80),
  created_at  timestamptz not null default now()
);
create unique index brands_name_unique on public.brands (lower(name));

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(trim(name)) between 1 and 80),
  created_at  timestamptz not null default now()
);
create unique index categories_name_unique on public.categories (lower(name));

-- ---------------------------------------------------------------------
-- Products — each belongs to exactly one brand and one category.
-- ON DELETE RESTRICT: a brand/category in use cannot be deleted.
-- ---------------------------------------------------------------------
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (length(trim(name)) between 1 and 120),
  description  text not null default '',
  image_url    text,
  brand_id     uuid not null references public.brands (id) on delete restrict,
  category_id  uuid not null references public.categories (id) on delete restrict,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index products_brand_idx on public.products (brand_id);
create index products_category_idx on public.products (category_id);

-- ---------------------------------------------------------------------
-- Pricing tiers — each tier is an independent bundle offer:
--   units_per_bundle packs sold together for bundle_price KWD (total).
-- bundle_price is the price of the WHOLE bundle, never a per-pack price.
-- KWD uses 3 decimal places (1 KWD = 1000 fils) -> numeric(10,3).
-- ---------------------------------------------------------------------
create table public.pricing_tiers (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  label             text not null default '' check (length(label) <= 60),
  units_per_bundle  integer not null check (units_per_bundle between 1 and 10000),
  bundle_price      numeric(10,3) not null check (bundle_price > 0),
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now(),
  -- Two offers of the same product cannot have the same bundle size.
  -- Deferred so tiers can be re-ordered/swapped inside one transaction.
  constraint pricing_tiers_unique_size unique (product_id, units_per_bundle)
    deferrable initially deferred
);
create index pricing_tiers_product_idx on public.pricing_tiers (product_id);

-- ---------------------------------------------------------------------
-- save_product: create or update a product AND replace its pricing tiers
-- in a single transaction, so the catalog is never left half-saved.
--   p_product: { id?, name, description, image_url, brand_id, category_id }
--   p_tiers:   [ { id?, label, units_per_bundle, bundle_price }, ... ]
-- Tiers with an id are updated, tiers without an id are inserted,
-- existing tiers missing from p_tiers are deleted.
-- ---------------------------------------------------------------------
create or replace function public.save_product(p_product jsonb, p_tiers jsonb)
returns uuid
language plpgsql
as $$
declare
  v_id    uuid;
  v_tier  jsonb;
  v_index integer := 0;
  v_keep  uuid[] := '{}';
  v_tier_id uuid;
begin
  if p_tiers is null or jsonb_typeof(p_tiers) <> 'array' or jsonb_array_length(p_tiers) = 0 then
    raise exception 'A product needs at least one pricing tier';
  end if;

  if nullif(p_product->>'id', '') is null then
    insert into public.products (name, description, image_url, brand_id, category_id)
    values (
      trim(p_product->>'name'),
      coalesce(p_product->>'description', ''),
      nullif(trim(coalesce(p_product->>'image_url', '')), ''),
      (p_product->>'brand_id')::uuid,
      (p_product->>'category_id')::uuid
    )
    returning id into v_id;
  else
    v_id := (p_product->>'id')::uuid;
    update public.products set
      name        = trim(p_product->>'name'),
      description = coalesce(p_product->>'description', ''),
      image_url   = nullif(trim(coalesce(p_product->>'image_url', '')), ''),
      brand_id    = (p_product->>'brand_id')::uuid,
      category_id = (p_product->>'category_id')::uuid,
      updated_at  = now()
    where id = v_id;
    if not found then
      raise exception 'Product % not found', v_id;
    end if;
  end if;

  for v_tier in select * from jsonb_array_elements(p_tiers) loop
    v_tier_id := nullif(v_tier->>'id', '')::uuid;
    if v_tier_id is not null and exists (
      select 1 from public.pricing_tiers where id = v_tier_id and product_id = v_id
    ) then
      update public.pricing_tiers set
        label            = coalesce(v_tier->>'label', ''),
        units_per_bundle = (v_tier->>'units_per_bundle')::integer,
        bundle_price     = (v_tier->>'bundle_price')::numeric,
        sort_order       = v_index
      where id = v_tier_id;
    else
      insert into public.pricing_tiers (product_id, label, units_per_bundle, bundle_price, sort_order)
      values (
        v_id,
        coalesce(v_tier->>'label', ''),
        (v_tier->>'units_per_bundle')::integer,
        (v_tier->>'bundle_price')::numeric,
        v_index
      )
      returning id into v_tier_id;
    end if;
    v_keep := v_keep || v_tier_id;
    v_index := v_index + 1;
  end loop;

  delete from public.pricing_tiers
  where product_id = v_id and not (id = any (v_keep));

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- Authentication is out of scope for this assessment, so the public
-- (anon) role may read and write the catalog. In production, writes
-- would be restricted to an authenticated admin role.
-- ---------------------------------------------------------------------
alter table public.brands        enable row level security;
alter table public.categories    enable row level security;
alter table public.products      enable row level security;
alter table public.pricing_tiers enable row level security;

create policy "public full access" on public.brands        for all using (true) with check (true);
create policy "public full access" on public.categories    for all using (true) with check (true);
create policy "public full access" on public.products      for all using (true) with check (true);
create policy "public full access" on public.pricing_tiers for all using (true) with check (true);

-- Newer Supabase projects do not auto-grant table privileges to the API roles,
-- so grant them explicitly (RLS policies above still apply on top of these).
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete
  on public.brands, public.categories, public.products, public.pricing_tiers
  to anon, authenticated;
grant execute on function public.save_product(jsonb, jsonb) to anon, authenticated;

-- Make the new function visible to the REST API immediately
notify pgrst, 'reload schema';
