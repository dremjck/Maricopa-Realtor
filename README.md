# Maricopa Lead Dashboard

A private real estate lead dashboard for internal use. Displays leads from county records and supports lightweight CRM actions.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (auth + database)
- Vercel-ready

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Create a `.env.local` file in the **project root** (same level as `package.json`):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Where to get credentials:** Supabase Dashboard → your project → **Settings** → **API**. Use the Project URL and the Publishable (anon) key.

**Important:** Restart the dev server after creating or editing `.env.local`. Next.js loads environment variables only at startup.

### 3. Database migration

If your `leads` table was created by the scraper without CRM columns, run the migration:

```bash
# Using Supabase CLI (if linked)
supabase db push

# Or run the SQL manually in Supabase SQL Editor
# Copy contents of: supabase/migrations/20240311000000_add_crm_columns_to_leads.sql
```

### 4. Create users manually

This app has **no public signup**. Create users in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password
4. Save

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login` if not authenticated.

## Deploy to Vercel

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Connect to Supabase Auth manually

Users are created only via the Supabase Dashboard:

- **Authentication** → **Users** → **Add user**
- Choose "Create new user"
- Set email and password
- No email confirmation needed if you disable it in Auth settings

## Project structure

```
src/
├── app/
│   ├── dashboard/       # Leads table
│   ├── leads/[id]/      # Lead detail page
│   ├── login/           # Login page
│   └── layout.tsx
├── components/
│   ├── ui/              # shadcn-style components
│   ├── dashboard-header.tsx
│   └── leads-table.tsx
├── lib/
│   ├── supabase/        # Client, server, middleware
│   ├── links.ts         # Zillow, Redfin, Google Maps helpers
│   └── utils.ts
└── types/
    └── lead.ts
```
