# Saathi — Empathetic AI Companion for Student Mental Well-Being

**Exam prep ka saathi** for NEET, JEE, CUET, CAT, GATE, UPSC, and board exam aspirants.

**Try it instantly — no signup required:**

| | |
|---|---|
| **Email** | `aanya@saathi.demo` |
| **Password** | `SaathiDemo2026!` |

Open `/login` and click **Explore as Aanya Sharma**, or sign in with the credentials above. The demo account includes ~3 months of journals, mood logs, Pattern Reports, and chat history.

Saathi is a generative AI-powered mental wellness companion built for students facing high-stakes exam pressure. It combines open-ended journaling, conversational support, pattern discovery, and micro-interventions — designed to feel like a friend who listens, not a clinical app that diagnoses.

> Product concept originated as **Project AETHER**. See [DeepSeek-AETHER AI Companion.md](DeepSeek-AETHER%20AI%20Companion.md) for the full research-backed product vision.

---

## Try it now — Demo for judges

Use this pre-seeded account to explore the app immediately. No setup required on a deployed instance.

```
Email:    aanya@saathi.demo
Password: SaathiDemo2026!
```

### Meet Aanya Sharma

Aanya is our demo persona — a 17-year-old NEET 2026 aspirant from Jaipur, living alone in a Kota coaching hostel. Her story mirrors what millions of Indian students experience:

- **12+ hour study days**, weekly mock tests, parental rank comparisons, isolation from family, guilt about taking breaks
- **Day 1 (Mar 28):** Skeptical first journal — *"mujhe nahi lagta koi app help karegi"*. Physics mock failure. Maa asked about rank on the phone.
- **Week 2:** Saathi surfaces that physics appears in ~70% of her high-stress entries; parental rank questions follow mock tests.
- **Week 4:** Sunday evening mood dips linked to weekly parent calls; the word "failure" spikes in her journals.
- **Exam day (Jun 27):** Terrified before NEET — sleepless night, shaking hands, *"what if I blank out?"*

The account includes **~3 months of journals, mood check-ins, weekly Pattern Reports, chat history, and Calm Kit completions** — no empty-state demo.

### What to explore

1. **Login** at `/login` — onboarding is already complete; you land on `/home`
2. **Home / Journal** — read Aanya's recent entries; note Hinglish content and empathetic AI reflections
3. **Insights** (`/insights`) — open the Week 4 Pattern Report; see physics + Sunday call patterns with evidence quotes
4. **Saathi Chat** (`/companion`) — continue a conversation; AI knows her exam, trust level (4), and recent themes
5. **Calm Kit** (`/calm-kit`) — browse 2–7 min micro-interventions; try "Pre-Mock Calm" or "Box Breathing"
6. **Crisis safety** — note the Quick Exit button (top-right) and Tele-MANAS 14416 in the crisis sheet
7. **Profile** (`/profile`) — view stats and export journal data

Full narrative source: [`supabase/seed/aanya-narrative.json`](supabase/seed/aanya-narrative.json)

**Local/dev only:** If the demo account is missing, run `npm run seed:aanya` (requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`). The seed script is idempotent.

---

## The problem

Indian exam aspirants face relentless pressure. In 2025, only ~30% of JEE (Advanced) candidates qualified; over 22 lakh students appeared for NEET UG. Behind these numbers, students grapple with burnout, self-doubt, and isolation — yet stigma, limited time, and preference for self-help impede professional support.

Saathi meets students where they are: non-clinical, culturally fluent, available 24/7.

Design decisions are grounded in research — see [docs/research-and-decisions.md](docs/research-and-decisions.md).

---

## Features

| Feature | Description |
|---------|-------------|
| **Journal + AI reflection** | Open-ended journaling with empathetic Groq-powered insights, themes, and micro-steps |
| **Mood check-ins** | Quick emoji mood strip with contextual tags (Mock test, Physics, Family, etc.) |
| **Saathi Chat** | 24/7 streaming companion in English, Hindi, or Hinglish |
| **Pattern Reports** | Weekly AI synthesis of emotional patterns with evidence from the student's own words |
| **Calm Kit** | 10 micro-interventions (2–7 min), adaptively recommended from journal themes |
| **Crisis safety** | Rule-based crisis detection, Tele-MANAS 14416, Quick Exit, trauma-informed UX |

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Backend / Auth | Supabase (PostgreSQL, RLS, SSR cookie sessions) |
| AI | Groq — `llama-3.3-70b-versatile` (chat), `llama-3.1-8b-instant` (journal + insights) |
| Deploy | Vercel |
| Validation | Zod |

---

## Quick start

### 1. Clone and install

```bash
npm install
cp .env.example .env.local
```

### 2. Supabase

- Create a project at [supabase.com](https://supabase.com)
- Run migration: [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) in SQL Editor
- **Authentication → Providers → Email** — enable Email provider
- For instant signup (no confirmation email): disable **Confirm email** under Email settings
- **Authentication → URL Configuration** — Site URL: `http://localhost:3000`

### 3. Groq

- Get API keys from [console.groq.com](https://console.groq.com)
- Add `GROQ_API_KEY_1`, `GROQ_API_KEY_2`, etc. to `.env.local`

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy to Vercel

- Connect repo, add env vars from [`.env.example`](.env.example)
- Set `NEXT_PUBLIC_APP_URL` to your production URL
- Add production callback URL in Supabase auth settings

---

## Project structure

```
src/app/
  home/           — journal-first home screen
  companion/      — Saathi chat
  journal/        — journal timeline
  calm-kit/       — micro-interventions
  insights/       — weekly Pattern Reports
  profile/        — stats, export, settings
  api/            — Groq-powered API routes
src/components/saathi/  — app UI (AppShell, JournalEditor, CrisisSheet, etc.)
src/lib/
  ai/prompts/     — companion, journal, insights system prompts
  safety/         — crisis keyword detection + resources
  groq/           — API key pool with rate-limit rotation
  data/           — Calm Kit exercises
supabase/
  migrations/     — database schema + RLS
  seed/           — Aanya demo narrative + seed script
docs/             — architecture, research, FAQ
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/README.md](docs/README.md) | Documentation index |
| [docs/architecture.md](docs/architecture.md) | System architecture, data model, API pipelines |
| [docs/research-and-decisions.md](docs/research-and-decisions.md) | Research citations mapped to feature decisions |
| [docs/faq.md](docs/faq.md) | Complete Q&A |
| [DeepSeek-AETHER AI Companion.md](DeepSeek-AETHER%20AI%20Companion.md) | Original product vision and research |

---

## Ethics

Saathi is an **AI companion, not a therapist**. It does not diagnose, prescribe, or replace professional mental health care.

- Crisis resources (Tele-MANAS **14416**, iCall **9152987821**) are available within 2 taps
- Quick Exit redirects to Google for users who need to leave quickly
- We never sell your data
- The AI is always transparent that it is not human

If you or someone you know is in crisis, please call **Tele-MANAS at 14416** (24/7, free).
