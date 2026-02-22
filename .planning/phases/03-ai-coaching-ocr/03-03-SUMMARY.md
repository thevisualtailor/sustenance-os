---
phase: 03-ai-coaching-ocr
plan: 03
subsystem: ai-coaching
tags: [sustenance-persona, tier-pills, ocr, coaching-pipeline, vercel-serverless]

requires:
  - phase: 03-01
    provides: Claude API client, session context store, conversation history array
  - phase: 03-02
    provides: Upload modal, XLSX parsing, image attachment thumbnails

provides:
  - Sustenance coaching persona (BED-safe system prompt)
  - Tier pill rendering ([TIER:Gold/Silver/Bronze] → gradient span badges)
  - Full AI coaching pipeline (two-call OCR + coaching response)
  - Server-side Anthropic proxy via Vercel serverless function

affects: ["04"]

tech-stack:
  added: []
  patterns:
    - "Vercel serverless function as API proxy — ANTHROPIC_API_KEY in Vercel env vars, never in browser"
    - "Two-call OCR pipeline: sendOcrExtraction extracts once, image discarded from history, JSON injected into session context"
    - "Tier token post-processing in renderer: [TIER:X] replaced with gradient span BEFORE DOMPurify sanitization so spans survive"
    - "Conversation history array for multi-turn context — messages array passed to every proxy call"

key-files:
  created:
    - src/chat/sustenance-persona.js
    - api/chat.js
  modified:
    - src/chat/chat-view.js
    - src/chat/message-renderer.js
    - src/chat/chat-view.css
    - src/chat/claude-api.js
    - src/main.js

key-decisions:
  - "Server-side Anthropic proxy via api/chat.js — API key in Vercel env vars, not browser localStorage"
  - "ANTHROPIC_MODEL env var controls model (default: claude-haiku-4-5-20251001)"
  - "Two-call OCR pipeline: extract once via sendOcrExtraction, discard image from history, inject JSON into session context"
  - "Tier tokens [TIER:X] injected BEFORE DOMPurify sanitization so gradient spans survive sanitization"

duration: ~30 min
completed: 2026-02-22
---

# Phase 3 Plan 03: Sustenance Persona + Full Pipeline Summary

**Complete AI coaching pipeline with BED-safe Sustenance persona, server-side Anthropic proxy, two-call OCR flow, and gradient tier pill rendering — verified working on iPhone.**

## Performance

- **Duration:** ~30 min
- **Started:** 2026-02-22
- **Completed:** 2026-02-22
- **Tasks:** 5 (2 planned + 3 architectural additions)
- **Files modified:** 7

## Accomplishments

- Sustenance coaching persona live: BED-safe system prompt that coaches through trends and patterns, never raw numbers, and uses Gold/Silver/Bronze tier tokens for meal suggestions
- Server-side Anthropic proxy: api/chat.js Vercel serverless function handles all Anthropic calls — API key stored in Vercel env vars, never exposed to the browser; overlay entry removed entirely
- Two-call OCR pipeline: image sent to Claude Vision for extraction, nutritional JSON injected into session context, image discarded from ongoing conversation history
- Tier pill rendering: [TIER:Gold], [TIER:Silver], [TIER:Bronze] tokens replaced with gradient badge spans before DOMPurify sanitization so the spans survive the sanitizer pass
- iPhone verified: full end-to-end flow (upload screenshot, receive BED-safe coaching response with tier pills) confirmed working in production at sustenance-os.vercel.app

## Task Commits

Each task was committed atomically:

1. **Task 1: Sustenance persona + tier pill rendering** - `fb2d7a8` (feat)
2. **Task 2: Wire coaching pipeline** - `37b4c0c` (feat)
3. **Task A: Vercel serverless API proxy** - `25ba25a` (feat)
4. **Task B: claude-api.js refactor to proxy calls** - `41f0bc0` (refactor)
5. **Task C+D: Remove API key overlay** - `c061db9` (refactor)

## Files Created/Modified

- `src/chat/sustenance-persona.js` - BED-safe Sustenance system prompt; defines persona, behavioral rules, and [TIER:X] token convention
- `api/chat.js` - Vercel serverless function proxying requests to Anthropic API; reads ANTHROPIC_API_KEY and ANTHROPIC_MODEL from env vars
- `src/chat/chat-view.js` - Wired sendOcrExtraction and sendCoachingMessage into upload and send flows; two-call OCR pipeline implemented here
- `src/chat/message-renderer.js` - Pre-sanitization tier token replacement: [TIER:Gold/Silver/Bronze] → gradient span badges
- `src/chat/chat-view.css` - Tier pill gradient styles; API key overlay styles removed
- `src/chat/claude-api.js` - Refactored from direct Anthropic fetch to proxy calls via /api/chat
- `src/main.js` - API key overlay initialization removed; app starts directly into chat view

## Decisions Made

- **Server-side proxy over direct browser calls:** Original plan called for `anthropic-dangerous-direct-browser-access` header and API key in localStorage. Changed to Vercel serverless proxy (api/chat.js) — better security (key never in browser), cleaner model control via env vars, and removes the localStorage overlay UX entirely. User approved during execution.
- **ANTHROPIC_MODEL env var:** Model selection externalized to Vercel env vars with claude-haiku-4-5-20251001 as default — allows model upgrades without code deploys.
- **Two-call OCR pipeline:** Image sent once for extraction, result JSON stored in session context, image base64 discarded from conversation history. Keeps context window lean for multi-turn coaching.
- **Tier token injection order:** [TIER:X] replaced with gradient spans BEFORE DOMPurify sanitization. If injected after, DOMPurify strips the spans. Order dependency documented in message-renderer.js.

## Deviations from Plan

### Architectural Change (user-approved)

**[Rule 4 - Architectural] Moved from direct browser API calls to Vercel serverless proxy**

- **Found during:** Task 2 (wire coaching pipeline)
- **Original plan:** Browser calls Anthropic directly with `anthropic-dangerous-direct-browser-access: true` header; API key stored in localStorage and entered via overlay on first load
- **Change:** api/chat.js serverless function proxies all Anthropic calls; ANTHROPIC_API_KEY stored in Vercel environment variables; API key overlay removed from app entirely
- **Reason:** User requested server-side control over model and API key — better security, no key exposure in browser, model upgrades without code changes
- **Additional commits:** 25ba25a (api/chat.js), 41f0bc0 (claude-api.js refactor), c061db9 (removed API key overlay)
- **Approval:** Checkpoint returned to user; user approved this architectural direction

---

**Total deviations:** 1 architectural change (user-approved via checkpoint)
**Impact on plan:** Improved security posture and UX (no overlay on first load). Required 3 additional commits beyond original 2-task plan. No scope creep — all changes directly serve the coaching pipeline.

## Issues Encountered

None — plan executed cleanly after architectural decision resolved.

## User Setup Required

None — ANTHROPIC_API_KEY and ANTHROPIC_MODEL already configured in Vercel environment variables during execution. No additional setup required.

## Next Phase Readiness

- Full coaching pipeline verified in production on iPhone — Phase 3 complete
- Phase 4 (Fire Meals) can begin: data layer, browse UI, add-via-chat, and coach integration are independent of Phase 3 internals
- api/chat.js proxy pattern established — Phase 4 coach integration can extend session context without changing the proxy

---
*Phase: 03-ai-coaching-ocr*
*Completed: 2026-02-22*

## Self-Check: PASSED
