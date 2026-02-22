# Requirements: Sustenance OS

**Defined:** 2026-02-22
**Core Value:** A protective coaching layer between the user and raw nutrition data — guiding through fire meals and behavioral insight without ever surfacing numbers.

## v1 Requirements

### App Shell

- [ ] **APP-01**: App deploys to Vercel via GitHub with a production URL
- [ ] **APP-02**: App is installable as a PWA on iPhone home screen (full-screen, no browser chrome)
- [ ] **APP-03**: Mobile-first responsive layout (iPhone primary, usable on desktop)

### Chat Interface

- [ ] **CHAT-01**: Claude-styled chat UI with message bubbles and clean thread layout
- [ ] **CHAT-02**: Styled to match Compound OS (dark theme, same palette and typography)
- [ ] **CHAT-03**: Markdown rendering in AI responses (bold, lists, headers)
- [ ] **CHAT-04**: Session history persists within a conversation (scroll to see earlier messages)

### Screenshot Upload

- [ ] **OCR-01**: User can upload a MacroFactor screenshot from camera roll
- [ ] **OCR-02**: AI reads intake data from screenshot via vision (raw data stays hidden from UI)
- [ ] **OCR-03**: Uploaded screenshot sets coaching context for the session

### AI Coaching

- [ ] **COACH-01**: AI uses Sustenance persona with safe coaching guardrails (trend language, no raw numbers surfaced to user)
- [ ] **COACH-02**: Coach suggests fire meals from the user's actual fire meals list
- [ ] **COACH-03**: Meal improvement suggestions when meals are discussed (Gold/Silver/Bronze tier)
- [ ] **COACH-04**: Contextual follow-up questions when eating patterns are detected

### Fire Meals

- [ ] **MEALS-01**: User can browse fire meals by category (pre-seeded from existing data)
- [ ] **MEALS-02**: User can add new meals to the list via chat
- [ ] **MEALS-03**: AI references the fire meals list when making coaching suggestions

## v2 Requirements

### Noom Knowledge Base

- **NOOM-01**: Async pipeline ingests Noom program content from Slack screenshots into a knowledge base
- **NOOM-02**: Ingested Noom content available as additional coaching context

### Extended Features

- **EXT-01**: Shopping list generator — select fire meals for the week, output ingredient list
- **EXT-02**: Barcode scanning for ingredient database
- **EXT-03**: Recipe OCR upload (beyond MacroFactor screenshots)
- **EXT-04**: Weekly trend summary view (patterns over time)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Raw numbers displayed in UI | Non-negotiable safety constraint — never |
| Multi-user / auth system | Single user only for v1 |
| Real-time Slack ingestion | Async batch processing sufficient, simpler |
| Native mobile app | PWA achieves home screen goal without app store |
| Barcode scanning | Defer to v2 — not core to coaching loop |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| APP-01 | Phase 1 | Pending |
| APP-02 | Phase 1 | Pending |
| APP-03 | Phase 1 | Pending |
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 2 | Pending |
| CHAT-04 | Phase 2 | Pending |
| OCR-01 | Phase 3 | Pending |
| OCR-02 | Phase 3 | Pending |
| OCR-03 | Phase 3 | Pending |
| COACH-01 | Phase 3 | Pending |
| COACH-02 | Phase 3 | Pending |
| COACH-03 | Phase 3 | Pending |
| COACH-04 | Phase 3 | Pending |
| MEALS-01 | Phase 4 | Pending |
| MEALS-02 | Phase 4 | Pending |
| MEALS-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 17
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-22*
*Last updated: 2026-02-22 after initial definition*
