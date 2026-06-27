# Saathi — Frequently Asked Questions

Complete Q&A for judges, developers, and users.

---

## Product and purpose

### What is Saathi?

Saathi ("exam prep ka saathi") is an empathetic AI companion for Indian students preparing for high-stakes exams — NEET, JEE, CUET, CAT, GATE, UPSC, and board exams. It combines open-ended journaling, conversational AI support, weekly pattern discovery, and micro-interventions to help students monitor and improve their mental well-being during exam preparation.

### How is Saathi different from Project AETHER?

Project AETHER was the original research-backed product vision (see [DeepSeek-AETHER AI Companion.md](../DeepSeek-AETHER%20AI%20Companion.md)). Saathi is the shipped MVP implementation of that vision, branded for the PromptWars Kolkata hackathon. AETHER described the full roadmap; Saathi implements the core Phase 1 features.

### Who is Saathi for?

Indian exam aspirants aged 15–25 who face exam stress, burnout, parental pressure, coaching isolation, and self-doubt. The demo persona Aanya Sharma is a NEET 2026 aspirant living in a Kota coaching hostel.

### What exams does Saathi support?

NEET, JEE, CUET, CAT, GATE, UPSC, BOARDS, and OTHER — selectable during onboarding. AI prompts and Calm Kit exercises are tailored to competitive exam culture.

### Is Saathi a therapist or medical tool?

**No.** Saathi is an AI companion, not a therapist, doctor, or diagnostic tool. It does not diagnose conditions, prescribe treatment, or replace professional mental health care. It provides supportive self-reflection, empathetic conversation, and crisis resource referrals.

### Why build another mental health app?

Most existing apps use clinical language, generic advice, and reductive mood scales. Saathi is designed specifically for Indian exam culture — Hinglish support, Kota coaching references, parental rank pressure — with GenAI that analyzes natural language journals to find patterns standard trackers miss.

---

## Demo and testing

### What are the demo login credentials?

```
Email:    aanya@saathi.demo
Password: SaathiDemo2026!
```

### Who is Aanya Sharma?

Aanya is a fictional demo persona — a 17-year-old NEET 2026 aspirant from Jaipur, living alone in a Kota coaching hostel. Her account is pre-seeded with ~3 months of journals, mood check-ins, weekly Pattern Reports, chat history, and Calm Kit completions that tell a realistic story of exam stress, physics anxiety, Sunday parent-call patterns, and exam-day terror.

### What is Aanya's story arc?

- **Day 1 (Mar 28):** Skeptical first journal — doesn't believe any app can help. Physics mock failure. Maa asks about rank.
- **Week 2:** Saathi surfaces physics in ~70% of high-stress entries; parental rank questions follow mock tests.
- **Week 4:** Sunday evening mood dips linked to weekly parent calls; "failure" word frequency spikes.
- **Exam day (Jun 27):** Terrified before NEET — sleepless night, shaking hands.

Full narrative: [`supabase/seed/aanya-narrative.json`](../supabase/seed/aanya-narrative.json)

### What should judges try first?

See the full **[Judge Demo Script](judge-demo-script.md)** (~12 min, AI-focused). Quick path:

1. Login at `/login` with demo credentials (or **Explore as Aanya Sharma**)
2. Read journals on `/home` — note Hinglish content and AI reflections; try **mic dictation**
3. Open Pattern Report at `/insights` — Week 4 shows physics + Sunday patterns
4. Chat at `/companion` — AI knows her exam, trust level, and themes; try **speaker read-aloud**
5. Try Calm Kit at `/calm-kit` — "Box Breathing" or "Pre-Mock Calm"
6. Check crisis safety — Quick Exit button, real-time pre-check, Tele-MANAS 14416
7. View voice settings, stats, and export at `/profile`

**Pre-flight:** `npm run verify:ai` confirms all three Groq AI surfaces are working.

### How do I seed demo data locally?

```bash
npm run seed:aanya
```

Requires `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`. The script is idempotent — safe to re-run.

---

