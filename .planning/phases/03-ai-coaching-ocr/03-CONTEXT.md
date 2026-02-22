# Phase 3: AI Coaching + OCR - Context

**Gathered:** 2026-02-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Activate the Sustenance coaching persona: user uploads MacroFactor screenshots or exports, Claude Vision reads the data silently, and all coaching responses are BED-safe, trend-based, and tier-rated. Raw nutrition numbers never appear in the UI. Creating or browsing fire meals is Phase 4.

</domain>

<decisions>
## Implementation Decisions

### Screenshot upload flow
- Entry point: `+` button in the input bar, bottom-left, same row as the send button — matches the Claude.ai app pattern exactly
- Tapping `+` opens a modal: Camera / Photos / Files (three large tappable tiles, dark background, X to dismiss)
- **Files option is required** — users upload MacroFactor `.xls` exports alongside screenshots. This is a different data path from image OCR and the researcher should investigate both
- Preview treatment before sending: Claude's discretion to fit existing input bar design
- In the chat thread: uploaded image renders as a thumbnail in the user's message bubble (like iMessage)
- Sending behaviour: file alone is enough — selecting from the modal sends immediately without requiring a text message

### Coach voice
- Personality: warm and grounding — like a wise friend who gets it. Not clinical, not prescriptive. Calm, never alarmed.
- Pattern language: **relative framing** — "a bit more protein today than yesterday". Comparisons between days are allowed; absolute numbers are not.
- When asked for calorie counts directly: deflect and reframe — acknowledge the question, redirect to patterns. Never state the figure.
- Close most responses with a contextual question — open/curious, forward-focused, or reflective depending on what was just discussed.
- Be encouraging in both directions: celebrate a great day, stay supportive on a difficult one.

### BED guardrails — hard lines
The coach must NEVER:
- State or calculate calorie totals (even if asked directly)
- Label foods as good/bad, clean/dirty, or use moral framing
- Comment on body weight or body shape

### Gold/Silver/Bronze tier system
Five tiers, displayed as a subtle gradient pill/dot embedded in coaching responses:

| Tier | Colour | What it means |
|------|--------|---------------|
| **Gold Tier** | Gold gradient | Lower calorie density (10–25%+ below meal target) + high protein + under fat limit + close to optimal carbs + high food volume |
| **Silver Tier** | Silver gradient | Solid. Pretty damn good. |
| **Bronze Tier** | Bronze gradient | ~70% of ideal. Minimum viable. |
| **Showing Up** | Green gradient | Tracked but below MVP quality. Celebrate the habit — consistency is the win. |
| **Off Track** | Amber gradient | Didn't track. Gentle wake-up call. Not red. Not punishing. "Better to show up than be off track." |

**Calculation basis:**
- Calorie density: relative to a per-meal share of daily target (e.g., 1650 kcal/day ÷ 3 meals + 2 snacks)
- Gold: meal is 10–25%+ below its calorie target AND macro-optimal (high protein, under fat limit, close to optimal carbs)
- Exact thresholds: Claude's discretion
- Tier assignment only when OCR/screenshot or XLS data is available — not from text descriptions alone

**Daily arc coaching:**
- Coach references trajectory mid-day: "you had a Bronze breakfast → shoot for Silver at lunch to finish strong"
- End-of-day summary: per-meal tiers AND a day-level summary tier
- Philosophy: **"f*ck perfection"** — showing up matters most. Progress from Showing Up → Bronze → Silver → Gold over time.

### Contextual follow-up behaviour
Default: close most responses with a question contextual to what was just discussed.
- Has a coaching point → relevant follow-up about that point
- No coaching point → "anything else I can help with?" style close

Trigger patterns that prompt a coaching nudge:
- Missed meals detected in the log
- User mentions stress, tiredness, or mood in passing
- User mentions or logs a rateable meal
- Repeated below-Bronze / Off Track signals across the session

Emotional handling: Claude reads the context and picks the right blend of human warmth and coaching. Human acknowledgement first when needed.

### Claude's Discretion
- Preview treatment for attachment before sending (thumbnail in input bar vs. card above it)
- Exact calorie density and macro thresholds for Silver vs. Bronze boundary
- How to blend human warmth vs. coaching mode when user signals emotional difficulty
- Loading/thinking state while OCR processes

</decisions>

<specifics>
## Specific Ideas

- Upload modal visual reference: Claude.ai "Add to Chat" modal — Camera / Photos / Files, large dark tiles, X dismiss button. Input bar has `+` bottom-left, send button bottom-right.
- Tier visual: subtle gradient pill or dot *embedded in the response*, not a separate UI element. Appears inline when a meal is rated.
- Daily arc framing example: "Hey, you had a Bronze breakfast — let's shoot for Silver or Gold at lunch and dinner to finish the day strong."
- Off Track messaging example: "Looks like there's no breakfast logged — better to show up than be off track, even on a tough day. Remember: f*ck perfection."
- Showing Up affirmation: "You showed up. That's the important bit. Consistency compounds."
- Coach should read the MacroFactor XLS export natively — no separate parsing service, same as vision approach.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 03-ai-coaching-ocr*
*Context gathered: 2026-02-22*
