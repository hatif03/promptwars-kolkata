# Saathi Documentation

Technical and product documentation for the Saathi empathetic AI companion.

## Reading order

1. **[Root README](../README.md)** — project overview, demo credentials, quick start
2. **[Judge Demo Script](judge-demo-script.md)** — live 12-min walkthrough for judges (AI-focused)
3. **[Research & Decisions](research-and-decisions.md)** — why each feature exists, with citations
4. **[Architecture](architecture.md)** — system design, data model, API pipelines
5. **[FAQ](faq.md)** — complete question-and-answer reference

## Documents

| Document | Description |
|----------|-------------|
| [judge-demo-script.md](judge-demo-script.md) | **Step-by-step live demo for judges** — AI features, talking points, troubleshooting |
| [architecture.md](architecture.md) | Next.js app structure, Groq AI layer, voice/a11y, Supabase data model, testing/CI |
| [research-and-decisions.md](research-and-decisions.md) | Research bibliography and feature decision records with code references |
| [faq.md](faq.md) | Product, safety, technical, demo, and research Q&A |

## Related sources

| Source | Description |
|--------|-------------|
| [DeepSeek-AETHER AI Companion.md](../DeepSeek-AETHER%20AI%20Companion.md) | Original Project AETHER product vision, persona (Aanya), and research synthesis |
| [supabase/seed/aanya-narrative.json](../supabase/seed/aanya-narrative.json) | Demo user story, journals, insights, and chat seed data |
| [.env.example](../.env.example) | Required environment variables |

## Quick links

- **Demo login:** `aanya@saathi.demo` / `SaathiDemo2026!`
- **Judge demo:** [judge-demo-script.md](judge-demo-script.md)
- **AI verify:** `npm run verify:ai`
- **Seed script:** `npm run seed:aanya`
- **Schema:** [`supabase/migrations/001_initial_schema.sql`](../supabase/migrations/001_initial_schema.sql)
