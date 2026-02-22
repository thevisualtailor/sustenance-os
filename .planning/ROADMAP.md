# Roadmap: Sustenance OS

## Overview

Sustenance OS is built in four phases that each deliver a complete, testable capability. Phase 1 gets the app live on the iPhone. Phase 2 gives it a coaching-grade chat interface. Phase 3 wires in the AI coaching engine with screenshot-based OCR. Phase 4 makes the fire meals database a first-class feature of the coaching loop.

## Phases

- [ ] **Phase 1: Foundation** - Vite project live on Vercel, installable as PWA on iPhone
- [ ] **Phase 2: Chat UI** - Claude-styled chat interface with Compound OS aesthetics and session history
- [ ] **Phase 3: AI Coaching + OCR** - Screenshot upload, vision parsing, Sustenance persona, BED guardrails
- [ ] **Phase 4: Fire Meals** - Browseable database pre-seeded from fire-meals.md, addable via chat, referenced in coaching

## Phase Details

### Phase 1: Foundation
**Goal**: The app is live, reachable via a home screen shortcut on iPhone, and looks like the scaffold of something real
**Depends on**: Nothing (first phase)
**Requirements**: APP-01, APP-02, APP-03
**Success Criteria** (what must be TRUE):
  1. User can open the app from the iPhone home screen with no browser chrome visible
  2. App loads on Vercel production URL and is reachable from any device
  3. Layout is mobile-first and finger-friendly — no horizontal scrolling, no tiny tap targets
**Plans**: TBD

Plans:
- [ ] 01-01: Vite project scaffolded from Compound OS reference, GitHub repo, Vercel deploy pipeline
- [ ] 01-02: PWA manifest, service worker, and home screen meta tags configured for iPhone full-screen

### Phase 2: Chat UI
**Goal**: The chat interface feels like a polished coaching tool — visually consistent with Compound OS and capable of rendering rich AI responses
**Depends on**: Phase 1
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. User can send a message and receive a styled AI response in a chat bubble thread
  2. AI responses render markdown (bold, bullet lists, headers) correctly
  3. Earlier messages in the conversation remain visible by scrolling up
  4. Dark theme, palette, and typography match Compound OS visually
**Plans**: TBD

Plans:
- [ ] 02-01: Chat bubble layout, message thread, scroll behaviour, input field
- [ ] 02-02: Compound OS dark theme applied (colours, fonts, spacing), markdown renderer wired in
- [ ] 02-03: Session history — in-memory message store, scroll-to-bottom on new message, scroll-up for history

### Phase 3: AI Coaching + OCR
**Goal**: The Sustenance persona is live — user can upload a MacroFactor screenshot, the AI reads it silently, and all coaching responses are BED-safe, trend-based, and actionable
**Depends on**: Phase 2
**Requirements**: OCR-01, OCR-02, OCR-03, COACH-01, COACH-02, COACH-03, COACH-04
**Success Criteria** (what must be TRUE):
  1. User can upload a MacroFactor screenshot and receive a coaching response without any raw numbers appearing in the UI
  2. Coach refers to trends and patterns ("you've been fuelling well this week") never exact figures
  3. When a meal is mentioned, the coach offers Gold/Silver/Bronze improvement suggestions
  4. Coach asks a contextual follow-up when an eating pattern is detected in the conversation
**Plans**: TBD

Plans:
- [ ] 03-01: Screenshot upload UI — camera-roll picker, image preview, attach-to-session flow
- [ ] 03-02: Claude Vision OCR — send image to Haiku, extract intake data, store in session context (never render to UI)
- [ ] 03-03: Sustenance persona system prompt — BED guardrails, trend language, fire-meal coaching mode, Gold/Silver/Bronze tier logic
- [ ] 03-04: Coaching API integration — message pipeline, context injection (OCR data + persona), contextual follow-up detection

### Phase 4: Fire Meals
**Goal**: The fire meals database is a first-class part of the app — browseable, extendable via chat, and actively used by the coach when making suggestions
**Depends on**: Phase 3
**Requirements**: MEALS-01, MEALS-02, MEALS-03
**Success Criteria** (what must be TRUE):
  1. User can open a fire meals view and browse meals by category (breakfast, lunch, dinner, snacks, etc.)
  2. User can say "add [meal] to my fire meals" in chat and the meal appears in the database
  3. When the coach makes meal suggestions, it pulls from the user's actual fire meals list
**Plans**: TBD

Plans:
- [ ] 04-01: Fire meals data layer — seed from fire-meals.md, category structure, local persistence
- [ ] 04-02: Browse UI — category tabs or filter, meal cards, mobile-optimised layout
- [ ] 04-03: Add-via-chat — intent detection in coach pipeline, write new meal to database, confirm in response
- [ ] 04-04: Coach integration — inject fire meals list into system prompt context for relevant suggestions

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/2 | Not started | - |
| 2. Chat UI | 0/3 | Not started | - |
| 3. AI Coaching + OCR | 0/4 | Not started | - |
| 4. Fire Meals | 0/4 | Not started | - |

---
*Roadmap created: 2026-02-22*
