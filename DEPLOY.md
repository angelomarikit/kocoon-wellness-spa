# Kocoon Wellness Spa — Deploy Guide

Follow this order: **Supabase → GitHub → Vercel**.

Slug for this site (do not change):

```
kocoon-wellness-spa
```

Use the **same Supabase project** you use for your other sites if you want one shared database.  
This migration creates **isolated `cms_*` tables** (slug `kocoon-wellness-spa`) so it will **not** overwrite or depend on Apex Pages tables like `public.services` / `public.projects`.

> If you previously got `relation "public.services" does not exist`, that old script expected Apex Pages tables. Use the updated file below instead.

---

## 1. Supabase

### 1.1 Open the shared project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Open the same project used by **Landing Page Drag and drop / Apex Pages**
3. Confirm you are **not** in a brand-new empty project

### 1.2 Run the Kocoon SQL

1. Left sidebar → **SQL Editor** → **New query**
2. Open this file from the repo:

   ```
   supabase/migrations/001_kocoon_wellness_spa.sql
   ```

3. Paste the full contents into the editor
4. Click **Run**
5. Check the notice / success message. You should see project slug `kocoon-wellness-spa`

What this does:

- Creates isolated `cms_*` tables (does not require Apex `services` / `projects`)
- Seeds **only** slug `kocoon-wellness-spa`
- Public can read site content; linked admins can edit via RLS
- Safe to re-run

### 1.2b Run the Storage bucket SQL (required for photos)

Staff / gallery / logo uploads need a dedicated bucket so images stay permanent (not broken `blob:` links).

1. SQL Editor → **New query**
2. Paste and run:

   ```
   supabase/migrations/002_kocoon_storage_bucket.sql
   ```

3. Confirm in **Storage** that bucket `kocoon-media` exists

What this does (safe for other projects):

- Creates bucket **`kocoon-media` only** — does not change other buckets
- Files must live under folder **`kocoon-wellness-spa/...`**
- Public read so the website can show images
- Other sites / folders cannot be written by these policies

### 1.3 Copy API keys

1. Left sidebar → **Project Settings** → **API**
2. Copy:
   - **Project URL** → use as `VITE_SUPABASE_URL`
   - **anon public** key → use as `VITE_SUPABASE_ANON_KEY`

Do not commit these keys to Git. Put them in local `.env` and in Vercel Environment Variables only.

### 1.4 Quick verify (optional)

In SQL Editor:

```sql
select id, slug, business_name, is_active
from public.cms_sites
where slug = 'kocoon-wellness-spa';
```

You should get exactly one row.

### 1.5 Make a registered account an Admin (CMS access)

The `/admin` panel is what lets you change website text, photos, services, gallery, contact details, and SEO.  
A normal registered Auth user **cannot** edit this site until you link them in `cms_site_admins`.

#### Step A — Create / register the account

1. Supabase → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter the admin email + password (example: `kocoonwellnessspa@gmail.com`)
4. Turn **Auto Confirm User** **ON** so they can sign in immediately
5. Click **Create user**

#### Step B — Promote that user to Kocoon admin only

1. Supabase → **SQL Editor** → **New query**
2. Replace the email, then **Run**:

```sql
do $$
declare
  v_email   text := 'YOUR_ADMIN_EMAIL@example.com';  -- <-- change this
  v_user_id uuid;
  v_site_id uuid;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No Auth user for %. Create the user first (Authentication → Users).', v_email;
  end if;

  select id into v_site_id
  from public.cms_sites
  where slug = 'kocoon-wellness-spa'
  limit 1;

  if v_site_id is null then
    raise exception 'Site kocoon-wellness-spa not found. Run 001_kocoon_wellness_spa.sql first.';
  end if;

  insert into public.cms_site_admins (site_id, user_id, role)
  values (v_site_id, v_user_id, 'admin')
  on conflict (site_id, user_id) do update
  set role = 'admin';

  raise notice 'OK: % is admin for kocoon-wellness-spa', v_email;
end $$;
```

#### Step C — Confirm it worked

```sql
select
  u.email,
  a.role,
  s.slug,
  s.business_name
from public.cms_site_admins a
join auth.users u on u.id = a.user_id
join public.cms_sites s on s.id = a.site_id
where lower(u.email) = lower('YOUR_ADMIN_EMAIL@example.com')  -- <-- same email
  and s.slug = 'kocoon-wellness-spa';
```

#### What this admin can edit on the website

After login at `/admin/login`, they can change:

