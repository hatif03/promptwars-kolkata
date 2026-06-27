# Judge Demo Script — Saathi AI Features

A **12–15 minute** live demo script for hackathon judges. Focus: **why Groq AI matters**, **how it keeps students safe**, and **what makes Saathi different from a generic chatbot**.

**Before you start:** confirm the deployed app is live and Groq keys work.

```bash
# Optional pre-flight (local or CI)
npm run verify:ai
# Or on Windows PowerShell:
$env:VERIFY_AI_DIRECT="1"; npm run verify:ai
```

**Demo login (no signup needed):**

| | |
|---|---|
| Email | `aanya@saathi.demo` |
| Password | `SaathiDemo2026!` |

Or click **Explore as Aanya Sharma** on `/login`.

---

## Demo arc (one sentence)

> Saathi uses **three Groq-powered AI surfaces** — journal reflection, weekly Pattern Reports, and 24/7 chat — wrapped in **rule-based crisis safety**, **accessibility**, and **voice input** so students who struggle to type can still be heard.

---

## Minute 0–1 — Hook & problem

**Say:**

> "NEET and JEE put millions of Indian students under pressure that generic wellness apps don't understand — rank comparisons, Kota isolation, Hinglish expression. Saathi is an AI companion built for that world. It's not a therapist; it listens first, in the student's language, and finds patterns they might miss themselves."

**Show:** Login page → click **Explore as Aanya Sharma**.

**Point out (10 sec):** AI disclaimer on login, Quick Exit and crisis resources always reachable.

---

## Minute 1–3 — AI Surface #1: Journal reflection

**Navigate:** `/home`

**Say:**

> "The home screen is journal-first — not a clinical intake form. When a student writes freely, Groq analyzes the text and returns a structured reflection: themes, a micro-step, an invitation question, and a Calm Kit recommendation. We use `llama-3.1-8b-instant` here because we need fast, reliable JSON — not streaming prose."

**Do (pick one):**

### Option A — Show existing seeded data
1. Scroll to **Your journal history** or open `/journal`
2. Open a Week 4 entry with Hinglish text
3. Read Saathi's reflection aloud — note themes like *physics*, *family*, *mock test*

### Option B — Live journal (recommended if Groq is fast)
1. On `/home`, type or **dictate** (mic button):
   > "Aaj physics mock bahut kharab gaya. Maa ne phone pe rank puchi. Mann nahi kar raha padhne ka."
2. Select mood **anxious**, tag **Physics** + **Family**
3. Click **Save & reflect**
4. Wait 3–5 seconds for AI response

**Highlight on screen:**
- **Reflection** — empathetic, non-clinical tone
- **Themes** — extracted from natural language, not a 1–10 mood scale
- **Micro-step** — small actionable suggestion
- **Recommended Calm Kit** card — AI + rule-based bridge to exercises

**Say:**

> "This is the JournAI / Wayhaven insight: mood scores lie; language tells the truth. The LLM catches subject-linked stress that a checkbox never would."

**Optional — Voice (30 sec):**
- Click **mic** on journal textarea → dictate in Hinglish
- After reflection appears, click **Listen** to hear TTS read-aloud
- Mention: browser Web Speech API, no extra API cost; Groq Whisper planned for better Hinglish accuracy

---

## Minute 3–5 — AI Surface #2: Pattern Report

**Navigate:** `/insights`

**Say:**

> "Students often don't see their own spirals until they're deep in it. Every week, Groq synthesizes journals and mood data into a Pattern Report — with evidence quotes from the student's own words. Same fast model as journal analysis; results are cached per ISO week."

**Do:**
1. Show **Week 4 — The Sunday pattern** (expand if collapsed)
2. Point to **observation + evidence quote** — e.g. physics stress, Sunday parent-call dips
3. Mention **Focus this week** invitation framing — not a diagnosis

**Say:**

> "This isn't a mood line graph. It's narrative intelligence: *why* the line moves, tied to exam culture — mocks, parental rank questions, coaching isolation."

