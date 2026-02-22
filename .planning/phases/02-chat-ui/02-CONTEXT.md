# Phase 2: Chat UI - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a polished chat interface — chat bubble thread, message input, session scroll history, and Compound OS dark visual language. AI responses render markdown. No AI backend wired in this phase — responses can be stubbed/static.

</domain>

<decisions>
## Implementation Decisions

### Message bubble design
- AI-first layout: AI messages are full-width (no bubble), user messages are smaller right-aligned bubbles — like Claude.ai
- No avatar or identity marker on AI messages — layout alone distinguishes sender
- Timestamps on AI messages only (not user messages)
- Loading state: animated "Thinking..." style indicator modelled on Claude Code's verb+animation pattern (not typing dots, not streaming)

### Input field behavior
- Auto-expanding textarea: starts single-line, grows as user types, caps at ~4 lines then becomes scrollable
- Send on button tap only — Enter adds newline, no keyboard send trigger
- Mobile keyboard viewport handling: Claude's discretion (handle resize so input stays accessible)
- Send button stays active while AI is responding — user can queue additional messages; no disable/lock

### Empty / initial state
- Blank canvas — no welcome message, no suggested prompts
- Centre of the empty space shows "SustenanceOS" in Instrument Serif (medium weight, clearly readable but not bold) with tagline "Persistent Imperfection" in Roboto Mono beneath it
- Both elements fade/disappear once chat messages are present
- Opacity/sizing: medium weight — present, not dominant

### Scroll anchoring
- Auto-scroll to bottom only when user is already at the bottom (don't interrupt history reading)
- When scrolled up and new message arrives: a "New message" chip appears at the bottom — tappable to jump down
- No persistent scroll-to-bottom button outside of the chip
- Session holds last N messages with a "load more" control for older history (N = Claude's discretion)

### Claude's Discretion
- Exact value of N for message cap
- Mobile keyboard viewport/resize handling
- Chip design for "New message" affordance
- Exact spacing, opacity, and sizing for empty state branding
- Loading animation specifics (duration, easing)
- Markdown renderer library selection

</decisions>

<specifics>
## Specific Ideas

- Chat bubble layout reference: Claude.ai — full-width AI responses, right-aligned user bubbles
- Loading indicator reference: Claude Code's "{verb}ing..." animated pattern
- Empty state: "SustenanceOS" in Instrument Serif + "Persistent Imperfection" in Roboto Mono, centred, medium weight
- Tagline: "Persistent Imperfection"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-chat-ui*
*Context gathered: 2026-02-22*
