# DOMA Admin Secure Website Control v2

Professional dashboard to manage every editable DOMA website field using Supabase Free.

## What is fixed in this version

- No blank pages: every menu route has a working screen.
- No demo CRM text: content is DOMA website CMS focused.
- Website Fields module controls header, hero, about, services intro, projects intro, sectors, news, testimonials, CTA, contact, footer and SEO.
- Soft delete added: deleted records go to Restore Center.
- Restore option added for accidental deletion.
- Supabase Free safe: small media only, no heavy analytics DB.
- Secure auth ready: Supabase Auth, RLS policies, no hardcoded password.
- GitHub/Vercel ready.

## Local Run

```cmd
npm config set registry https://registry.npmjs.org/
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

## Supabase Setup

1. Create Supabase project.
2. Go to SQL Editor.
3. Run `supabase/schema.sql`.
4. Authentication > Users > Add user for admin login.
5. Storage > Create bucket named `doma-media`.
6. Keep service_role key private. Do not put it in Vercel frontend.

## Vercel Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_DOMA_SITE_URL=https://domabuild.co.uk
```

## Deploy to Present GitHub Repo

```cmd
git add .
git commit -m "DOMA admin production website control v2"
git push origin main
```

Then redeploy in Vercel.

## Important

This admin will manage the database immediately. The live DOMA website will reflect changes only after the website frontend is connected to Supabase using `website-integration/README.md`.
