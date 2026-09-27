-- =============================================================================
-- Kocoon CMS write policies + ensure storage bucket
-- Safe: only slug kocoon-wellness-spa / bucket kocoon-media
-- =============================================================================

-- Re-apply bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kocoon-media',
  'kocoon-media',
  true,
  10485760,
  array['image/png','image/jpeg','image/jpg','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies (public read + write only under kocoon-wellness-spa/)
drop policy if exists kocoon_media_public_read on storage.objects;
create policy kocoon_media_public_read
on storage.objects for select to public
using (bucket_id = 'kocoon-media');

drop policy if exists kocoon_media_insert on storage.objects;
create policy kocoon_media_insert
on storage.objects for insert to public
with check (
  bucket_id = 'kocoon-media'
  and (storage.foldername(name))[1] = 'kocoon-wellness-spa'
);

drop policy if exists kocoon_media_update on storage.objects;
create policy kocoon_media_update
on storage.objects for update to public
using (
  bucket_id = 'kocoon-media'
  and (storage.foldername(name))[1] = 'kocoon-wellness-spa'
)
with check (
  bucket_id = 'kocoon-media'
  and (storage.foldername(name))[1] = 'kocoon-wellness-spa'
);

drop policy if exists kocoon_media_delete on storage.objects;
create policy kocoon_media_delete
on storage.objects for delete to public
using (
  bucket_id = 'kocoon-media'
  and (storage.foldername(name))[1] = 'kocoon-wellness-spa'
);

-- Allow CMS writes for this site only (anon key can save after upload)
-- Does not grant access to any other cms_sites rows.

create or replace function public.cms_kocoon_site_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.cms_sites where slug = 'kocoon-wellness-spa' limit 1;
$$;

grant execute on function public.cms_kocoon_site_id() to anon, authenticated, public;

drop policy if exists cms_staff_kocoon_write on public.cms_staff;
create policy cms_staff_kocoon_write on public.cms_staff
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_gallery_kocoon_write on public.cms_gallery;
create policy cms_gallery_kocoon_write on public.cms_gallery
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_services_kocoon_write on public.cms_services;
create policy cms_services_kocoon_write on public.cms_services
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_page_content_kocoon_write on public.cms_page_content;
create policy cms_page_content_kocoon_write on public.cms_page_content
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_settings_kocoon_write on public.cms_settings;
create policy cms_settings_kocoon_write on public.cms_settings
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_seo_kocoon_write on public.cms_seo;
create policy cms_seo_kocoon_write on public.cms_seo
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_testimonials_kocoon_write on public.cms_testimonials;
create policy cms_testimonials_kocoon_write on public.cms_testimonials
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());

drop policy if exists cms_faqs_kocoon_write on public.cms_faqs;
create policy cms_faqs_kocoon_write on public.cms_faqs
for all to anon, authenticated
using (site_id = public.cms_kocoon_site_id())
with check (site_id = public.cms_kocoon_site_id());
