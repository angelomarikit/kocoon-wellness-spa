-- =============================================================================
-- Kocoon Wellness Spa — STANDALONE schema + seed
-- Slug: kocoon-wellness-spa
-- =============================================================================
-- Use this file when the shared Apex Pages tables are NOT present
-- (error: relation "public.services" does not exist).
--
-- SAFE FOR OTHER APPS IN THE SAME DATABASE:
--   • All tables use the cms_ prefix (does not touch Apex / other app tables)
--   • Seed / deletes only target slug = 'kocoon-wellness-spa'
--   • Idempotent: safe to re-run
--
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.cms_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Core: sites (multi-tenant by slug)
-- ---------------------------------------------------------------------------

create table if not exists public.cms_sites (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  business_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_sites_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

drop trigger if exists cms_sites_set_updated_at on public.cms_sites;
create trigger cms_sites_set_updated_at
before update on public.cms_sites
for each row execute function public.cms_set_updated_at();

-- Admins linked to a site (for RLS when Auth is used)
create table if not exists public.cms_site_admins (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  unique (site_id, user_id)
);

create index if not exists idx_cms_site_admins_user on public.cms_site_admins (user_id);
create index if not exists idx_cms_site_admins_site on public.cms_site_admins (site_id);

create or replace function public.cms_is_site_admin(p_site_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.cms_site_admins a
    where a.site_id = p_site_id
      and a.user_id = auth.uid()
  );
$$;

create or replace function public.cms_site_id_by_slug(p_slug text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.cms_sites where slug = p_slug and is_active limit 1;
$$;

grant execute on function public.cms_is_site_admin(uuid) to anon, authenticated;
grant execute on function public.cms_site_id_by_slug(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Settings / SEO / page content (1 row per site)
-- ---------------------------------------------------------------------------

create table if not exists public.cms_settings (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.cms_sites (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists cms_settings_set_updated_at on public.cms_settings;
create trigger cms_settings_set_updated_at
before update on public.cms_settings
for each row execute function public.cms_set_updated_at();

create table if not exists public.cms_seo (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.cms_sites (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists cms_seo_set_updated_at on public.cms_seo;
create trigger cms_seo_set_updated_at
before update on public.cms_seo
for each row execute function public.cms_set_updated_at();

create table if not exists public.cms_page_content (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null unique references public.cms_sites (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists cms_page_content_set_updated_at on public.cms_page_content;
create trigger cms_page_content_set_updated_at
before update on public.cms_page_content
for each row execute function public.cms_set_updated_at();

-- ---------------------------------------------------------------------------
-- Collections
-- ---------------------------------------------------------------------------

create table if not exists public.cms_services (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  slug text not null,
  name text not null,
  category text not null default '',
  short_description text not null default '',
  description text not null default '',
  price numeric(12, 2),
  discounted_price numeric(12, 2),
  duration_minutes integer,
  duration_label text not null default '',
  image_url text not null default '',
  gallery_image_url text not null default '',
  benefits text[] not null default '{}',
  inclusions text[] not null default '{}',
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  cta_label text not null default 'View Details',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

drop trigger if exists cms_services_set_updated_at on public.cms_services;
create trigger cms_services_set_updated_at
before update on public.cms_services
for each row execute function public.cms_set_updated_at();

create index if not exists idx_cms_services_site on public.cms_services (site_id, sort_order);

create table if not exists public.cms_staff (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  name text not null,
  position text not null default '',
  specialty text not null default '',
  bio text not null default '',
  credentials text not null default '',
  years_experience integer not null default 0,
  image_url text not null default '',
  social_url text not null default '',
  featured boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists cms_staff_set_updated_at on public.cms_staff;
create trigger cms_staff_set_updated_at
before update on public.cms_staff
for each row execute function public.cms_set_updated_at();

create index if not exists idx_cms_staff_site on public.cms_staff (site_id, sort_order);

create table if not exists public.cms_gallery (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  image_url text not null,
  caption text not null default '',
  category text not null default '',
  featured boolean not null default false,
  aspect text not null default 'square',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_cms_gallery_site on public.cms_gallery (site_id, sort_order);

create table if not exists public.cms_testimonials (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  client_name text not null,
  rating integer not null default 5 check (rating between 1 and 5),
  message text not null default '',
  image_url text not null default '',
  review_date date,
  featured boolean not null default false,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists idx_cms_testimonials_site on public.cms_testimonials (site_id, created_at desc);

create table if not exists public.cms_faqs (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  question text not null,
  answer text not null default '',
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_cms_faqs_site on public.cms_faqs (site_id, sort_order);

create table if not exists public.cms_inquiries (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.cms_sites (id) on delete cascade,
  name text not null,
  phone text not null default '',
  email text not null default '',
  service text not null default '',
  preferred_date text not null default '',
  message text not null default '',
  branch text not null default '',
  status text not null default 'unread'
    check (status in ('unread', 'read', 'replied', 'archived')),
  created_at timestamptz not null default now()
);

create index if not exists idx_cms_inquiries_site on public.cms_inquiries (site_id, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------

alter table public.cms_sites enable row level security;
alter table public.cms_site_admins enable row level security;
alter table public.cms_settings enable row level security;
alter table public.cms_seo enable row level security;
alter table public.cms_page_content enable row level security;
alter table public.cms_services enable row level security;
alter table public.cms_staff enable row level security;
alter table public.cms_gallery enable row level security;
alter table public.cms_testimonials enable row level security;
alter table public.cms_faqs enable row level security;
alter table public.cms_inquiries enable row level security;

-- Public read of active site content
drop policy if exists cms_sites_public_read on public.cms_sites;
create policy cms_sites_public_read on public.cms_sites for select
  using (is_active = true);

drop policy if exists cms_settings_public_read on public.cms_settings;
create policy cms_settings_public_read on public.cms_settings for select
  using (exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_seo_public_read on public.cms_seo;
create policy cms_seo_public_read on public.cms_seo for select
  using (exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_page_content_public_read on public.cms_page_content;
create policy cms_page_content_public_read on public.cms_page_content for select
  using (exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_services_public_read on public.cms_services;
create policy cms_services_public_read on public.cms_services for select
  using (is_active = true and exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_staff_public_read on public.cms_staff;
create policy cms_staff_public_read on public.cms_staff for select
  using (is_active = true and exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_gallery_public_read on public.cms_gallery;
create policy cms_gallery_public_read on public.cms_gallery for select
  using (is_active = true and exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_testimonials_public_read on public.cms_testimonials;
create policy cms_testimonials_public_read on public.cms_testimonials for select
  using (is_published = true and exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

drop policy if exists cms_faqs_public_read on public.cms_faqs;
create policy cms_faqs_public_read on public.cms_faqs for select
  using (is_active = true and exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

-- Public can submit inquiries
drop policy if exists cms_inquiries_public_insert on public.cms_inquiries;
create policy cms_inquiries_public_insert on public.cms_inquiries for insert
  to anon, authenticated
  with check (exists (select 1 from public.cms_sites s where s.id = site_id and s.is_active));

-- Admin full access for linked site
drop policy if exists cms_sites_admin_all on public.cms_sites;
create policy cms_sites_admin_all on public.cms_sites for all to authenticated
  using (public.cms_is_site_admin(id)) with check (public.cms_is_site_admin(id));

drop policy if exists cms_settings_admin_all on public.cms_settings;
create policy cms_settings_admin_all on public.cms_settings for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_seo_admin_all on public.cms_seo;
create policy cms_seo_admin_all on public.cms_seo for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_page_content_admin_all on public.cms_page_content;
create policy cms_page_content_admin_all on public.cms_page_content for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_services_admin_all on public.cms_services;
create policy cms_services_admin_all on public.cms_services for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_staff_admin_all on public.cms_staff;
create policy cms_staff_admin_all on public.cms_staff for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_gallery_admin_all on public.cms_gallery;
create policy cms_gallery_admin_all on public.cms_gallery for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_testimonials_admin_all on public.cms_testimonials;
create policy cms_testimonials_admin_all on public.cms_testimonials for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_faqs_admin_all on public.cms_faqs;
create policy cms_faqs_admin_all on public.cms_faqs for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_inquiries_admin_all on public.cms_inquiries;
create policy cms_inquiries_admin_all on public.cms_inquiries for all to authenticated
  using (public.cms_is_site_admin(site_id)) with check (public.cms_is_site_admin(site_id));

drop policy if exists cms_site_admins_self_read on public.cms_site_admins;
create policy cms_site_admins_self_read on public.cms_site_admins for select to authenticated
  using (user_id = auth.uid() or public.cms_is_site_admin(site_id));

-- ---------------------------------------------------------------------------
-- Seed ONLY kocoon-wellness-spa
-- ---------------------------------------------------------------------------

do $$
declare
  v_slug    text := 'kocoon-wellness-spa';
  v_site_id uuid;
begin
  insert into public.cms_sites (slug, business_name, is_active)
  values (v_slug, 'Kocoon Wellness Spa', true)
  on conflict (slug) do update
  set business_name = excluded.business_name,
      is_active = true,
      updated_at = now()
  returning id into v_site_id;

  if v_site_id is null then
    select id into v_site_id from public.cms_sites where slug = v_slug;
  end if;

  insert into public.cms_settings (site_id, data)
  values (
    v_site_id,
    jsonb_build_object(
      'businessName', 'Kocoon Wellness Spa',
      'phone', '09151232418',
      'phoneGlobe', '09151232418',
      'phoneSmart', '09622188796',
      'secondaryPhone', '09104893903',
      'secondaryPhoneLabel', 'Smart / TNT',
      'email', 'kocoonwellnessspa@gmail.com',
      'secondaryEmail', 'kocoonmanila@gmail.com',
      'address', '116 Purok Bubon, Loakan Proper, Baguio City',
      'addressLabel', 'Baguio City',
      'secondaryAddress', '1947 J. Gabriel Street, Baclaran, Parañaque City',
      'secondaryAddressLabel', 'Parañaque City',
      'googleMapsUrl', 'https://maps.google.com/?q=116+Purok+Bubon+Loakan+Proper+Baguio+City',
      'facebookUrl', '',
      'facebookUrlBaclaran', '',
      'instagramUrl', '',
      'messengerUrl', 'https://www.facebook.com/messages/t/1141805542359287',
      'messengerUrlBaclaran', 'https://www.facebook.com/messages/t/1342439362286859',
      'logoUrl', '/logo.png',
      'faviconUrl', '/logo.png',
      'primaryGold', '#D4AF37',
      'backgroundColor', '#090909',
      'slugLocked', true,
      'businessHours', jsonb_build_array(
        jsonb_build_object('day', 'Monday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false),
        jsonb_build_object('day', 'Tuesday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false),
        jsonb_build_object('day', 'Wednesday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false),
        jsonb_build_object('day', 'Thursday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false),
        jsonb_build_object('day', 'Friday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false),
        jsonb_build_object('day', 'Saturday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false),
        jsonb_build_object('day', 'Sunday', 'open', '3:00 PM', 'close', '3:00 AM', 'closed', false)
      )
    )
  )
  on conflict (site_id) do update set data = excluded.data, updated_at = now();

  insert into public.cms_seo (site_id, data)
  values (
    v_site_id,
    jsonb_build_object(
      'title', 'Kocoon Wellness Spa | Wellness Spa in Baguio City',
      'metaDescription', 'Experience personalized wellness and relaxation at Kocoon Wellness Spa in Loakan Proper, Baguio City. Massage, rejuvenation, and self-care in a calm mountain retreat.',
      'keywords', jsonb_build_array(
        'Kocoon Wellness Spa', 'Wellness Spa Baguio', 'Spa Baguio City', 'Massage Baguio',
        'Massage Spa Baguio', 'Wellness Center Baguio', 'Spa Loakan Baguio',
        'Relaxation Massage Baguio', 'Wellness Treatment Baguio'
      ),
      'ogTitle', 'Kocoon Wellness Spa — Restore. Renew. Reconnect.',
      'ogDescription', 'A premium wellness destination in Loakan Proper, Baguio City. Book your massage and relaxation experience today.',
      'ogImage', '/logo.png',
      'facebookUrl', '',
      'instagramUrl', '',
      'canonicalUrl', 'https://kocoonwellnessspa.vercel.app'
    )
  )
  on conflict (site_id) do update set data = excluded.data, updated_at = now();

  insert into public.cms_page_content (site_id, data)
  values (
    v_site_id,
    jsonb_build_object(
      'hero', jsonb_build_object(
        'badge', 'WELLNESS • RELAXATION • REJUVENATION',
        'title', E'Restore Your Balance.\nRenew Your Body.\nReconnect With Yourself.',
        'description', 'Experience personalized wellness and relaxation at Kocoon Wellness Spa in the cool and calming atmosphere of Baguio City.',
        'primaryButton', 'Book an Appointment',
        'secondaryButton', 'Explore Services',
        'imageUrl', '/hero-poster.jpg',
        'videoUrl', '/hero.mp4'
      ),
      'welcome', jsonb_build_object(
        'heading', 'Welcome to Kocoon Wellness Spa',
        'subheading', 'Your sanctuary in the City of Pines',
        'body', 'Kocoon Wellness Spa is a relaxing wellness destination in Loakan Proper, Baguio City, offering treatments designed to help guests relax, recharge and restore balance. Step into a calm space where modern care meets thoughtful hospitality.',
        'imageUrl', '/spa/spa-3.jpg',
        'ctaLabel', 'Discover Our Story',
        'ctaHref', '#about'
      ),
      'about', jsonb_build_object(
        'eyebrow', 'About Kocoon',
        'title', 'A Calm Retreat for Body and Mind',
        'description', 'Nestled in Loakan Proper, Kocoon Wellness Spa offers a quiet escape from the pace of everyday life. Our treatments are crafted to ease tension, restore energy, and leave you feeling centered.',
        'secondaryDescription', 'From therapeutic massage to restorative wellness rituals, every visit is guided by care, cleanliness, and a genuine commitment to your comfort.',
        'imageUrl', '/spa/spa-1.jpg',
        'stats', jsonb_build_array(
          jsonb_build_object('id', 'stat-1', 'label', 'Years of Experience', 'value', '8+'),
          jsonb_build_object('id', 'stat-2', 'label', 'Happy Clients', 'value', '2,500+'),
          jsonb_build_object('id', 'stat-3', 'label', 'Wellness Services', 'value', '12+'),
          jsonb_build_object('id', 'stat-4', 'label', 'Professional Staff', 'value', '10+')
        )
      ),
      'whyChoose', jsonb_build_object(
        'title', 'Why Choose Kocoon',
        'subtitle', 'Thoughtful care in every detail of your wellness visit.',
        'cards', jsonb_build_array(
          jsonb_build_object('id', 'why-1', 'title', 'Professional Wellness Care', 'description', 'Skilled therapists focused on comfort, technique, and lasting relief.', 'icon', 'HeartPulse'),
          jsonb_build_object('id', 'why-2', 'title', 'Relaxing Environment', 'description', 'A calm, clean space designed for quiet rest and recovery.', 'icon', 'Leaf'),
          jsonb_build_object('id', 'why-3', 'title', 'Personalized Treatment', 'description', 'Sessions tailored to your needs, pressure preference, and goals.', 'icon', 'Sparkles'),
          jsonb_build_object('id', 'why-4', 'title', 'Experienced Staff', 'description', 'Trained wellness professionals who prioritize safety and care.', 'icon', 'Users'),
          jsonb_build_object('id', 'why-5', 'title', 'Clean & Comfortable Facilities', 'description', 'Well-kept treatment rooms with attention to hygiene and comfort.', 'icon', 'ShieldCheck'),
          jsonb_build_object('id', 'why-6', 'title', 'Convenient Baguio Location', 'description', 'Easily reachable in Loakan Proper, with the cool mountain air as your backdrop.', 'icon', 'MapPin')
        )
      ),
      'experience', jsonb_build_object(
        'title', E'More Than a Treatment.\nA Complete Wellness Experience.',
        'description', 'From the moment you arrive, every detail is designed to slow your pace and renew your spirit.',
        'backgroundImageUrl', '/spa/spa-2.jpg'
      ),
      'bookingCta', jsonb_build_object(
        'title', 'Your Time to Relax Starts Here.',
        'description', 'Reserve your session and give yourself the pause you deserve.',
        'primaryButton', 'Call Us',
        'secondaryButton', 'Book Appointment',
        'tertiaryButton', 'Message Us'
      ),
      'footer', jsonb_build_object(
        'description', 'Kocoon Wellness Spa — a premium wellness destination in Loakan Proper, Baguio City for relaxation, restoration, and self-care.'
      )
    )
  )
  on conflict (site_id) do update set data = excluded.data, updated_at = now();

  -- Re-seed collections for THIS site only
  delete from public.cms_services where site_id = v_site_id;
  delete from public.cms_gallery where site_id = v_site_id;
  delete from public.cms_testimonials where site_id = v_site_id;
  delete from public.cms_faqs where site_id = v_site_id;
  delete from public.cms_staff where site_id = v_site_id;

  insert into public.cms_services (
    site_id, slug, name, category, short_description, description,
    duration_minutes, duration_label, image_url, gallery_image_url,
    benefits, inclusions, featured, is_active, sort_order, cta_label
  ) values
    (v_site_id, 'auto-massage-chair', 'Auto Massage Chair', 'Auto Massage Chair',
      'Quick, convenient automated massage sessions for a refreshing break.',
      'Unwind with our auto massage chair sessions. Choose from 15, 20, 25, or 30-minute options for a convenient wellness break.',
      30, '15 / 20 / 25 / 30 Minutes', '/spa/spa-3.jpg', '/spa/spa-3.jpg',
      array['Quick relaxation','Convenient seating massage','Flexible short sessions'],
      array['15 Minutes Massage','20 Minutes Massage','25 Minutes Massage','30 Minutes Massage'],
      true, true, 1, 'View Details'),
    (v_site_id, 'kws-signature-massage', 'KWS Signature Massage', 'Traditional Massage',
      'Our signature blend of Swedish, Shiatsu, Thai, and basic chiro techniques.',
      'KWS Signature Massage combines Swedish, Shiatsu, Thai, and basic chiro techniques for a complete restorative experience. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/spa/spa-2.jpg', '/spa/spa-2.jpg',
      array['Full-body restoration','Mixed technique approach','Personalized pressure'],
      array['Swedish / Shiatsu / Thai / Basic Chiro','Free foot wash'],
      true, true, 2, 'View Details'),
    (v_site_id, 'kws-combination-massage', 'KWS Combination Massage', 'Traditional Massage',
      'A balanced mix of Swedish, Shiatsu, and Thai massage techniques.',
      'Enjoy a combination of Swedish, Shiatsu, and Thai massage styles tailored to your comfort. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/spa/spa-4.jpg', '/spa/spa-4.jpg',
      array['Balanced technique mix','Deep relaxation','Improved mobility'],
      array['Swedish / Shiatsu / Thai','Free foot wash'],
      true, true, 3, 'View Details'),
    (v_site_id, 'kws-thai-massage', 'KWS Thai Massage', 'Traditional Massage',
      'Traditional dry Thai massage focused on stretch and release.',
      'A dry Thai massage experience that uses rhythmic pressure and stretching to release tension. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/spa/spa-2.jpg', '/hero.jpg',
      array['Improves flexibility','Releases tight muscles','Energizing stretch work'],
      array['Dry massage technique','Free foot wash'],
      false, true, 4, 'View Details'),
    (v_site_id, 'kws-shiatsu-massage', 'KWS Shiatsu Massage', 'Traditional Massage',
      'Dry Shiatsu massage using focused finger and palm pressure.',
      'Shiatsu dry massage using precise finger and palm pressure to ease tension points. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/spa/spa-4.jpg', '/spa/spa-3.jpg',
      array['Targets pressure points','Supports circulation','Calming body balance'],
      array['Dry massage technique','Free foot wash'],
      false, true, 5, 'View Details'),
    (v_site_id, 'kws-swedish-massage', 'KWS Swedish Massage', 'Traditional Massage',
      'Classic Swedish massage with scented massage oil.',
      'A soothing Swedish massage with scented oil to ease muscle tension and promote deep calm. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/hero.jpg', '/spa/spa-2.jpg',
      array['Gentle full-body ease','Scented oil comfort','Stress relief'],
      array['Scented massage oil','Free foot wash'],
      true, true, 6, 'View Details'),
    (v_site_id, 'kws-signature-massage-plus', 'KWS Signature Massage Plus', 'Traditional Massage Plus',
      'Signature massage enhanced with Hot Stone or Ventosa.',
      'Our signature Swedish / Shiatsu / Thai / basic chiro session upgraded with Hot Stone or Ventosa. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/spa/spa-2.jpg', '/spa/spa-6.jpg',
      array['Signature technique blend','Hot Stone or Ventosa upgrade','Deeper muscle relief'],
      array['Swedish / Shiatsu / Thai / Basic Chiro','Hot Stone or Ventosa','Free foot wash'],
      true, true, 7, 'View Details'),
    (v_site_id, 'kws-combination-massage-plus', 'KWS Combination Massage Plus', 'Traditional Massage Plus',
      'Combination massage with Hot Stone or Ventosa therapy.',
      'Swedish, Shiatsu, and Thai techniques plus Hot Stone or Ventosa for enhanced warmth and recovery. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/spa/spa-4.jpg', '/spa/spa-4.jpg',
      array['Technique combination','Therapeutic heat options','Longer-lasting ease'],
      array['Swedish / Shiatsu / Thai','Hot Stone or Ventosa','Free foot wash'],
      false, true, 8, 'View Details'),
    (v_site_id, 'kws-swedish-massage-plus', 'KWS Swedish Massage Plus', 'Traditional Massage Plus',
      'Swedish massage elevated with Hot Stone or Ventosa.',
      'Classic Swedish massage upgraded with Hot Stone or Ventosa for deeper comfort. Available in 1 hour, 1.5 hours, or 2 hours, with a free foot wash.',
      60, '1 / 1.5 / 2 Hours', '/hero.jpg', '/spa/spa-3.jpg',
      array['Oil-based Swedish flow','Hot Stone or Ventosa option','Deep calm'],
      array['Hot Stone or Ventosa','Free foot wash'],
      false, true, 9, 'View Details'),
    (v_site_id, 'kws-signature-massage-deluxe', 'KWS Signature Massage Deluxe', 'Traditional Massage Deluxe',
      'Premium signature ritual with Turkish Bath and Tantra options.',
      'Our deluxe signature experience includes Swedish, Shiatsu, Thai, basic chiro, Turkish Bath, and Tantra elements. Available in 1 hour or 1.5 hours, with a free foot wash.',
      90, '1 / 1.5 Hours', '/spa/spa-7.jpg', '/spa/spa-2.jpg',
      array['Premium multi-technique ritual','Turkish Bath inclusion','Deeply restorative'],
      array['Swedish / Shiatsu / Thai / Basic Chiro','Turkish Bath','Tantra','Free foot wash'],
      true, true, 10, 'View Details'),
    (v_site_id, 'kws-combination-massage-deluxe', 'KWS Combination Massage Deluxe', 'Traditional Massage Deluxe',
      'Combination massage deluxe with Turkish Bath.',
      'A deluxe combination of Swedish, Shiatsu, and Thai massage with Turkish Bath. Available in 1 hour or 1.5 hours, with a free foot wash.',
      90, '1 / 1.5 Hours', '/spa/spa-6.jpg', '/spa/spa-4.jpg',
      array['Deluxe combination care','Turkish Bath inclusion','Elevated relaxation'],
      array['Swedish / Shiatsu / Thai','Turkish Bath','Free foot wash'],
      false, true, 11, 'View Details'),
    (v_site_id, 'hot-stone-or-ventosa-therapy', 'Hot Stone or Ventosa Therapy', 'Additional Services',
      'Add warmth and therapeutic pressure with Hot Stone or Ventosa.',
      'Choose Hot Stone or Ventosa therapy as an add-on or focused session to ease muscle tightness and support deeper relaxation.',
      30, 'Add-on Therapy', '/spa/spa-2.jpg', '/spa/spa-2.jpg',
      array['Relieves stiffness','Improves warmth and comfort','Pairs well with massage'],
      array['Hot Stone or Ventosa option'],
      false, true, 12, 'View Details'),
    (v_site_id, 'ear-candling-therapy', 'Ear Candling Therapy', 'Additional Services',
      'Gentle ear candling for a soothing sensory reset.',
      'A calming ear candling therapy session designed to help you feel lighter and more relaxed.',
      30, 'Therapy Session', '/spa/spa-6.jpg', '/spa/spa-6.jpg',
      array['Soothing sensory care','Quiet relaxation','Comfort-focused session'],
      array['Ear candling therapy'],
      false, true, 13, 'View Details'),
    (v_site_id, 'hand-spa', 'Hand Spa', 'Additional Services',
      'Nourishing hand spa care for soft, refreshed hands.',
      'A relaxing hand spa treatment to cleanse, care for, and refresh tired hands.',
      45, 'Hand Care', '/spa/spa-7.jpg', '/spa/spa-7.jpg',
      array['Softens hands','Relaxing short treatment','Great add-on service'],
      array['Hand spa treatment'],
      false, true, 14, 'View Details'),
    (v_site_id, 'foot-spa', 'Foot Spa', 'Additional Services',
      'Reviving foot spa care after a long day.',
      'A refreshing foot spa session to ease tired feet and leave you feeling renewed.',
      45, 'Foot Care', '/spa/spa-3.jpg', '/spa/spa-5.jpg',
      array['Eases foot fatigue','Refreshing cleanse','Ideal after travel or work'],
      array['Foot spa treatment'],
      false, true, 15, 'View Details'),
    (v_site_id, 'manicure', 'Manicure', 'Additional Services',
      'Cleaning with polish for neat, cared-for nails.',
      'A manicure service with cleaning and polish to keep your nails neat and well-maintained.',
      45, 'Cleaning with Polish', '/spa/spa-7.jpg', '/spa/spa-7.jpg',
      array['Clean, polished nails','Grooming refresh','Easy add-on'],
      array['Cleaning with polish'],
      false, true, 16, 'View Details'),
    (v_site_id, 'pedicure', 'Pedicure', 'Additional Services',
      'Cleaning with polish for refreshed feet and nails.',
      'A pedicure service with cleaning and polish for neat, refreshed feet and toenails.',
      45, 'Cleaning with Polish', '/spa/spa-5.jpg', '/spa/spa-5.jpg',
      array['Clean, polished toenails','Foot grooming refresh','Pairs well with foot spa'],
      array['Cleaning with polish'],
      false, true, 17, 'View Details');

  insert into public.cms_gallery (site_id, image_url, caption, category, featured, aspect, is_active, sort_order) values
    (v_site_id, '/spa/spa-1.jpg', 'Kocoon Wellness Spa storefront in Loakan Proper, Baguio City', 'Spa Interior', true, 'landscape', true, 1),
    (v_site_id, '/spa/spa-7.jpg', 'Waiting lounge — Your Haven of Wellness', 'Spa Interior', true, 'portrait', true, 2),
    (v_site_id, '/spa/spa-3.jpg', 'Relaxation lounge with premium massage chairs', 'Spa Interior', true, 'square', true, 3),
    (v_site_id, '/spa/spa-5.jpg', 'Warm, inviting entrance with Kocoon branding', 'Spa Interior', true, 'portrait', true, 4),
    (v_site_id, '/spa/spa-2.jpg', 'Private treatment room prepared for your session', 'Treatment Rooms', true, 'square', true, 5),
    (v_site_id, '/spa/spa-6.jpg', 'Reception counter with a calm evening ambiance', 'Spa Interior', true, 'portrait', true, 6),
    (v_site_id, '/spa/spa-4.jpg', 'Quiet treatment room ready for deep relaxation', 'Treatment Rooms', false, 'portrait', true, 7),
    (v_site_id, '/hero.jpg', 'Signature wellness and relaxation experience', 'Wellness Experience', true, 'landscape', true, 8);

  insert into public.cms_testimonials (site_id, client_name, rating, message, featured, is_published, review_date) values
    (v_site_id, 'Jen R.', 5, 'Such a peaceful experience. The therapists were professional, the space was clean, and I left feeling completely renewed.', true, true, '2026-07-12'),
    (v_site_id, 'Mark D.', 5, 'Perfect escape after a long week in Baguio. The Swedish massage was exactly what I needed. Highly recommend Kocoon.', true, true, '2026-06-28'),
    (v_site_id, 'Patricia L.', 5, 'Warm welcome, attentive staff, and a calm atmosphere. Booking was easy and the service felt thoughtfully personalized.', true, true, '2026-08-03');

  insert into public.cms_faqs (site_id, question, answer, is_active, sort_order) values
    (v_site_id, 'Do I need an appointment?',
      'We recommend booking ahead to secure your preferred time and therapist, especially on weekends. Walk-ins are welcome when schedules allow.', true, 1),
    (v_site_id, 'What treatments do you offer?',
      'We offer Auto Massage Chair sessions, Traditional Massage (Signature, Combination, Thai, Shiatsu, Swedish), Massage Plus and Deluxe options, plus Hand Spa, Foot Spa, Manicure, Pedicure, Ear Candling, and Hot Stone or Ventosa. Browse the Services section for full details.', true, 2),
    (v_site_id, 'How early should I arrive?',
      'Please arrive 10–15 minutes before your appointment so we can welcome you and prepare your session comfortably.', true, 3),
    (v_site_id, 'Can I request a specific therapist?',
      'Yes. Let us know when you book and we will do our best to accommodate your preferred therapist based on availability.', true, 4),
    (v_site_id, 'Where are you located?',
      'We are located at 116 Purok Bubon, Loakan Proper, Baguio City, and also at 1947 J. Gabriel Street, Baclaran, Parañaque City. For Baguio call Globe 0915 123 2418 or Smart 0962 218 8796. For Parañaque call Smart/TNT 0910 489 3903.', true, 5),
    (v_site_id, 'What should I bring?',
      'Just yourself. Wear comfortable clothing. We provide essentials for your treatment. Feel free to bring personal toiletries if preferred.', true, 6);

  insert into public.cms_staff (
    site_id, name, position, specialty, bio, credentials, years_experience, image_url, featured, is_active, sort_order
  ) values
    (v_site_id, 'Maria Santos', 'Senior Wellness Therapist', 'Therapeutic & relaxation massage',
      'Specializing in therapeutic massage and relaxation treatments with a calm, attentive approach.',
      'Licensed Massage Therapist', 9,
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80', true, true, 1),
    (v_site_id, 'Ana Reyes', 'Wellness Therapist', 'Aromatherapy & hot stone',
      'Creates restorative sessions that blend aromatherapy with careful, grounding technique.',
      'Certified Spa Therapist', 6,
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80', true, true, 2),
    (v_site_id, 'Liza Mendoza', 'Senior Therapist', 'Deep tissue & sports recovery',
      'Focused on relieving deep tension while keeping every guest comfortable and informed.',
      'Therapeutic Massage Specialist', 8,
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80', true, true, 3),
    (v_site_id, 'Carla Domingo', 'Wellness Therapist', 'Reflexology & foot therapy',
      'Known for gentle precision and a welcoming presence that helps guests settle quickly.',
      'Reflexology Practitioner', 5,
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80', false, true, 4);

  raise notice 'OK: cms schema ready for slug=% site_id=%', v_slug, v_site_id;
end $$;

-- ---------------------------------------------------------------------------
-- Promote a registered Auth user to Kocoon admin (edit after creating user)
-- ---------------------------------------------------------------------------
-- 1) Authentication → Users → Add user (auto-confirm ON)
-- 2) Run this block with your email:

/*
do $$
declare
  v_email   text := 'YOUR_ADMIN_EMAIL@example.com';  -- <-- change
  v_user_id uuid;
  v_site_id uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower(v_email) limit 1;
  if v_user_id is null then
    raise exception 'No Auth user for %. Create the user first.', v_email;
  end if;

  select id into v_site_id from public.cms_sites where slug = 'kocoon-wellness-spa' limit 1;
  if v_site_id is null then
    raise exception 'Site kocoon-wellness-spa missing. Run this migration first.';
  end if;

  insert into public.cms_site_admins (site_id, user_id, role)
  values (v_site_id, v_user_id, 'admin')
  on conflict (site_id, user_id) do update set role = 'admin';

  raise notice 'OK: % is admin for kocoon-wellness-spa', v_email;
end $$;
*/

-- Verify:
-- select slug, business_name from public.cms_sites where slug = 'kocoon-wellness-spa';
-- select count(*) from public.cms_services s join public.cms_sites t on t.id = s.site_id where t.slug = 'kocoon-wellness-spa';
