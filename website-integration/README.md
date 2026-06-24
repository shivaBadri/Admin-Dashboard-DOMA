# DOMA Admin → Live Website Linking Guide

This admin dashboard is ready to control the live `domabuild.co.uk` website, but the public website must read content from Supabase.

## 1. Supabase setup

1. Open Supabase SQL Editor.
2. Run `supabase/schema.sql` from this project.
3. Create a public storage bucket named `doma-media`.
4. Create admin user from Supabase Auth.

## 2. Admin Vercel env variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DOMA_SITE_URL=https://domabuild.co.uk
```

## 3. Live website env variables

Add the same variables in the live DOMA website Vercel project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 4. Install in live website

```bash
npm install @supabase/supabase-js
```

## 5. Copy integration client

Copy `website-integration/domaSupabaseClient.js` into the live website:

```txt
src/lib/domaSupabaseClient.js
```

## 6. Replace hardcoded website sections

Use `getSiteSection('hero')`, `getSiteSection('about')`, `getActiveRows('services')`, `getActiveRows('projects')`, etc.

## 7. Important

Do not put Supabase `service_role` key in frontend or Vercel public env variables. Use only anon key with RLS policies.
