# Sustenance OS

## What This Is

A personal nutrition coaching web app that lives as a home screen shortcut on Jay's iPhone. Jay uploads MacroFactor screenshots; the AI reads the intake data via OCR but acts as a protective buffer — coaching through fire meals, behavioral patterns, and trend-based guidance without ever surfacing raw numbers. Built as a Vite web app hosted on Vercel, styled after Compound OS.

## Core Value

Act as a BED-safe protective buffer between Jay and his nutrition data — coaching through fire meals and behavioral insight, never through numbers.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] PWA-accessible web app deployable to Vercel via GitHub with home screen shortcut support
- [ ] Claude-styled chat interface styled to match Compound OS (colors, fonts, aesthetic)
- [ ] MacroFactor screenshot upload with OCR to extract daily intake data (AI reads internally, never surfaces raw numbers)
- [ ] AI coaching engine using the Sustenance persona — BED-safe, trend-based, fire-meal-focused
- [ ] Fire meals database viewable and searchable in-app (pre-seeded from existing fire-meals.md)
- [ ] Ability to add new meals to the fire meals list through chat or a simple form
- [ ] Noom content knowledge base — async ingestion pipeline from Slack (modelled on Inbox OS)
- [ ] Chat history persists within a session (can reference earlier context in conversation)

### Out of Scope

- Real-time Slack ingestion — async pipeline only, processed via Claude Code when needed
- Barcode scanning for ingredient database — defer to v2
- Shopping list generator — defer to v2
- Recipe OCR upload (beyond MacroFactor screenshots) — defer to v2
- Multi-user / sharing — single user only (Jay)
- Macro numbers displayed to user anywhere in the UI — never, by BED protocol

## Context

- **Existing knowledge base**: `sustenance-context.md` (deep nutrition intelligence, BED protocol, Q1 2026 action plan, behavioral protocols), `fire-meals.md` (50+ fire-rated meals across all categories), `daily-logs/` (past tracking data)
- **Reference projects**: `compound.os-main/` (Vite + vanilla JS, Vercel deploy, UI patterns to mirror), `inbox-os-main/` (Slack ingestion pipeline to model Noom content flow on)
- **Diet profile**: Plant-based/vegan, gluten-free, seafood exceptions (tuna, prawns, white fish), £45-50/week budget (Aldi primary)
- **BED history**: Critical constraint — AI must never share exact calories, weight, or deficit numbers. Trend language only. See sustenance-context.md for full protocol and example translations.
- **MacroFactor**: Jay's tracking app. Screenshots show daily intake summary. AI reads OCR data internally to inform coaching — hidden from Jay.
- **Noom**: Program Jay is following for relationship-with-food education. Screenshots go to Slack → processed asynchronously into a knowledge base that informs coaching context.
- **AI cost target**: Pennies per day — optimize for model efficiency (Haiku for routine coaching, Sonnet only for complex analysis)

## Constraints

- **Tech Stack**: Vite + vanilla JS (match Compound OS exactly) — no React, no framework switch
- **Hosting**: Vercel via GitHub — same pipeline as Compound OS
- **AI cost**: Pennies per day maximum — Claude Haiku as default model, batch where possible
- **BED Protocol**: Non-negotiable — zero raw numbers visible to user anywhere. Every AI response must pass through BED filter.
- **Mobile-first**: Primary device is iPhone via home screen shortcut — UI must be finger-friendly, fast to load
- **Single user**: No auth system needed — Jay is the only user

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite + vanilla JS (no framework) | Match Compound OS architecture exactly — proven, deployable | — Pending |
| Claude Haiku as default AI model | Cost optimization — pennies/day target, still capable for coaching | — Pending |
| OCR via Claude Vision (not dedicated OCR service) | Avoids extra API, Claude reads MacroFactor screenshots natively | — Pending |
| Noom pipeline async (not real-time) | Real-time Slack webhooks add complexity; batch processing via Claude Code sufficient | — Pending |
| No auth | Single user (Jay) — complexity not worth it for v1 | — Pending |
| Fire meals seeded from existing file | 50+ meals already documented — don't rebuild from scratch | — Pending |

---
*Last updated: 2026-02-22