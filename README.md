# Saathi — Empathetic AI Companion for Student Mental Well-Being

Exam prep ka saathi for NEET, JEE, CUET, CAT, GATE, and UPSC aspirants.

## Features

- **Journal + AI reflection** — open-ended journaling with empathetic Groq-powered insights
- **Saathi Chat** — 24/7 bilingual companion (EN / Hindi / Hinglish)
- **Pattern Reports** — weekly AI synthesis of emotional patterns
- **Calm Kit** — 10 micro-interventions (2–7 min), adaptively recommended
- **Crisis safety** — Tele-MANAS 14416, Quick Exit, trauma-informed UX

## Stack

- Next.js 16 · Vercel · Supabase · Groq (multi-key rotation) · Tailwind CSS

## Setup

1. **Clone and install**
   ```bash
   npm install
   cp .env.example .env.local
   ```

2. **Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run migration: `supabase/migrations/001_initial_schema.sql` in SQL Editor
   - **Authentication → Providers → Email** — enable Email provider
   - For instant signup (no confirmation email): disable **Confirm email** under Email settings
   - **Authentication → URL Configuration** — Site URL: `http://localhost:3000`

3. **Groq**
   - Get API keys from [console.groq.com](https://console.groq.com)
   - Add `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, etc. to `.env.local`

4. **Run**
   ```bash
   npm run dev
   ```

5. **Deploy to Vercel**
   - Connect repo, add env vars from `.env.example`
   - Set `NEXT_PUBLIC_APP_URL` to your production URL
   - Add production callback URL in Supabase auth settings

## Demo persona: Aanya Sharma

NEET 2026 aspirant from Kota — use onboarding flow and sample journal entries for demos.

Optional demo seed (after creating a user): run `supabase/seed/demo_aanya.sql` with the user's UUID.

## Project structure

```
src/app/home          — journal-first home
src/app/companion     — Saathi chat
src/app/calm-kit      — micro-interventions
src/app/insights      — weekly pattern reports
src/app/api/*         — Groq-powered API routes
supabase/migrations   — database schema + RLS
```

## Ethics

Saathi is an AI companion, **not** a therapist. Crisis resources are always available within 2 taps.
