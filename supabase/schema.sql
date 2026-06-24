-- DOMA Admin v2: Supabase Free Production Schema
-- Run this in Supabase SQL Editor before deployment.
create extension if not exists pgcrypto;

create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text not null,
  fields jsonb not null default '{}',
  sort_order int default 0,
  is_published boolean default true,
  deleted_at timestamptz,
  updated_at timestamptz default now(),
  created_at timestamptz default now()
);
create table if not exists public.services (id uuid primary key default gen_random_uuid(), title text not null, description text, icon text, sort_order int default 0, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.projects (id uuid primary key default gen_random_uuid(), title text not null, category text, location text, status text default 'Completed', description text, image_url text, is_featured boolean default false, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.sectors (id uuid primary key default gen_random_uuid(), title text not null, description text, sort_order int default 0, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.news (id uuid primary key default gen_random_uuid(), title text not null, slug text, excerpt text, content text, image_url text, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.team (id uuid primary key default gen_random_uuid(), name text not null, role text, bio text, photo_url text, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.testimonials (id uuid primary key default gen_random_uuid(), client_name text not null, client_role text, quote text, rating int default 5, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.media_assets (id uuid primary key default gen_random_uuid(), title text, file_url text not null, file_type text, alt_text text, size_bytes bigint, is_active boolean default true, deleted_at timestamptz, updated_at timestamptz default now(), created_at timestamptz default now());
create table if not exists public.enquiries (id uuid primary key default gen_random_uuid(), name text, email text, phone text, service text, message text, status text default 'New', follow_up_date date, notes text, deleted_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists public.audit_logs (id uuid primary key default gen_random_uuid(), user_id uuid, action text not null, table_name text, record_id uuid, created_at timestamptz default now());

alter table public.site_sections enable row level security; alter table public.services enable row level security; alter table public.projects enable row level security; alter table public.sectors enable row level security; alter table public.news enable row level security; alter table public.team enable row level security; alter table public.testimonials enable row level security; alter table public.media_assets enable row level security; alter table public.enquiries enable row level security; alter table public.audit_logs enable row level security;

-- Public read policies for website. Deleted rows never show on website.
drop policy if exists "public read published site sections" on public.site_sections; create policy "public read published site sections" on public.site_sections for select using (is_published = true and deleted_at is null);
drop policy if exists "public read active services" on public.services; create policy "public read active services" on public.services for select using (is_active = true and deleted_at is null);
drop policy if exists "public read active projects" on public.projects; create policy "public read active projects" on public.projects for select using (is_active = true and deleted_at is null);
drop policy if exists "public read active sectors" on public.sectors; create policy "public read active sectors" on public.sectors for select using (is_active = true and deleted_at is null);
drop policy if exists "public read active news" on public.news; create policy "public read active news" on public.news for select using (is_active = true and deleted_at is null);
drop policy if exists "public read active team" on public.team; create policy "public read active team" on public.team for select using (is_active = true and deleted_at is null);
drop policy if exists "public read active testimonials" on public.testimonials; create policy "public read active testimonials" on public.testimonials for select using (is_active = true and deleted_at is null);
drop policy if exists "public read active media" on public.media_assets; create policy "public read active media" on public.media_assets for select using (is_active = true and deleted_at is null);

-- Authenticated admins manage all rows including restore center.
drop policy if exists "admin manage site sections" on public.site_sections; create policy "admin manage site sections" on public.site_sections for all to authenticated using (true) with check (true);
drop policy if exists "admin manage services" on public.services; create policy "admin manage services" on public.services for all to authenticated using (true) with check (true);
drop policy if exists "admin manage projects" on public.projects; create policy "admin manage projects" on public.projects for all to authenticated using (true) with check (true);
drop policy if exists "admin manage sectors" on public.sectors; create policy "admin manage sectors" on public.sectors for all to authenticated using (true) with check (true);
drop policy if exists "admin manage news" on public.news; create policy "admin manage news" on public.news for all to authenticated using (true) with check (true);
drop policy if exists "admin manage team" on public.team; create policy "admin manage team" on public.team for all to authenticated using (true) with check (true);
drop policy if exists "admin manage testimonials" on public.testimonials; create policy "admin manage testimonials" on public.testimonials for all to authenticated using (true) with check (true);
drop policy if exists "admin manage media" on public.media_assets; create policy "admin manage media" on public.media_assets for all to authenticated using (true) with check (true);
drop policy if exists "admin manage enquiries" on public.enquiries; create policy "admin manage enquiries" on public.enquiries for all to authenticated using (true) with check (true);
drop policy if exists "admin audit read" on public.audit_logs; create policy "admin audit read" on public.audit_logs for select to authenticated using (true);
drop policy if exists "admin audit insert" on public.audit_logs; create policy "admin audit insert" on public.audit_logs for insert to authenticated with check (true);

create index if not exists idx_site_sections_key on public.site_sections(section_key);
create index if not exists idx_projects_active on public.projects(is_active, deleted_at, updated_at desc);
create index if not exists idx_services_active on public.services(is_active, deleted_at, sort_order);
create index if not exists idx_enquiries_status on public.enquiries(status, created_at desc);

-- Storage bucket: create manually in Supabase Dashboard as public bucket named doma-media.