## Features and usage

### How does journaling work?

Write freely on the home screen or journal page. On submit, the text is sent to `POST /api/journal/analyze`. Groq analyzes it and returns a warm reflection, themes, a micro-step (2–5 min action), an invitation question, and a recommended Calm Kit exercise. The entry and optional mood check-in are saved to Supabase.

### Does AI respond immediately to journal entries?

Yes. After submitting a journal entry, you see the AI reflection within a few seconds. Crisis content receives an immediate fixed template with helpline numbers instead of LLM analysis.

### What are Pattern Reports?

Weekly AI-generated summaries of emotional patterns across your journal entries and mood data. They highlight recurring stress triggers (e.g., "physics appears in 70% of high-stress entries"), day-of-week patterns (e.g., "Sunday mood dips"), and word frequency shifts — framed as gentle observations, not diagnoses.

### When are Pattern Reports generated?

One report per calendar week, cached in the database. Generated on first visit to `/insights` each week. Can be force-regenerated via `GET /api/insights/weekly?force=true`.

### How does Saathi Chat remember context?

Each chat session loads your profile (name, exam, language, trust level, days to exam), your last 7 mood check-ins, themes and snippets from your last 3 journal entries, and your latest AI reflection. This context is injected into the system prompt. Messages within a session are persisted to the database. Chat uses **`llama-3.3-70b-versatile`** with key rotation via `stream-pool.ts`.

### What is Calm Kit?

A library of 10 micro-interventions (2–7 minutes each) covering anxiety, overwhelm, sleep, motivation, anger, and focus. Examples: Box Breathing, 5-4-3-2-1 Grounding, Pre-Mock Calm, Parent Boundary Script, Sleep Wind-Down.

### How are Calm Kit exercises recommended?

Two mechanisms:
1. **After journaling** — the AI may suggest a specific exercise ID based on journal themes
2. **Rule-based scoring** — `recommendExercise()` matches journal themes and mood tags against exercise tags

Over time, `coping_preferences` tracks which exercises you find helpful.

### What languages are supported?

The AI responds in English, Hindi, or Hinglish based on your `language_pref` setting (chosen during onboarding). The UI labels are mostly English; AI-generated content (reflections, chat, insights) adapts to your language preference.

### What is trust level?

A 1–5 scale on your profile that adjusts how the AI companion communicates:
- **1–2:** Extra gentle; listens more, advises less
- **3–4:** Balances listening with gentle suggestions
- **5:** May gently challenge negative self-talk when appropriate

Demo user Aanya has trust level 4.

### What are mood check-ins?

A quick emoji mood strip on the home screen. Select your mood (happy, calm, anxious, angry, sad, tired, overwhelmed) and optional tags like "Mock test", "Physics", "Family". Saved alongside journal entries for pattern analysis.

### Can I use voice instead of typing?

Yes. Saathi supports **browser-based voice input** on the chat and journal screens (mic button). Tap to dictate in English, Hindi, or Hinglish — works best in Chrome or Edge. You can also **listen to AI responses** via speaker buttons or enable read-aloud in Profile → Voice assistance.

Voice uses the Web Speech API (no extra Groq cost). Groq Whisper for improved Hinglish accuracy is planned.

### What accessibility features exist?

- Skip-to-main links on login and app shell
- Screen reader labels on chat input, messages, and dynamic AI content
- ARIA on collapsible journal/insight cards, mood toggles, and crisis modal
- Focus trap in crisis sheet; keyboard navigation throughout
- Voice dictation and text-to-speech for users who struggle to type or read
- Tested with jest-axe on core components

### What are gentle nudges?

When enabled in Profile, Saathi shows a **rule-based** home card if you haven't journaled in 3+ days or have had several low/anxious moods recently. It suggests journaling, chat, or Calm Kit — no LLM-generated push spam (push notifications not yet implemented).

### Can I export my journal data?

Yes. Go to `/profile` and use the export feature to download your journal entries as JSON.

---

## Safety and privacy

### What happens if I write about self-harm or suicide?

