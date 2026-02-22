# Roadmap: Sustenance OS

## Overview

Sustenance OS is built in five phases that each deliver a complete, testable capability. Phase 1 gets the app live on the iPhone. Phase 2 gives it a coaching-grade chat interface. Phase 3 wires in the AI coaching engine with screenshot-based OCR. Phase 4 adds persistent conversation history with smart daily session management and self-learning context. Phase 5 makes the fire meals database a first-class feature of the coaching loop.

## Phases

- [x] **Phase 1: Foundation** - Vite project live on Vercel, installable as PWA on iPhone
- [x] **Phase 2: Chat UI** - Claude-styled chat interface with Compound OS aesthetics and session history
- [x] **Phase 3: AI Coaching + OCR** - Screenshot upload, vision parsing, Sustenance persona, BED guardrails
- [ ] **Phase 4: Conversation Memory** - Persistent daily sessions, smart 04:00 boundary, named conversations, self-learning context summaries
- [ ] **Phase 5: Fire Meals** - Browseable database pre-seeded from fire-meals.md, addable via chat, referenced in coaching

## Phase Details

### Phase 1: Foundation
**Goal**: The app is live, reachable via a home screen shortcut on iPhone, and looks like the scaffold of something real
**Depends on**: Nothing (first phase)
**Requirements**: APP-01, APP-02, APP-03
**Success Criteria** (what must be TRUE):
  1. User can open the app from the iPhone home screen with no browser chrome visible
  2. App loads on Vercel production URL and is reachable from any device
  3. Layout is mobile-first and finger-friendly — no horizontal scrolling, no tiny tap targets
**Plans:** 2 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Vite project from Compound OS, push to GitHub, deploy to Vercel
- [x] 01-02-PLAN.md — PWA manifest, service worker, iPhone meta tags, home screen verification

### Phase 2: Chat UI
**Goal**: The chat interface feels like a polished coaching tool — visually consistent with Compound OS and capable of rendering rich AI responses
**Depends on**: Phase 1
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. User can send a message and receive a styled AI response in a chat bubble thread
  2. AI responses render markdown (bold, bullet lists, headers) correctly
  3. Earlier messages in the conversation remain visible by scrolling up
  4. Dark theme, palette, and typography match Compound OS visually
**Plans:** 2 plans

Plans:
- [x] 02-01-PLAN.md — Chat view layout, input bar, message store, stub AI response
- [x] 02-02-PLAN.md — Markdown rendering, scroll anchoring, iPhone verification

### Phase 3: AI Coaching + OCR
**Goal**: The Sustenance persona is live — user can upload a MacroFactor screenshot, the AI reads it silently, and all coaching responses are BED-safe, trend-based, and actionable
**Depends on**: Phase 2
**Requirements**: OCR-01, OCR-02, OCR-03, COACH-01, COACH-02, COACH-03, COACH-04
**Success Criteria** (what must be TRUE):
  1. User can upload a MacroFactor screenshot and receive a coaching response without any raw numbers appearing in the UI
  2. Coach refers to trends and patterns ("you've been fuelling well this week") never exact figures
  3. When a meal is mentioned, the coach offers Gold/Silver/Bronze improvement suggestions
  4. Coach asks a contextual follow-up when an eating pattern is detected in the conversation
**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Claude API client, session context store, API key entry overlay
- [x] 03-02-PLAN.md — Upload modal (+button, Camera/Photos/Files), image thumbnails, XLSX parsing via SheetJS
- [x] 03-03-PLAN.md — Sustenance persona system prompt, tier pill rendering, full coaching pipeline wiring, iPhone verification

### Phase 4: Conversation Memory
**Goal**: The app remembers every conversation — sessions are named by day, the coach accumulates context over time, and smart session boundaries mean you never lose continuity or blow up your token budget
**Depends on**: Phase 3
**Requirements**: MEM-01, MEM-02, MEM-03, MEM-04
**Success Criteria** (what must be TRUE):
  1. Each day (04:00–00:00 UK time) is a single named conversation ("Mon - 23rd Feb") — messages persist across app closes
  2. Between 00:00–04:00 UK time, the app prompts "Start a new day?" before creating a new session
  3. Tapping the history icon shows a scrollable list of past conversations, each tappable to review
  4. The coach references patterns from previous sessions ("last week you mentioned...") via injected summaries — not full history dumps
**Plans**: TBD

Plans:
- [ ] 04-01: Conversation storage — localStorage schema, named sessions, day-boundary detection (04:00 UK)
- [ ] 04-02: History UI — conversation list drawer, session switcher, session naming
- [ ] 04-03: Session context injection — end-of-session summarisation via Claude, summary storage, prior-session context block in system prompt
- [ ] 04-04: 00:00–04:00 prompt — "New day?" modal, graceful continuation or new session

### Phase 5: Fire Meals
**Goal**: The fire meals database is a first-class part of the app — browseable, extendable via chat, and actively used by the coach when making suggestions
**Depends on**: Phase 4
**Requirements**: MEALS-01, MEALS-02, MEALS-03
**Success Criteria** (what must be TRUE):
  1. User can open a fire meals view and browse meals by category (breakfast, lunch, dinner, snacks, etc.)
  2. User can say "add [meal] to my fire meals" in chat and the meal appears in the database
  3. When the coach makes meal suggestions, it pulls from the user's actual fire meals list
**Plans**: TBD

Plans:
- [ ] 05-01: Fire meals data layer — seed from fire-meals.md, category structure, local persistence
- [ ] 05-02: Browse UI — category tabs or filter, meal cards, mobile-optimised layout
- [ ] 05-03: Add-via-chat — intent detection in coach pipeline, write new meal to database, confirm in response
- [ ] 05-04: Coach integration — inject fire meals list into system prompt context for relevant suggestions

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-02-22 |
| 2. Chat UI | 2/2 | Complete | 2026-02-22 |
| 3. AI Coaching + OCR | 3/3 | Complete | 2026-02-22 |
| 4. Conversation Memory | 0/4 | Not started | - |
| 5. Fire Meals | 0/4 | Not started | - |

---
*Roadmap created: 2026-02-22*
