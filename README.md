# AI Prompt Gallery

Premium mobile-first AI prompt gallery built with Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, and Supabase.

The public application UI is fully Russian: navigation, buttons, labels, empty states, admin screens, and notifications.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Framer Motion
- Supabase database, auth, and storage
- PWA manifest and service worker

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

The gallery starts empty by design. Add prompts and images through `/admin`; public cards are loaded from Supabase.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run all migrations in `supabase/migrations` with the Supabase SQL editor or Supabase CLI.
4. Visit `/admin`, create or sign in to the owner account, and add prompts with image uploads.
5. The first authenticated account can claim admin access automatically. Later users must already have admin rights.

## Vercel Deployment

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add the two Supabase environment variables in Vercel Project Settings.
4. Deploy.

No server secrets are required for the public app because all database access is protected by Supabase RLS policies.

## GitHub Push Flow

```bash
git init
git add .
git commit -m "Create AI prompt gallery"
git branch -M main
git remote add origin https://github.com/YOUR_NAME/YOUR_REPO.git
git push -u origin main
```

## Production Notes

- Prompt images are stored in Supabase Storage.
- The service worker caches the app shell for offline recovery.
- Admin writes are allowed only for users with `profiles.role = 'admin'`.
- The frontend starts clean and shows only owner-created prompts from Supabase.