Saathi runs rule-based keyword detection (English and Hindi) **before** sending content to the AI. While typing, a **debounced pre-check** also calls `/api/crisis/check` and can open the crisis sheet early. If crisis keywords are matched on submit:

1. The LLM is bypassed entirely
2. You receive a fixed empathetic response with helpline numbers
3. A minimal crisis event is logged (severity + source only — no journal content)

Helplines provided: Tele-MANAS **14416**, iCall **9152987821**, Vandrevala **9999666555**, Emergency **112**.

### What is Quick Exit?

A button in the top-right of every screen that instantly redirects you to Google. Designed for users who need to leave the app quickly if someone is watching their screen.

### Where is my data stored?

In Supabase (PostgreSQL cloud database) with Row Level Security — you can only access your own data. Data is not stored locally on your device.

### Does Saathi sell my data?

No. We never sell user data. This is stated on the login page and in our privacy approach.

### What crisis helplines are provided?

| Helpline | Number | Availability |
|----------|--------|-------------|
| Tele-MANAS | 14416 | 24/7, free |
| iCall (TISS) | 9152987821 | Counselling |
| Vandrevala Foundation | 9999666555 | 24/7 |
| Emergency | 112 | National emergency |

These are accessible via the Crisis Sheet (always within 2 taps) and in crisis response templates.

### Is crisis detection reliable?

Crisis detection uses keyword matching, not AI judgment. It catches explicit terms in English and Hindi but cannot detect all forms of distress. Saathi is a complement to — not a replacement for — professional crisis intervention. If you are in immediate danger, call **112** or **14416**.

### Who can see my journal entries?

Only you. Row Level Security ensures each user accesses only their own data. Crisis events log severity and source but not journal content.

---

## Technical

### Why Groq?

Groq provides fast, low-latency LLM inference suitable for real-time chat streaming and rapid journal analysis. Free tier API keys work well for hackathon/demo scale.

### Why two different AI models?

| Model | Used for | Why |
|-------|----------|-----|
| `llama-3.3-70b-versatile` | Chat companion | Higher quality conversational empathy |
| `llama-3.1-8b-instant` | Journal + insights | Faster structured JSON output |

### Why Supabase instead of local storage?

The AETHER plan advocated local-first storage (inspired by JournAI). For the MVP, Supabase was chosen for simpler auth, demo seeding, cross-device access, and RLS-based security. Local-first remains a planned improvement.

### How does API key rotation work?

Multiple Groq keys (`GROQ_API_KEY_1`, `_2`, etc.) are loaded into round-robin pools. Journal and insights use `pool.ts`; chat streaming uses `stream-pool.ts`. On 429 rate limits, the failing key enters a 60-second cooldown and the next key is tried with exponential backoff. Up to 6 attempts before failure.

### How do I verify Groq AI is working?

```bash
npm run verify:ai
```

This runs `scripts/verify-groq.ts`, which pings all three AI surfaces (chat, journal, insights). In development you can also call `GET /api/health/ai`. Set `AI_HEALTH_CHECK_ENABLED=true` to enable the endpoint in production. GitHub Actions can run an optional `ai-smoke` job when `GROQ_API_KEY_1` is configured as a secret.

### What environment variables are required?

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `GROQ_API_KEY_1` (or `_2`, `_3`, etc.) | Yes | At least one Groq key |
| `NEXT_PUBLIC_APP_URL` | Yes | Auth callback URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Seed only | Demo account seeding |

See [`.env.example`](../.env.example) for the full list.

### How do I run locally?

```bash
npm install
cp .env.example .env.local
# Fill in Supabase and Groq keys
# Run migration SQL in Supabase dashboard
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### How do I run tests?

```bash
npm test              # Unit & component tests
npm run test:coverage # With coverage thresholds
npm run typecheck     # TypeScript
npm run lint          # ESLint
npm run verify:ai     # Groq AI health check
npm run test:e2e      # Playwright smoke tests
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, and tests on every push.

### How do I deploy to Vercel?

