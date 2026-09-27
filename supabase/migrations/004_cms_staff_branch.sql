-- Add branch column for team tabs (Baguio / Manila)
-- Safe to re-run.

alter table public.cms_staff
  add column if not exists branch text not null default 'Baguio';

update public.cms_staff
set branch = 'Baguio'
where branch is null or branch = '' or branch not in ('Baguio', 'Manila');

create index if not exists idx_cms_staff_site_branch
  on public.cms_staff (site_id, branch, sort_order);
