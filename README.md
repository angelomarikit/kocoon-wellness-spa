# Kocoon Wellness Spa

Premium wellness spa website + admin CMS for **Kocoon Wellness Spa** (Loakan Proper, Baguio City + Baclaran, Parañaque).

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion, Lucide React
- React Hook Form + Zod
- React Helmet Async
- Supabase CMS (`cms_*` tables, slug-scoped)
- Vercel-ready SPA routing

## Site isolation

All data is scoped to business slug:

```
kocoon-wellness-spa
```

Tables use the `cms_*` prefix so they do not depend on Apex Pages tables (`public.services`, `public.projects`, etc.) and will not overwrite other apps in the same database.

## Supabase SQL (run once)

1. Open your Supabase project in the dashboard.
2. SQL Editor → New query.
3. Paste and run:

```
supabase/migrations/001_kocoon_wellness_spa.sql
```

What it does (safely):

- Creates isolated `cms_*` tables + RLS
- Seeds **only** slug `kocoon-wellness-spa`
- Does not require Apex `services` / `projects` tables
- Safe to re-run

Full deploy steps (Supabase → GitHub → Vercel + admin promote): see **`DEPLOY.md`**.

## Env

Copy `.env.example` → `.env`:

```
VITE_SUPABASE_URL=<shared-project-url>
VITE_SUPABASE_ANON_KEY=<shared-anon-key>
VITE_SITE_SLUG=kocoon-wellness-spa
VITE_SITE_URL=https://kocoonwellnessspa.vercel.app
```

## Admin CMS

- URL: `/admin`
- Login: `/admin/login`
- Demo auth accepts any email/password until Supabase Auth is wired to a client user for this project

Editable in admin (text + photos/images per section):

| Area | Path |
| ---- | ---- |
| Hero, Welcome, About, Why Choose, Experience, Booking CTA, Footer | `/admin/content` |
| Services (incl. images) | `/admin/services` |
| Gallery photos | `/admin/gallery` |
| Staff | `/admin/staff` |
| Testimonials | `/admin/testimonials` |
| FAQs | `/admin/faq` |
| Contact / phones / Messenger / hours / addresses | `/admin/contact` |
| SEO | `/admin/seo` |
| Brand settings (logo, colors, slug lock) | `/admin/settings` |

Until Supabase env vars are set, CMS saves to `localStorage` (prefixed `kocoon-cms:`). After connecting, keep filtering every write by slug `kocoon-wellness-spa` / its `cms_sites.id`.

## Getting started

```bash
npm install
npm run dev
```

## Important

- Use `cms_*` tables only for this site (safe alongside other apps)
- Do **not** commit `.env` or service-role keys
- Always filter / seed by slug `kocoon-wellness-spa`
- Storage uploads should live under `site-assets/kocoon-wellness-spa/...`
