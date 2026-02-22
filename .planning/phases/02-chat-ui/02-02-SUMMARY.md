---
phase: 02-chat-ui
plan: 02
status: complete
completed: 2026-02-22
commits:
  - e875d5c
  - 14f53a0
  - 05056cc
  - a80241b
  - 9e0a1d6
  - e1827a6
  - a29fd4e
  - 4c08fbc
  - 2ab44be
  - a94b9fb
  - 40f3006
---

# Plan 02-02 Summary: Chat UI Polish + iPhone Verification

## What Was Built

### Core deliverables (plan spec)
- **message-renderer.js** — `renderMessage(message)` factory. Assistant messages: `marked.parse()` + `DOMPurify.sanitize()` piped to innerHTML. User messages: `textContent` (plain text, XSS-safe). Timestamps (HH:MM) on assistant messages only.
- **scroll-anchor.js** — `createScrollAnchor(threadEl)`. Auto-scrolls on new message when at bottom (< 50px threshold). Shows "New message" chip when scrolled up; chip taps to jump to bottom. Chip positioned absolute within `.chat-view`.
- **Load-more control** — "Load earlier messages" button prepended at top of thread when message count exceeds 50. Preserves scroll position on prepend.

### Additional work (iPhone verification + user feedback)
- **iOS keyboard gap fix** — replaced `calc(100dvh - 52px)` with proper flex height chain: `html → body → #app → .app-main → .chat-view` all `height: 100%`. `interactive-widget=resizes-content` retained in viewport meta.
- **iOS zoom prevention** — textarea `font-size: 16px` on touch devices (`pointer: coarse`), 13px on desktop (matches message text).
- **Header buttons** — hamburger history button (left, visual-only for Phase 3) and compose/new-conversation button (right, functional — clears store + thread, resets to empty state). Ant Design `ArrowUpOutlined` SVG for send button.
- **Desktop layout** — max-width 900px centred column at `≥768px`. `width: 100%` on flex items to prevent intrinsic-size collapse with `overflow: hidden`.
- **Empty state** — vertically centred via `min-height: 100%` on `.chat-empty`; collapses to `height: 0` on hidden to prevent messages rendering below invisible element. Copy: "F*ck Perfection." / "SUCCESS COMES FROM 70% EVERY DAY, / NOT PERFECT ONCE A WEEK."
- **Typography** — message text 13px with `letter-spacing: -0.01em`, heading sizes scaled proportionally. Monospace textarea matches message rhythm. Subtitle all-caps.
- **UI polish** — dark grey send button (#333), monochromatic chip/focus colours (no blue), Enter-to-send on desktop only (`pointer: fine`), removed input bar `border-top`.

## Self-Check

| Must-have | Status |
|-----------|--------|
| AI responses render markdown (bold, bullets, headers) | ✓ |
| User can scroll up to read earlier messages | ✓ |
| "New message" chip when scrolled up, tappable | ✓ |
| Timestamps on AI messages only | ✓ |
| Dark theme matches Compound OS visually | ✓ |
| Chat polished on iPhone — keyboard pushes input up, no gap | ✓ (flex height chain) |

Human verification: **Approved** (iPhone testing across multiple feedback rounds)

## Artefacts

| File | Status |
|------|--------|
| src/chat/message-renderer.js | Created |
| src/chat/scroll-anchor.js | Created |
| src/chat/chat-view.js | Updated (renderer, scroll anchor, load-more, header buttons, new-conversation reset) |
| src/chat/chat-view.css | Updated (all layout + style fixes) |
| src/chat/message-store.js | Updated (added `clear()` for new-conversation reset) |