| Admin page | What they control on the live site |
| ---------- | ---------------------------------- |
| `/admin/content` | Hero, Welcome, About, Why Choose, Experience, Booking CTA, Footer (text + images) |
| `/admin/services` | Service list, descriptions, images, categories |
| `/admin/gallery` | Gallery photos, captions, layout |
| `/admin/staff` | Team members and photos |
| `/admin/testimonials` | Reviews shown publicly |
| `/admin/faq` | FAQ questions and answers |
| `/admin/contact` | Phones, emails, addresses, hours, Messenger links |
| `/admin/seo` | Title, meta description, Open Graph image |
| `/admin/settings` | Logo, brand colors, business name (slug stays locked) |

#### Notes

- This only grants access to slug `kocoon-wellness-spa` — other apps/tables in the same database are untouched.
- Until Supabase Auth is fully wired in the app login screen, local/demo login may still accept any email/password in the browser.
- To remove admin later:

```sql
delete from public.cms_site_admins
where user_id = (
  select id from auth.users
  where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com')
)
and site_id = (
  select id from public.cms_sites
  where slug = 'kocoon-wellness-spa'
);
```

---

## 2. GitHub

### 2.1 Prepare the repo locally

In the project folder (`Kocoon Wellness Spa`):

```bash
git init
git add .
git commit -m "Initial Kocoon Wellness Spa site and CMS"
```

Make sure `.env` is **not** committed (it should already be in `.gitignore`). Only `.env.example` should be in the repo.

### 2.2 Create the GitHub repository

1. Go to [https://github.com/new](https://github.com/new)
2. Create a new repo, for example: `kocoon-wellness-spa`
3. Keep it **Private** unless you intentionally want it public
4. Do **not** add a README / license if you already have local files

### 2.3 Push

Replace `YOUR_USER` and `YOUR_REPO` with your GitHub values:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

If the remote already exists:

```bash
git remote set-url origin https://github.com/YOUR_USER/YOUR_REPO.git
git push -u origin main
```

---

## 3. Vercel

### 3.1 Import the project

1. Go to [https://vercel.com](https://vercel.com) and sign in (preferably with GitHub)
2. **Add New…** → **Project**
3. Import the GitHub repo you just pushed
4. Framework preset should detect **Vite**
5. Leave build settings as:

   | Setting        | Value         |
   | -------------- | ------------- |
   | Build Command  | `npm run build` |
   | Output Directory | `dist`      |
   | Install Command | `npm install` |

`vercel.json` already rewrites all routes to `index.html` for the SPA (including `/admin`).

### 3.2 Environment variables

Before deploying, open **Environment Variables** and add:

| Name | Value |
| ---- | ----- |
| `VITE_SUPABASE_URL` | Shared Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Shared Supabase anon key |
| `VITE_SITE_SLUG` | `kocoon-wellness-spa` |
| `VITE_SITE_URL` | Your live URL (e.g. `https://kocoonwellnessspa.vercel.app` or custom domain) |

Apply them to **Production** (and Preview if you want preview deploys connected too).

### 3.3 Deploy

1. Click **Deploy**
2. Wait for the build to finish
3. Open the deployment URL

Public site: `/`  
Admin CMS: `/admin` (login at `/admin/login`)

### 3.4 Custom domain (optional)

1. Vercel project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions
3. Update `VITE_SITE_URL` to the final domain
4. Redeploy so SEO / canonical URLs pick up the new value
5. (Optional) In Supabase, ensure a `domains` row points at your hostname for the `kocoon-wellness-spa` project if you use public hostname RPCs

---

## 4. After go-live checklist

- [ ] SQL ran successfully (`cms_sites` has `kocoon-wellness-spa`)
- [ ] Storage bucket `kocoon-media` exists (002 SQL)
- [ ] Admin Auth user created and linked in `cms_site_admins`
- [ ] GitHub repo has latest code (no `.env` secrets)
- [ ] Vercel env vars set correctly (`VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`)
- [ ] Homepage loads on the Vercel URL
- [ ] `/admin` photo upload shows “Saved to Supabase Storage”
- [ ] Phones, Messenger links, and both branch addresses look correct

---

## Local development (optional)

```bash
cp .env.example .env
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Until Supabase env vars are set, the CMS still works via local browser storage (`kocoon-cms:`). After env is connected, keep all data scoped to slug `kocoon-wellness-spa`.

---

## Important rules

- Prefer isolated `cms_*` tables for Kocoon (safe alongside other apps in one Supabase DB)
- Do **not** commit `.env` or service-role keys
- Always filter / seed by slug `kocoon-wellness-spa` only
- Do **not** change another site’s slug or wipe unrelated tables