**Optional — Force refresh:**
- Click **Refresh report** (calls `GET /api/insights/weekly?force=true`)
- Note: uses shared `generateWeeklyInsight()` — same logic as SSR page and API

---

## Minute 5–8 — AI Surface #3: Saathi Chat (hero moment)

**Navigate:** `/companion`

**Say:**

> "Chat uses the larger model — `llama-3.3-70b-versatile` — because conversation quality matters at 2 AM. Context is assembled from profile, trust level, recent moods, journal themes, and the latest reflection. Trust level 4 for Aanya means Saathi can gently suggest coping strategies, not just listen."

**Do — Continue Aanya's story:**
Type or dictate one of:

> "NEET kal hai. Neend hi nahi aayi. Haath kaamp rahe hain. Kya hoga agar main blank ho jau?"

Or:

> "Physics phir se weak lag raha hai. Log kya kahenge agar rank kharab aayi?"

**Highlight while response streams:**
- Response in **Hinglish/empathetic tone** — not toxic positivity
- AI references **exam context** (NEET, trust level, past themes if seeded)
- **Speaker icon** on assistant bubbles — TTS read-aloud for accessibility
- Disclaimer visible: AI companion, not therapist

**Say:**

> "Streaming via Vercel AI SDK. Keys rotate through a pool with 429 fallback — important when demo traffic spikes. You can verify all three AI surfaces with `npm run verify:ai`."

**Technical one-liner (if asked):**

> "Three surfaces, two models, one key pool. Chat streams through `streamTextWithFallback`; journal and insights use structured JSON through `callGroqWithFallback`."

---

## Minute 8–9 — AI + safety: Crisis path

**Say:**

> "For mental health, AI judgment alone isn't enough. Crisis detection is rule-based — English and Hindi keywords — and runs **before** Groq on journal and chat. If matched, the LLM is bypassed entirely."

