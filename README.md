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

The app works with built-in seed content when Supabase variables are not configured. Add Supabase variables to enable live database, admin auth, uploads, copy counters, and storage.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and fill:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run the migration in `supabase/migrations/20260522190000_create_prompt_gallery.sql` with the Supabase SQL editor or Supabase CLI.
4. Create an auth user in Supabase.
5. Promote that user to admin:

```sql
update public.profiles
set role = 'admin'
where email = 'your-email@example.com';
```

6. Visit `/admin`, sign in, and add prompts with image uploads.

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

- Images are local WebP assets for the starter gallery and Supabase Storage URLs for admin-created prompts.
- The service worker caches the shell and gallery images for offline browsing.
- Admin writes are allowed only for users with `profiles.role = 'admin'`.
- The frontend keeps a local fallback store so mobile interactions stay instant while Supabase syncs in the background.
