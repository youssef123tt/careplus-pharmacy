-- =====================================================================
-- Optional: image uploads from the admin panel (run after schema.sql).
-- Without this, admins can still paste an image URL.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images public read"   on storage.objects;
drop policy if exists "product images public upload" on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product images public upload" on storage.objects
  for insert with check (bucket_id = 'product-images');
