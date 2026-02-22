# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-22)

**Core value:** Act as a BED-safe protective buffer between Jay and his nutrition data — coaching through fire meals and behavioral insight, never through numbers.
**Current focus:** Phase 3 — AI Coaching + OCR

## Current Position

Phase: 3 of 4 (AI Coaching + OCR)
Plan: 3 of 3 in current phase
Status: Phase complete
Last activity: 2026-02-22 — Completed Phase 3 (AI Coaching + OCR) — verified on iPhone

Progress: [████████░░] 75%

(8 of ~11 total plans complete across all phases)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: ~6 min
- Total execution time: ~47 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 of 2 | ~11 min | ~6 min |
| 02-chat-ui | 2 of 2 | ~3 min | ~3 min |
| 03-ai-coaching-ocr | 3 of 3 | ~33 min | ~11 min |

**Recent Trend:**
- Last 5 plans: 02-02 (0 min), 03-01 (1 min), 03-02 (2 min), 03-03 (~30 min)
- Trend: Phase 3 longer due to architectural decision (server-side proxy) and iPhone verification

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Vite + vanilla JS (no framework) — match Compound OS exactly, no React
- Claude Haiku as default AI model — pennies/day cost target
- OCR via Claude Vision — no dedicated OCR service, Claude reads MacroFactor natively
- No auth — single user (Jay), complexity not warranted
- Fire meals seeded from existing fire-meals.md — 50+ meals already documented
- Self-host Geist fonts in public/fonts/geist/ — /node_modules/ path breaks in Vercel production
- Vercel project: sustenance-os, scope: jay-carters-projects
- GitHub repo: thevisualtailor/sustenance-os (public)
- App shell pattern: createAppShell(root) returns { header, main } — future views append to main
- Vercel auto-deploys on push to main (GitHub connected)
- vite-plugin-pwa generateSW mode — zero boilerplate, Workbox handles precaching automatically
- PNG icons generated via Node.js zlib (scripts/generate-icons.js) — ImageMagick not available on dev machine
- apple-mobile-web-app-status-bar-style: black-translucent — status bar blends with dark background
- generateSW strategy (vite-plugin-pwa) — Workbox handles all SW edge cases, zero boilerplate
- apple-touch-icon link required in index.html — iOS ignores manifest icons array
- Enter=newline (default textarea behavior), Send=button only — no Enter intercept (locked)
- Send button never disabled — even during AI thinking delay (locked)
- Empty state opacity fade via .chat-empty--hidden class toggle — CSS transition handles animation
- Stub AI response (getStubResponse) in Phase 2 only — replaced by Claude Haiku API in Phase 3
- CSS :has() for full-bleed overrides — #app:has(.chat-view) removes padding without JS class
- dvh units for chat-view height — avoids iOS Safari 100vh toolbar clip bug
- Feature module pattern: src/chat/{feature}.js + CSS co-loaded, CSS imported in JS
- claude-haiku-4-5-20251001 model ID (not deprecated claude-3-haiku)
- anthropic-dangerous-direct-browser-access header required for browser CORS preflight (direct browser fetch)
- API key stored in localStorage key sustenance_anthropic_key
- Overlay styles co-located in chat-view.css — not a separate file
- SheetJS 0.20.3 installed via CDN tarball (npm install https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz) — not npm registry (outdated)
- XLSX sheet names are 'Quick Export' and 'Food Log' (exact, with spaces) — verified from MacroFactor exports
- File selection triggers immediate send — no separate confirm step (locked)
- "Analyse this" auto-filled when file sent with empty textarea
- createImageAttachment keeps File reference on attachment object — needed for Plan 03 base64 conversion
- Server-side Anthropic proxy via api/chat.js — API key in Vercel env vars, not browser localStorage
- ANTHROPIC_MODEL env var controls model (default: claude-haiku-4-5-20251001)
- Two-call OCR pipeline: extract once via sendOcrExtraction, discard image from history, inject JSON into session context
- Tier tokens [TIER:X] injected before DOMPurify sanitization so gradient spans survive the sanitizer pass

### Pending Todos

None

### Blockers/Concerns

None — Phase 3 complete. Ready for Phase 4 (Fire Meals).

## Session Continuity

Last session: 2026-02-22
Stopped at: Completed Phase 3 (AI Coaching + OCR) — all 3 plans verified
Resume file: None
