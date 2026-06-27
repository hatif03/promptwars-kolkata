# Research and Design Decisions

How real-world research informed Saathi's features — and where each decision landed in the codebase.

Each decision record follows: **Problem → Research evidence → Design decision → Implementation**.

---

## Research bibliography

| ID | Source | Key finding |
|----|--------|-------------|
| **R1** | [The Week — The pressure cooker effect](https://www.theweek.in/news/health/2025/09/10/the-pressure-cooker-effect-student-mental-health-under-siege-in-india-s-education-system.html) | JEE Advanced ~30% qualification rate; 22+ lakh NEET candidates; relentless workloads and parental/peer expectations |
| **R2** | [PubMed 40656372 — Suicide among IIT JEE and NEET aspirants](https://pubmed.ncbi.nlm.nih.gov/40656372/) | 81% of documented suicides among aspirants aged 15–20; 73.4% preparing for NEET |
| **R3** | [ScienceDirect — Wayhaven GenAI chatbot study](https://www.sciencedirect.com/org/science/article/pii/S2561326X25005013) | GenAI chatbot use associated with significant decreases in depression, anxiety, and hopelessness; help-seeking barriers include stigma and limited time |
| **R4** | [EUR.nl — ROOM wellbeing app for students](https://www.eur.nl/en/news/phd-candidate-tajda-laure-co-created-room-wellbeing-app-students) | Co-designed with students over 4 years; student-voice UX; 3,500+ downloads; measurable reduction in negative emotions; designed to "grow with them" |
| **R5** | [Tribune India — WTMF AI companion for Gen Z](https://www.tribuneindia.com/news/business/wtmf-set-to-launch-emotionally-available-ai-companion-for-gen-z-beta-expected-late-august-to-early-september) | Emotionally available AI; Hinglish fluency; no toxic positivity — "presence, listening, and an invitation to feel without being fixed" |
| **R6** | [JournAI — AI journal analysis project](https://projects.human-ist.ch/bachelor/2025_bog) | AI analyzes journal entries for well-being trends; offline-first guarantees privacy |
| **R7** | [PubMed 40604528 — CBT-based stress management apps](https://pubmed.ncbi.nlm.nih.gov/40604528/) | CBT-based apps significantly reduce perceived stress compared to psychoeducation alone |
| **R8** | Headspace (cited in AETHER plan) | Matching users to personalized courses increased engagement by 20%; Gen Z expects relevance |

---

## Decision records

### DR-01: Target audience — Indian exam aspirants

**Problem:** Generic mental health apps miss the specific pressures of NEET, JEE, Kota coaching, and parental rank comparisons.

**Research:** R1 documents systemic pressure in India's education system. R2 shows the human cost among 15–20 year olds preparing for competitive exams.

**Decision:** Build specifically for NEET, JEE, CUET, CAT, GATE, UPSC, and board exam students — with exam type, days-to-exam, and culturally specific prompts.

**Implementation:**
- `exam_type` enum in schema: `supabase/migrations/001_initial_schema.sql`
- Profile fields: `exam_type`, `days_to_exam`, `exam_year`
- Onboarding collects exam context: `src/components/saathi/OnboardingFlow.tsx`
- AI prompts reference NEET/JEE/Kota pressure: `src/lib/ai/prompts/companion.ts`

---

### DR-02: Journal-first home screen

**Problem:** Clinical intake forms and structured mood scales create friction. Students need a low-threshold entry point.

**Research:** R4 (ROOM) — "doesn't just ask students to meditate or journal; guides them through common student experiences" with low-threshold onboarding. R6 (JournAI) — expressive writing with AI analysis reveals trends standard trackers miss.

**Decision:** Make open-ended journaling the home screen. No prompts, no structure — just "How are you really doing today?" Mood check-in is optional and lightweight.

**Implementation:**
- Primary route after onboarding: `/home`
- `JournalEditor` component on home page: `src/app/home/page.tsx`
- Journal analyst validates and listens — does not diagnose: `src/lib/ai/prompts/journal.ts`

---

### DR-03: Non-clinical, empathetic AI tone

**Problem:** Students avoid apps that feel like therapy or use diagnostic language. They want someone who "gets them."

**Research:** R5 (WTMF) — "Unlike traditional chatbots that aim to 'fix' or provide advice, WTMF is built to be emotionally available." R4 (ROOM) — exercises written in student voice, not clinical language.

**Decision:** AI persona is a friend who listens, not a therapist or coach. Explicit rules: no toxic positivity, no diagnosis, no clinical labels.

**Implementation:**
- Companion prompt rules: `src/lib/ai/prompts/companion.ts` — "LISTEN FIRST — don't rush to fix"
- Journal prompt: `src/lib/ai/prompts/journal.ts` — "VALIDATE and LISTEN — presence over fixing"
- Insights prompt: `src/lib/ai/prompts/insights.ts` — "NOT clinical, NOT alarming"
- Disclaimer on login, onboarding, chat, profile: `src/lib/safety/crisis.ts` → `AI_DISCLAIMER`

---

### DR-04: Cultural fluency and Hinglish support

**Problem:** Indian students express emotions in Hinglish with regional idioms. Generic English-only AI feels alien.

**Research:** R5 (WTMF) — understands "mood off hai", "uff yaar"; responds without toxic positivity in culturally fluent language.

**Decision:** Support English, Hindi, and Hinglish. AI responds in the student's preferred language. System prompts include Indian exam culture references.

**Implementation:**
- `language_pref` enum: `en`, `hi`, `hinglish`
- Language passed to all AI prompts
- Hinglish examples in companion prompt: "mood off hai", "mann nahi kar raha", "log kya kahenge"
- Demo user Aanya writes in Hinglish: `supabase/seed/aanya-narrative.json`

---

### DR-05: GenAI for journal analysis (not just mood scores)

**Problem:** Mood scales (1–10) and checkbox emotions are reductive. A student might rate "6" every day while their journal reveals escalating despair about a specific subject.

**Research:** R3 (Wayhaven) — LLMs can detect mental health signals in naturalistic language, enabling earlier detection. R6 (JournAI) — AI extracts meaningful information from journal entries and tracks well-being trends.

**Decision:** Use Groq LLM to analyze open-ended journal text for themes, emotional content, and micro-steps — not just sentiment scores.

**Implementation:**
- `POST /api/journal/analyze` — structured JSON output with reflection, themes, microStep, invitationQuestion
- Model: `llama-3.1-8b-instant` for fast analysis
- Stored in `journal_entries`: themes[], sentiment_signals, ai_reflection

---

### DR-06: Weekly Pattern Reports

**Problem:** Students often don't realize they're spiraling until they're deep in it. Standard analytics show mood line graphs but can't explain *why* the line is moving.

**Research:** R3 — everyday text-based systems detect mental health signals and enable earlier detection. R6 — personal emotion patterns like "stress increases after 3 PM" or "mood drops on Mondays."

**Decision:** Generate weekly AI Pattern Reports that connect dots across entries — recurring stress triggers, day-of-week patterns, word frequency shifts — framed as invitations, not diagnoses.

**Implementation:**
- `GET /api/insights/weekly` with ISO-week caching in `weekly_insights`
- Insights prompt looks for: subject-linked stress, day-of-week patterns, word frequency, entry length trends
- Output includes evidence quotes from the student's own words
- UI: `src/app/insights/page.tsx`, `src/components/saathi/InsightsView.tsx`

---

### DR-07: Conversational companion (24/7)

**Problem:** Students need someone to talk to at 2 AM when they can't sleep. Traditional support isn't available then.

**Research:** R3 (Wayhaven) — AI-powered support complements traditional mental health resources. R5 (WTMF) — chat designed to feel like talking to a close friend.

**Decision:** Streaming chat companion available 24/7 with context from profile, recent moods, and journal themes. Remembers conversation within sessions.

**Implementation:**
- `POST /api/chat` — Vercel AI SDK streaming
- Model: `llama-3.3-70b-versatile` for higher conversational quality
- Context assembly: profile, 7 recent moods, 3 recent journal themes/snippets
- Persisted in `chat_sessions` + `chat_messages`

---

### DR-08: Calm Kit — micro-interventions (2–7 min)

**Problem:** Generic advice ("try breathing") at the wrong moment feels useless. Timing and relevance matter.

**Research:** R7 — CBT-based stress management apps reduce perceived stress beyond psychoeducation. R4 (ROOM) — library of breathing, self-compassion, and cognitive strategies students choose from.

**Decision:** 10 curated micro-interventions (2–7 min), adaptively recommended based on journal themes. Track effectiveness per user.

**Implementation:**
- Static exercise library: `src/lib/data/calm-kit.ts` — 10 exercises
- Rule-based `recommendExercise(themes, tags)` — tag overlap scoring
- Journal analysis returns `recommendedExerciseId`
- Effectiveness tracking: `coping_preferences` table updated on completion
- Exercise player: `src/app/calm-kit/[id]/page.tsx`

---

### DR-09: Trust level progression (1–5)

**Problem:** A new user needs gentle listening; a returning user may benefit from gentle cognitive challenges. One-size-fits-all tone fails.

**Research:** R4 (ROOM) — "designed to grow with them." R8 (Headspace) — personalization drives engagement.

**Decision:** Trust level (1–5) on profile adjusts AI companion tone progressively.

**Implementation:**
- `trust_level` field on `profiles` (default 1, demo Aanya at 4)
- `buildCompanionPrompt` in `src/lib/ai/prompts/companion.ts`:
  - Level 1–2: extra gentle, listen more
  - Level 3–4: balance listening with gentle CBT suggestions
  - Level 5: may gently challenge negative self-talk with consent

---

### DR-10: Crisis safety — rule-based first, LLM second

**Problem:** Some students will express suicidal ideation. AI must respond safely every time, without relying on LLM judgment alone.

**Research:** R3 — app complements but does not replace professional care. AETHER safety protocol — immediate empathetic response, crisis resources, gentle persistence, no false reassurance.

**Decision:** Rule-based keyword detection (English + Hindi) runs before LLM. Crisis content bypasses AI and returns a fixed template with helpline numbers.

**Implementation:**
- `checkCrisisContent()` in `src/lib/safety/crisis.ts` — 23 keywords EN + Hindi
- Crisis path in journal and chat API routes — no LLM call
- `crisis_events` table logs severity + source only (no journal content)
- Resources: Tele-MANAS 14416, iCall 9152987821, Vandrevala 9999666555, Emergency 112
- Quick Exit button: `src/components/saathi/QuickExit.tsx`
- Crisis sheet always accessible: `src/components/saathi/CrisisSheet.tsx`

---

### DR-11: Warm onboarding (no clinical intake)

**Problem:** Most mental health apps lose users in the first 48 hours. Clinical intake forms increase drop-off.

**Research:** R4 (ROOM) — low-threshold onboarding. R8 (Headspace) — better onboarding drives deeper engagement.

**Decision:** Onboarding is a warm conversation: name, exam, language, first journal. Immediate value — first entry gets an empathetic AI response.

**Implementation:**
- `OnboardingFlow.tsx` — welcome → profile setup → first journal
- Middleware enforces completion before accessing app: `src/lib/supabase/middleware.ts`
- No clinical questionnaires or diagnostic scales

---

### DR-12: Cloud storage vs local-first (known tradeoff)

**Problem:** Students won't use a mental health app if they don't trust it with vulnerable thoughts.

**Research:** R6 (JournAI) — offline-first approach "ensures confidentiality, allowing users to engage without privacy concerns."

**Decision:** MVP uses Supabase cloud storage for auth simplicity, demo seeding, and cross-device access. Privacy messaging emphasizes no data selling and journal export. Local-first is a known future improvement.

**Implementation:**
- All data in Supabase with RLS (users access own data only)
- Journal export available in profile
- "We never sell your data" on login page
- **Not implemented:** offline/local-first storage (planned tradeoff documented)

---

### DR-13: Why Groq specifically

**Problem:** Need fast, affordable LLM inference for hackathon/demo scale with structured JSON and streaming support.

**Decision:** Groq for low-latency inference. Two-model strategy: larger model for chat quality, smaller model for structured analysis throughput. Multi-key rotation for rate limit resilience.

**Implementation:**
- Chat: `llama-3.3-70b-versatile` via `@ai-sdk/groq`
- Journal + insights: `llama-3.1-8b-instant` via `groq-sdk`
- Key pool: `src/lib/groq/pool.ts`, `src/lib/groq/stream-pool.ts` — round-robin, 429 cooldown, 6 retry attempts

---

### DR-14: Voice input and read-aloud (browser-first)

**Problem:** Students under exam stress may be too tired to type, have literacy barriers, or prefer speaking in Hinglish. Typing-only interfaces exclude many users.

**Research:** AETHER Phase 2 planned voice journaling. Inclusive design principles require multimodal input beyond keyboard.

**Decision:** Add browser Web Speech API for dictation (STT) and `speechSynthesis` for read-aloud (TTS) on chat and journal. Store voice preferences in localStorage (zero schema migration). Groq Whisper deferred for better Hinglish accuracy.

**Implementation:**
- `src/hooks/useSpeechInput.ts`, `src/hooks/useSpeechOutput.ts`
- Mic + speaker buttons in `CompanionChat.tsx`, `JournalEditor.tsx`
- `src/components/a11y/VoiceSettings.tsx` on profile
- Locale mapping: `language_pref` → `en-IN` / `hi-IN`

---

### DR-15: Accessibility as a first-class requirement

**Problem:** Mental health apps must work for users with visual, motor, and cognitive disabilities — not only mouse-and-keyboard users.

**Decision:** Harden ARIA semantics, keyboard navigation, screen reader announcements, and automated a11y testing before adding voice controls.

**Implementation:**
- `SkipToMain`, `LiveRegion`, labeled chat input, collapsible `aria-expanded`
- Crisis sheet focus trap (`useFocusTrap.ts`) with tests
- jest-axe on `CompanionChat`, `JournalEditor`, `CrisisSheet`
- `useReducedMotion.ts` for motion preferences

---

### DR-16: AI reliability — key pool, health checks, deduplicated insights

**Problem:** Demo and production traffic can hit Groq rate limits. Chat originally used only the first API key. Insights logic was duplicated across SSR page and API route.

**Decision:** Extend key rotation to chat streaming; add health-check endpoint and CLI verifier; extract shared `generateWeeklyInsight()`.

**Implementation:**
- `src/lib/groq/stream-pool.ts` — `streamTextWithFallback` for chat
- `GET /api/health/ai`, `npm run verify:ai` → `scripts/verify-groq.ts`
- `src/lib/ai/generate-weekly-insight.ts` — shared by insights page and API

---

### DR-17: Real-time crisis pre-check

**Problem:** Crisis detection only at submit time may be too late; students need immediate access to resources while expressing distress.

**Decision:** Debounced client-side pre-check via `/api/crisis/check` while typing in chat/journal; opens crisis sheet proactively. Server-side keyword check on submit remains authoritative; LLM still bypassed on crisis.

**Implementation:**
- `src/hooks/useCrisisPrecheck.ts`
- `AppShell.tsx` listens for `saathi:crisis-detected` custom event

---

## Feature-to-research summary

| Feature | Research IDs | Key files |
|---------|-------------|-----------|
| Exam-specific targeting | R1, R2 | `001_initial_schema.sql`, `OnboardingFlow.tsx` |
| Journal-first home | R4, R6 | `home/page.tsx`, `journal.ts` |
| Empathetic AI tone | R4, R5 | `companion.ts`, `journal.ts`, `insights.ts` |
| Hinglish support | R5 | `language_pref` enum, all prompts |
| AI journal analysis | R3, R6 | `journal/analyze/route.ts` |
| Pattern Reports | R3, R6 | `insights/weekly/route.ts`, `insights.ts` |
| 24/7 chat companion | R3, R5 | `chat/route.ts`, `companion.ts` |
| Calm Kit exercises | R4, R7 | `calm-kit.ts`, `exercises/complete/route.ts` |
| Trust level | R4, R8 | `companion.ts`, `profiles.trust_level` |
| Crisis safety | R3, AETHER | `crisis.ts`, journal + chat routes |
| Warm onboarding | R4, R8 | `OnboardingFlow.tsx`, middleware |
| Voice input + read-aloud | AETHER Phase 2 | `useSpeechInput.ts`, `useSpeechOutput.ts`, `VoiceSettings.tsx` |
| Accessibility hardening | WCAG / inclusive design | `SkipToMain`, `LiveRegion`, jest-axe tests |
| AI health verification | Groq reliability | `/api/health/ai`, `scripts/verify-groq.ts` |
| Chat key pool | Groq rate limits | `stream-pool.ts` |
| Crisis pre-check | AETHER safety | `useCrisisPrecheck.ts`, `/api/crisis/check` |
| Testing / CI | Production quality | Vitest, Playwright, `.github/workflows/ci.yml` |
| Privacy approach | R6 | Supabase RLS, profile export |

---

## What we deliberately did not build (yet)

| Planned feature | Research basis | Status |
|-----------------|----------------|--------|
| Push notification nudges | R8 (Headspace retention) | Rule-based home CTA only; no push delivery |
| Anonymous community | R4 (isolation pain point) | Not in MVP |
| Groq Whisper STT | AETHER Phase 2 | Browser STT implemented; Whisper planned |
| RAG / full journal memory in chat | R3, R6 | Partial context only (3 journals + reflection) |
| LLM crisis classifier | AETHER safety | Keyword detection only |
| Local-first / offline storage | R6 (JournAI privacy) | Cloud Supabase instead |
| Multilingual UI | R5 (Hinglish) | AI language only; UI mostly English |
| Institutional partnerships | AETHER Phase 3 | Not in MVP |

These are documented honestly in [architecture.md](architecture.md) under "Implemented vs planned."
