# DOMA Admin Dashboard

This is a separate admin dashboard for the existing DOMA website.
It does not replace your current frontend or backend. It connects using `VITE_API_BASE_URL`.

## 1. Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

Open:
```txt
http://localhost:5173
```

## 2. Set backend API URL

Open `.env` and update:

```env
VITE_API_BASE_URL=https://YOUR-EXISTING-BACKEND.onrender.com/api
VITE_SITE_URL=https://domabuild.co.uk
```

## 3. Required existing backend APIs

Your backend should already have or you need to add these routes:

```txt
POST   /api/admin/login
GET    /api/admin/stats
GET    /api/health
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/enquiries
PUT    /api/enquiries/:id
DELETE /api/enquiries/:id
GET    /api/content
PUT    /api/content
```

Expected login response:

```json
{
  "token": "jwt_token_here",
  "admin": { "email": "admin@domabuild.co.uk", "role": "admin" }
}
```

## 4. Deploy on Vercel

1. Push this folder to GitHub.
2. Go to Vercel > Add New Project.
3. Import GitHub repo.
4. Framework: Vite.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. Add Environment Variables:

```env
VITE_API_BASE_URL=https://YOUR-EXISTING-BACKEND.onrender.com/api
VITE_SITE_URL=https://domabuild.co.uk
```

8. Deploy.

## 5. Suggested admin URL

Use either:

```txt
https://doma-admin.vercel.app
```

or connect subdomain:

```txt
https://admin.domabuild.co.uk
```

## 6. Important

If your existing backend route names are different, only edit this file:

```txt
src/services/api.js
```

Change the endpoint paths to match your backend.
