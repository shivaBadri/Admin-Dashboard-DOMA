# DOMA Build Professional Admin Dashboard

Premium black + gold construction CMS dashboard for DOMA Build.

## Deploy

```bash
npm install
npm run build
```

## Render Static Deployment

Use `render.yaml` or create a Static Site manually:
- Build command: `npm install && npm run build`
- Publish directory: `dist`

## Required env

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_DOMA_SITE_URL=https://domabuild.co.uk
VITE_API_BASE_URL=
```

## Live website linking

Run `supabase/schema.sql` in Supabase, create bucket `doma-media`, then update the live DOMA frontend to fetch from Supabase tables.
