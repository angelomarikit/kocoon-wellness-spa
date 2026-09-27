-- =============================================================================
-- Kocoon Wellness Spa — Storage bucket (isolated, safe for other projects)
-- =============================================================================
-- Creates a dedicated public bucket for this site only.
-- Folder rule: all files must live under kocoon-wellness-spa/...
-- Does NOT modify other buckets (e.g. public-assets) or other sites' files.
--
-- Run after 001_kocoon_wellness_spa.sql
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'kocoon-media',
  'kocoon-media',
  true,
  10485760, -- 10MB
  array[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'image/svg+xml'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Public read (website can display images)
drop policy if exists kocoon_media_public_read on storage.objects;
create policy kocoon_media_public_read
on storage.objects for select
to public
using (bucket_id = 'kocoon-media');

-- Uploads only under folder: kocoon-wellness-spa/...
-- Allowed for anon + authenticated so the CMS can upload with the anon key
-- without affecting other buckets / folders.
drop policy if exists kocoon_media_insert on storage.objects;
create policy kocoon_media_insert
on storage.objects for insert
to anon, authenticated
with check (
  bucket_id = 'kocoon-media'
  and (storage.foldername(name))[1] = 'kocoon-wellness-spa'
);

drop policy if exists kocoon_media_update on storage.objects;
create policy kocoon_media_update
on storage.objects for update
to anon, authenticated
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
on storage.objects for delete
to anon, authenticated
using (
  bucket_id = 'kocoon-media'
  and (storage.foldername(name))[1] = 'kocoon-wellness-spa'
);