**Do (carefully — don't linger):**
1. In chat or journal, type a **mild** test phrase judges understand is demo-only, e.g. mention feeling "hopeless" without explicit self-harm terms — **OR** describe the flow without live-triggering:
   > "If a student writes explicit crisis language, they get a fixed template with Tele-MANAS 14416 — no LLM improvisation. We also debounce-check as they type and open the crisis sheet proactively."

2. Click **Crisis** button (top-right) → show Tele-MANAS, iCall, Vandrevala, 112
3. Mention **Quick Exit** → instant redirect for privacy

**Say:**

> "Crisis events log severity and source only — never journal content. Safety first, always."

---

## Minute 9–10 — AI → action: Calm Kit bridge

**Navigate:** `/calm-kit` → open **Pre-Mock Calm** or **Box Breathing**

**Say:**

> "AI doesn't stop at chat. Journal analysis returns `recommendedExerciseId`; we merge that with rule-based tag scoring. Over time, `coping_preferences` tracks what actually helped. GenAI finds the pattern; structured exercises act on it."

**Do:** Start exercise, complete 1–2 steps, rate helpfulness.

---

## Minute 10–11 — Accessibility & inclusion

**Navigate:** `/profile`

**Say:**

> "Accessibility isn't an afterthought. Screen reader labels on chat, skip links, collapsible reports with proper ARIA, crisis modal with focus trap. Voice input and read-aloud help students with fatigue, dyslexia, or low literacy — dictate in Hinglish, listen to Saathi's response."

**Show:**
- **Voice assistance** toggles (TTS, auto-read chat replies)
- **Gentle nudges** switch — rule-based home CTA when no journal in 3+ days

**Optional:** Tab through login or chat to show keyboard focus rings.

---

## Minute 11–12 — Proactive nudges & data trust

**Navigate:** `/home` (if nudges enabled for Aanya)

**Say:**

> "Nudges are rule-based first — no LLM spam. If a student hasn't journaled in days or mood trends low, home shows a gentle CTA. Data stays in Supabase with RLS; export JSON from profile. We never sell data."

**Show:** Profile stats, **Export journal** button.

---

## Minute 12–13 — Engineering credibility (if technical judges)

**Say (pick what fits your audience):**

| Topic | One-liner |
|-------|-----------|
| **Models** | `70b` for chat empathy; `8b-instant` for structured journal + insights |
| **Key pool** | Round-robin + 429 cooldown; chat now uses `stream-pool.ts` |
| **Health check** | `GET /api/health/ai` pings all surfaces; `npm run verify:ai` for CI |
| **Tests** | 45 Vitest tests, jest-axe on core UI, Playwright smoke, GitHub Actions CI |
| **Prompts** | `src/lib/ai/prompts/` — listen first, no toxic positivity, Hinglish-aware |

**Optional terminal (15 sec):**

```bash
npm run verify:ai
# Expected: Chat ok, Journal ok, Insights ok, keysConfigured: 3
```

---

## Minute 13–15 — Close & Q&A prep

**Say:**

> "Saathi ships what research says students need: ROOM's low-threshold journaling, WTMF's emotional presence, Wayhaven's GenAI support — scoped for Indian exam culture. Phase 2 is Groq Whisper for better Hinglish STT and deeper journal memory. We're not replacing therapists; we're the saathi who's there when the coaching hostel is silent at 2 AM."

**Anticipated judge questions:**

| Question | Answer |
|----------|--------|
| Why Groq? | Low latency, free tier for demos, strong Llama 3 models, easy multi-key rotation |
| Is crisis detection enough? | No — it's a first gate; we always show helplines; LLM never handles active crisis alone |
| Hallucination risk? | Journal uses JSON schema; insights cite evidence quotes; companion prompt forbids diagnosis |
| Privacy? | RLS, no data selling, export available; crisis logs exclude content |
| vs ChatGPT? | Exam-specific context, trust levels, pattern reports, Calm Kit bridge, crisis protocol, Hinglish |
| Cost at scale? | 8b for batch analysis, 70b only for chat; key pool + caching (weekly insights) |

---

## Quick reference — AI feature map

| Feature | Route | Model | API |
|---------|-------|-------|-----|
| Journal reflection | `/home`, `/journal` | `llama-3.1-8b-instant` | `POST /api/journal/analyze` |
| Pattern Report | `/insights` | `llama-3.1-8b-instant` | `GET /api/insights/weekly` |
| Saathi Chat | `/companion` | `llama-3.3-70b-versatile` | `POST /api/chat` |
| Crisis pre-check | Chat + journal inputs | Rule-based | `POST /api/crisis/check` |
| AI health verify | Dev/CI | All three | `GET /api/health/ai` |
| Voice input | Mic on chat/journal | Browser STT | Client-side |
| Read-aloud | Speaker / Profile | Browser TTS | Client-side |

---

## Troubleshooting during live demo

| Problem | Fix |
|---------|-----|
| Groq 503 / slow | Run `verify:ai`; fall back to seeded Aanya data (no live journal) |
| Demo account missing | `npm run seed:aanya` on host with service role key |
| Voice mic greyed out | Use Chrome/Edge; say "typing works too" |
| Insights empty | Use Aanya's seeded Week 4 report; don't force-refresh |
| Chat streams empty | Check `GROQ_API_KEY_1` in Vercel env; redeploy |

---

## 3-minute lightning version

1. Login as Aanya → `/home` → show one Hinglish journal + AI reflection (30s)
2. `/insights` → Week 4 Sunday pattern with evidence quote (45s)
3. `/companion` → one live chat message about NEET anxiety (90s)
4. Crisis button + Quick Exit (15s)
5. "Three Groq surfaces, rule-based safety, built for NEET/JEE culture" (15s)

---

## Related docs

- [architecture.md](architecture.md) — technical pipelines
- [research-and-decisions.md](research-and-decisions.md) — why each feature exists
- [faq.md](faq.md) — judge Q&A
- [Root README](../README.md) — setup and credentials