1. Connect repo to Vercel
2. Add all env vars from `.env.example`
3. Set `NEXT_PUBLIC_APP_URL` to production domain
4. Add production URL to Supabase auth callback allowlist
5. Optionally seed demo: `npm run seed:aanya`

### What is the database schema?

9 tables with RLS: `profiles`, `mood_checkins`, `journal_entries`, `chat_sessions`, `chat_messages`, `weekly_insights`, `exercise_completions`, `coping_preferences`, `crisis_events`. Full schema: [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql).

Details in [architecture.md](architecture.md).

---

## Research and ethics

### What research informed Saathi's design?

Key sources include:
- **ROOM app** (Erasmus University) — student-voice UX, low-threshold onboarding
- **WTMF** — emotionally available AI, Hinglish, no toxic positivity
- **Wayhaven study** — GenAI chatbot reduces depression/anxiety in college students
- **PubMed studies** — exam aspirant mental health crisis, CBT app efficacy
- **JournAI** — AI journal analysis for well-being trends

Full bibliography: [research-and-decisions.md](research-and-decisions.md)

### Why use GenAI — isn't it forced?

GenAI solves three problems traditional apps cannot:
1. **Hidden signals** — mood scales miss nuance; LLMs detect stress in natural language
2. **Personalized advice** — generic breathing exercises don't fit every trigger; AI tailors to context
3. **Scale with humanity** — millions of students need support; there aren't enough therapists

GenAI is used only where it adds genuine value: journal analysis, conversational support, and pattern discovery.

### How do you measure success?

From the AETHER plan:
- **Retention:** >40% at 30 days
- **Journaling consistency:** >3x/week average
- **Symptom reduction:** pre/post stress assessment
- **Crisis intervention:** 100% of detected crises receive resources
- **Qualitative:** user testimonials, NPS, feedback on experience

### What ethical guardrails exist?

- Never diagnose or use clinical labels
- Never apply toxic positivity
- Never pressure or guilt-trip users
- Always transparent that AI is not human
- Crisis content bypasses LLM with fixed safe responses
- Minimal crisis logging (no journal content stored)
- Clear disclaimer: not a replacement for therapy

---

## Planned features

### What features are planned but not yet built?

| Feature | Status |
|---------|--------|
| Push notification nudges | Toggle + rule-based home CTA; no push delivery |
| Anonymous community spaces | Not in MVP |
| Groq Whisper STT | Planned; browser Web Speech API used now |
| RAG / long-term journal memory in chat | Planned |
| LLM-based crisis classifier | Planned; keyword detection used now |
| Local-first / offline storage | Planned; cloud Supabase used now |
| Full multilingual UI | AI language only; UI mostly English |
| Institutional mental health partnerships | Planned Phase 3 |
| Multilingual support (Tamil, Telugu, etc.) | Planned Phase 3 |

**Recently implemented:** voice input + read-aloud, accessibility hardening, AI health verification, chat key pool rotation, crisis pre-check, shared insights generation, Vitest/Playwright/CI.

See [architecture.md](architecture.md) for the full implemented vs planned table.

### Will Saathi replace therapy?

No. Saathi is explicitly designed as a first step — a safe, always-available companion that may help students recognize patterns and build coping habits. For clinical care, students should seek qualified professionals. As ROOM's creators say: "It's not a replacement for therapy. But for many, it's the first step."

---

## Getting help

### I'm a student in crisis right now

Please call **Tele-MANAS at 14416** (24/7, free) or **Emergency at 112**. Saathi can provide support but is not equipped for active crisis intervention.

### I found a bug or have feedback

Open an issue in the repository or contact the team directly.

### Where can I learn more?

- [Root README](../README.md) — setup and demo
- [Judge Demo Script](judge-demo-script.md) — live AI demo for judges
- [Architecture](architecture.md) — technical details
- [Research & Decisions](research-and-decisions.md) — why each feature exists
- [AETHER plan](../DeepSeek-AETHER%20AI%20Companion.md) — original product vision
