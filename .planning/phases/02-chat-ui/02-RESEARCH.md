# Phase 2: Chat UI - Research

**Researched:** 2026-02-22
**Domain:** Chat UI — vanilla JS, markdown rendering, scroll anchoring, auto-resize textarea, mobile keyboard
**Confidence:** HIGH (core patterns verified); MEDIUM (mobile keyboard handling)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Message bubble design:**
- AI-first layout: AI messages are full-width (no bubble), user messages are smaller right-aligned bubbles — like Claude.ai
- No avatar or identity marker on AI messages — layout alone distinguishes sender
- Timestamps on AI messages only (not user messages)
- Loading state: animated "Thinking..." style indicator modelled on Claude Code's verb+animation pattern (not typing dots, not streaming)

**Input field behavior:**
- Auto-expanding textarea: starts single-line, grows as user types, caps at ~4 lines then becomes scrollable
- Send on button tap only — Enter adds newline, no keyboard send trigger
- Mobile keyboard viewport handling: Claude's discretion (handle resize so input stays accessible)
- Send button stays active while AI is responding — user can queue additional messages; no disable/lock

**Empty / initial state:**
- Blank canvas — no welcome message, no suggested prompts
- Centre of the empty space shows "SustenanceOS" in Instrument Serif (medium weight, clearly readable but not bold) with tagline "Persistent Imperfection" in Roboto Mono beneath it
- Both elements fade/disappear once chat messages are present
- Opacity/sizing: medium weight — present, not dominant

**Scroll anchoring:**
- Auto-scroll to bottom only when user is already at the bottom (don't interrupt history reading)
- When scrolled up and new message arrives: a "New message" chip appears at the bottom — tappable to jump down
- No persistent scroll-to-bottom button outside of the chip
- Session holds last N messages with a "load more" control for older history (N = Claude's discretion)

**Tech stack (from STATE.md):**
- Vite + vanilla JS (no framework) — no React, no Vue
- App shell pattern: `createAppShell(root)` returns `{ header, main }` — chat view appends to `main`
- Fonts: Instrument Serif (Google Fonts), Roboto Mono (Google Fonts), Geist (self-hosted in public/fonts/geist/)
- CSS variable system already established in `src/styles/main.css`

### Claude's Discretion

- Exact value of N for message cap
- Mobile keyboard viewport/resize handling approach
- Chip design for "New message" affordance
- Exact spacing, opacity, and sizing for empty state branding
- Loading animation specifics (duration, easing)
- Markdown renderer library selection

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 2 builds a chat interface entirely in vanilla JS (no framework). The core technical challenges are: (1) markdown rendering with XSS safety, (2) auto-expanding textarea with a 4-line cap, (3) scroll anchoring with a "New message" chip, and (4) mobile keyboard viewport handling so the input stays accessible.

For markdown rendering, **marked** (v17.0.3) paired with **DOMPurify** (v3.3.1) is the correct choice — marked is fast, lightweight, and the dominant vanilla-JS-compatible markdown library. DOMPurify is mandatory alongside it since marked does not sanitize output. This is a two-package solution: `npm install marked dompurify`.

Auto-expanding textarea is a solved JS pattern: on `input` event, reset `height: auto` then set `height: scrollHeight`. Cap with `max-height` CSS (roughly `line-height * 4 + padding`). CSS `field-sizing: content` is a cleaner solution but only works in Chromium (not Safari) as of 2026 — use the JS scrollHeight pattern for cross-browser correctness. For mobile keyboard handling, use `100dvh` for full-height containers and add `interactive-widget=resizes-content` to the viewport meta (Chrome/Firefox only; Safari degrades gracefully). Scroll detection uses the standard `scrollHeight - scrollTop - clientHeight < threshold` formula.

**Primary recommendation:** Use `marked` + `DOMPurify`, JS-based textarea resize, `100dvh` layout with `interactive-widget=resizes-content` viewport hint, and IntersectionObserver-based scroll anchor detection.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| marked | 17.0.3 | Markdown → HTML parser | Dominant vanilla-JS markdown library; 10,900+ dependents; simple API; fast |
| dompurify | 3.3.1 | Sanitize marked output (XSS prevention) | Marked explicitly does NOT sanitize; DOMPurify is its recommended pairing |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| (none) | — | All other features (scroll, textarea, animation) | Pure CSS + vanilla JS; no library needed |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| marked + DOMPurify | markdown-it | markdown-it is more extensible (plugins) but heavier; marked is simpler for this use case |
| marked + DOMPurify | Showdown | Showdown is older, less maintained, fewer GH Flavored Markdown features |
| JS scrollHeight resize | `field-sizing: content` CSS | field-sizing is cleaner but Safari does not support it as of Feb 2026 — use JS |
| `100dvh` + meta tag | `VisualViewport` API + JS | dvh approach is simpler, no JS listener needed; VisualViewport is a fallback for old browsers |

**Installation:**
```bash
npm install marked dompurify
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── styles/
│   ├── main.css          # Existing — CSS vars, reset (DO NOT modify base vars)
│   └── chat.css          # New — all chat-specific styles
├── view/
│   ├── app-shell.js      # Existing — returns { header, main }
│   ├── chat-view.js      # New — createChatView(main) orchestrates the whole chat UI
│   ├── message-list.js   # New — DOM for thread, scroll logic, new-message chip
│   └── chat-input.js     # New — textarea, send button, auto-resize
├── store/
│   └── message-store.js  # New — in-memory message array, N-cap, load-more logic
└── main.js               # Existing — calls createChatView(main) instead of placeholder
```

### Pattern 1: Chat View Factory (matches existing app-shell pattern)

**What:** Follow the `createAppShell()` pattern — each view module exports a factory function that builds DOM imperatively and returns handles.
**When to use:** Always — this is the established pattern for the project.

```javascript
// src/view/chat-view.js
// Source: adapted from compound.os-main/src/view/app-shell.js pattern
export function createChatView(container) {
  container.innerHTML = '';

  // Empty state (fades out when messages exist)
  const emptyState = document.createElement('div');
  emptyState.className = 'chat-empty-state';
  // ... build imperatively

  // Message list + scroll area
  const thread = document.createElement('div');
  thread.className = 'chat-thread';

  // "New message" chip (hidden by default)
  const newMessageChip = document.createElement('button');
  newMessageChip.className = 'chat-new-msg-chip chat-new-msg-chip--hidden';
  newMessageChip.textContent = 'New message';

  // Input area
  const inputArea = document.createElement('div');
  inputArea.className = 'chat-input-area';

  container.appendChild(emptyState);
  container.appendChild(thread);
  container.appendChild(newMessageChip);
  container.appendChild(inputArea);

  return { thread, emptyState, newMessageChip, inputArea };
}
```

### Pattern 2: Markdown Rendering with XSS Safety

**What:** Always pipe marked output through DOMPurify before injecting into DOM. Never use `innerHTML` directly on raw markdown.
**When to use:** Every AI message render.

```javascript
// Source: marked docs (https://marked.js.org/) + DOMPurify docs
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function renderMarkdown(markdownText) {
  const rawHtml = marked.parse(markdownText);
  return DOMPurify.sanitize(rawHtml);
}

// Usage: set innerHTML only on sanitized output
function appendAIMessage(thread, markdownText) {
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble chat-bubble--ai';
  bubble.innerHTML = renderMarkdown(markdownText);
  thread.appendChild(bubble);
}
```

### Pattern 3: Auto-Expanding Textarea (scrollHeight method)

**What:** On `input` event, collapse height to `auto` then expand to `scrollHeight`. CSS provides `max-height` cap.
**When to use:** Always — this is the cross-browser solution (Safari does not support `field-sizing: content`).

```javascript
// Source: established web pattern, MDN scrollHeight docs
function setupAutoResize(textarea) {
  textarea.style.height = 'auto';
  textarea.style.overflow = 'hidden';

  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  });
}
```

```css
/* src/styles/chat.css */
.chat-textarea {
  rows: 1;
  resize: none;
  overflow-y: hidden;
  /* ~4 lines: line-height 1.5 * 1rem * 4 + top/bottom padding */
  max-height: calc(1.5rem * 4 + 1.5rem); /* adjust empirically */
  box-sizing: border-box;
}

/* When at max-height, overflow becomes scrollable */
.chat-textarea--at-max {
  overflow-y: auto;
}
```

**Note:** Add `overflow-y: auto` via JS when `scrollHeight >= maxHeight` to show scrollbar at cap.

### Pattern 4: Scroll Anchoring and "New Message" Chip

**What:** On every new message, check if user is at bottom (`scrollHeight - scrollTop - clientHeight < threshold`). If yes, scroll to bottom. If no, show the chip.

```javascript
// Source: MDN scrollHeight/scrollTop docs
const BOTTOM_THRESHOLD = 50; // px

function isAtBottom(thread) {
  return thread.scrollHeight - thread.scrollTop - thread.clientHeight < BOTTOM_THRESHOLD;
}

function onNewMessage(thread, chip) {
  if (isAtBottom(thread)) {
    scrollToBottom(thread);
  } else {
    chip.classList.remove('chat-new-msg-chip--hidden');
  }
}

function scrollToBottom(thread) {
  thread.scrollTo({ top: thread.scrollHeight, behavior: 'smooth' });
}

// Chip tap: scroll to bottom and hide chip
chip.addEventListener('click', () => {
  scrollToBottom(thread);
  chip.classList.add('chat-new-msg-chip--hidden');
});

// Hide chip when user manually scrolls to bottom
thread.addEventListener('scroll', () => {
  if (isAtBottom(thread)) {
    chip.classList.add('chat-new-msg-chip--hidden');
  }
});
```

### Pattern 5: Mobile Keyboard Viewport Handling

**What:** Use `100dvh` for the chat container height (not `100vh`). Add `interactive-widget=resizes-content` to the viewport meta. No JS listener needed.
**When to use:** Always for any mobile-first chat layout.

```html
<!-- index.html — update existing viewport meta -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
```

```css
/* src/styles/chat.css */
.chat-view {
  height: 100dvh;           /* shrinks when keyboard opens */
  display: flex;
  flex-direction: column;
}

.chat-thread {
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain; /* prevent scroll chaining to body */
}

.chat-input-area {
  flex-shrink: 0;            /* never compressed by flex */
  padding-bottom: env(safe-area-inset-bottom); /* iPhone home bar */
}
```

**Behaviour:** `dvh` units respond to keyboard. On iOS Safari (no `interactive-widget` support), the layout still works because Safari scrolls the viewport to keep the focused input visible — `dvh` prevents the container from growing behind the keyboard.

### Pattern 6: Loading State ("Thinking..." Indicator)

**What:** A CSS keyframe animation on an element with text. Modelled on Claude Code's verb+animation — text changes + pulsing opacity.
**When to use:** After user message sent, before AI response arrives.

```css
/* src/styles/chat.css */
@keyframes thinking-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.chat-thinking {
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.875rem;
  animation: thinking-pulse 1.2s ease-in-out infinite;
}
```

```javascript
function showThinkingIndicator(thread) {
  const el = document.createElement('div');
  el.className = 'chat-bubble chat-bubble--ai chat-thinking';
  el.textContent = 'Thinking...';
  el.dataset.role = 'thinking';
  thread.appendChild(el);
  scrollToBottom(thread);
  return el;
}

function removeThinkingIndicator(thread) {
  const el = thread.querySelector('[data-role="thinking"]');
  if (el) el.remove();
}
```

### Pattern 7: In-Memory Message Store with Cap

**What:** Array-based store. Cap at N messages visible; older messages loadable on demand.
**Recommended N:** 50 messages visible by default (enough for a session; low enough to stay performant).

```javascript
// src/store/message-store.js
const MAX_VISIBLE = 50;

export function createMessageStore() {
  const messages = [];  // full history

  return {
    add(role, content) {
      messages.push({ role, content, timestamp: Date.now() });
    },
    getVisible() {
      return messages.slice(-MAX_VISIBLE);
    },
    getOlder(beforeIndex) {
      const start = Math.max(0, messages.length - MAX_VISIBLE - beforeIndex);
      return messages.slice(start, messages.length - MAX_VISIBLE);
    },
    hasOlderMessages() {
      return messages.length > MAX_VISIBLE;
    },
    count: () => messages.length,
  };
}
```

### Pattern 8: Empty State Fade-Out

**What:** CSS transition on opacity. Toggle a class when first message appears.

```css
/* src/styles/chat.css */
.chat-empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  opacity: 1;
  transition: opacity 0.4s ease;
}

.chat-empty-state--hidden {
  opacity: 0;
}

.chat-empty-state__title {
  font-family: 'Instrument Serif', serif;
  font-weight: 500;
  font-size: 1.75rem;
  color: var(--text-secondary);
  letter-spacing: -0.02em;
}

.chat-empty-state__tagline {
  font-family: 'Roboto Mono', monospace;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
}
```

```javascript
// When first message is added:
emptyState.classList.add('chat-empty-state--hidden');
```

### Anti-Patterns to Avoid

- **`innerHTML` on unsanitized content:** All markdown output MUST go through `DOMPurify.sanitize()` before setting `innerHTML`. Never skip this step — AI responses can contain user-controlled content.
- **Disabling send button during AI response:** Locked decision — send button stays active for message queueing.
- **Using `100vh` instead of `100dvh`:** `100vh` is the large viewport height (ignores keyboard); `100dvh` is the dynamic viewport height (shrinks with keyboard). Use `dvh`.
- **`scrollTop = scrollHeight` without smooth:** Jarring on mobile. Use `scrollTo({ behavior: 'smooth' })`.
- **`textarea rows` attribute for sizing:** Does not interact with scrollHeight resize correctly. Set single-line height via CSS `min-height` instead.
- **Appending markdown to `textContent`:** Renders literal HTML tags. Always use `innerHTML` with sanitized output.
- **`overflow: hidden` on the `<body>` for mobile:** Breaks scroll on iOS. Use `overflow-y: auto` with `overscroll-behavior: contain` on the thread container instead.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown parsing | Custom regex-based parser | `marked` | Markdown has many edge cases (nested lists, code blocks, escaped chars, GFM tables). `marked` handles all CommonMark + GFM. |
| XSS sanitization | Regex-based HTML strip | `DOMPurify` | Regex HTML sanitization is famously broken — always misses attack vectors. DOMPurify uses a proper DOM parser. |

**Key insight:** Markdown + XSS is a two-library problem, not a one-library problem. `marked` parses, `DOMPurify` sanitizes — they do not overlap and both are required.

---

## Common Pitfalls

### Pitfall 1: Skipping DOMPurify (XSS)

**What goes wrong:** AI responses (even stubbed static ones) rendered via `innerHTML` can contain malicious script tags.
**Why it happens:** Marked's README is explicit: it does not sanitize output. Developers forget this step.
**How to avoid:** Always use `bubble.innerHTML = DOMPurify.sanitize(marked.parse(text))`. Never `marked.parse()` without `DOMPurify.sanitize()`.
**Warning signs:** Any `innerHTML =` assignment that doesn't pipe through DOMPurify first.

### Pitfall 2: Textarea Height Flicker on Input

**What goes wrong:** Textarea jumps height on each keypress.
**Why it happens:** Setting `height: scrollHeight` without first resetting to `height: auto` means deleted content doesn't shrink the textarea.
**How to avoid:** Always reset `height: auto` BEFORE reading `scrollHeight`. Order matters: `el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'`.
**Warning signs:** Textarea only grows, never shrinks when user deletes text.

### Pitfall 3: `box-sizing` Missing on Textarea

**What goes wrong:** Textarea grows infinitely on every input event, even with no content change.
**Why it happens:** Without `box-sizing: border-box`, the padding is added on top of the height set via JS, causing scrollHeight to increase each time.
**How to avoid:** Ensure `box-sizing: border-box` is set on the textarea (it should already be in the global reset in `main.css`, but verify).
**Warning signs:** Textarea keeps growing on every keypress without stopping.

### Pitfall 4: `100vh` on Mobile Kills Keyboard Accessibility

**What goes wrong:** Chat input disappears behind the keyboard on iOS.
**Why it happens:** `100vh` equals the large viewport on iOS — it doesn't shrink when the keyboard opens.
**How to avoid:** Use `100dvh` for the chat container. `dvh` units adjust to the visual viewport dynamically.
**Warning signs:** Input is inaccessible when keyboard opens on iPhone; user must scroll to see it.

### Pitfall 5: Scroll Anchoring Interrupts History Reading

**What goes wrong:** Auto-scroll fires when user is browsing older messages, jumping them back to bottom on every new message.
**Why it happens:** Naively calling `scrollTo(bottom)` on every new message without checking current scroll position.
**How to avoid:** Check `isAtBottom()` before auto-scrolling. If not at bottom, show chip instead.
**Warning signs:** User cannot read history without being interrupted by new messages.

### Pitfall 6: Chip Stays Visible After User Scrolls Down Manually

**What goes wrong:** "New message" chip stays visible after user scrolls to bottom manually.
**Why it happens:** Chip visibility only toggled when new messages arrive, not when user scrolls.
**How to avoid:** Add a `scroll` event listener on the thread — when `isAtBottom()` returns true, hide the chip.
**Warning signs:** Chip stuck visible even when user is at the bottom.

### Pitfall 7: Instrument Serif Not Loading for Empty State

**What goes wrong:** Empty state title appears in fallback font.
**Why it happens:** Instrument Serif is loaded via Google Fonts CDN (`<link>` in `index.html`). It is already present from Phase 1 — but if the `<link>` tag was removed or the font name is wrong in CSS, fallback applies.
**How to avoid:** Verify `font-family: 'Instrument Serif', serif` exactly matches the Google Fonts URL string. Check the `<link>` in `index.html` includes `Instrument+Serif`.
**Warning signs:** Title appears in serif fallback (Times New Roman, Georgia) instead of Instrument Serif.

### Pitfall 8: Markdown Code Blocks Without Styling

**What goes wrong:** `marked` outputs `<pre><code>` blocks that look unstyled — same dark background as message area.
**Why it happens:** Marked does the parsing; code highlighting requires separate CSS.
**How to avoid:** Add explicit CSS for `pre` and `code` inside `.chat-bubble--ai` that gives them a distinct background. No syntax highlighting library needed for this phase.
**Warning signs:** Code in AI responses is visually indistinguishable from surrounding text.

---

## Code Examples

### Complete Markdown Render with Safety

```javascript
// Source: marked docs (https://marked.js.org/) + DOMPurify README
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked once at module level
marked.setOptions({
  breaks: true,      // GitHub Flavored: line breaks become <br>
  gfm: true,         // GitHub Flavored Markdown (tables, task lists)
});

export function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text));
}
```

### Auto-Resize Textarea (Cross-Browser)

```javascript
// Source: MDN Element.scrollHeight documentation
export function setupAutoResize(textarea) {
  const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
  const padding = parseFloat(getComputedStyle(textarea).paddingTop)
                + parseFloat(getComputedStyle(textarea).paddingBottom);
  const maxHeight = (lineHeight * 4) + padding;

  function resize() {
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + 'px';
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }

  textarea.addEventListener('input', resize);
  resize(); // initial sizing
}
```

### Scroll-Bottom Detection

```javascript
// Source: MDN Element.scrollHeight + Element.scrollTop
const BOTTOM_THRESHOLD = 50;

export function isAtBottom(el) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < BOTTOM_THRESHOLD;
}

export function scrollToBottom(el, smooth = true) {
  el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
}
```

### Message Store (50-message cap)

```javascript
// src/store/message-store.js
const MAX_VISIBLE = 50;

export function createMessageStore() {
  const all = [];

  return {
    push(role, content) {
      all.push({ id: all.length, role, content, ts: Date.now() });
    },
    getVisible() {
      return all.slice(-MAX_VISIBLE);
    },
    canLoadMore() {
      return all.length > MAX_VISIBLE;
    },
    loadMore(currentlyLoaded) {
      const start = Math.max(0, all.length - MAX_VISIBLE - currentlyLoaded);
      return all.slice(start, all.length - MAX_VISIBLE - (currentlyLoaded - MAX_VISIBLE));
    },
    total: () => all.length,
  };
}
```

### Viewport Meta for Keyboard Handling

```html
<!-- index.html — update existing viewport meta tag -->
<!-- Source: https://www.htmhell.dev/adventcalendar/2024/4/ -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, interactive-widget=resizes-content" />
```

### CSS Layout for Mobile Chat

```css
/* src/styles/chat.css */
/* Source: https://www.franciscomoretti.com/blog/fix-mobile-keyboard-overlap-with-visualviewport */

.chat-view {
  height: 100dvh;           /* dynamic viewport — shrinks when keyboard appears */
  display: flex;
  flex-direction: column;
  position: relative;       /* anchor for absolute empty state */
  overflow: hidden;
}

.chat-thread {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;  /* smooth momentum scroll on iOS */
  padding: 1rem;
}

.chat-input-area {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
  border-top: 1px solid var(--border);
  background: var(--bg);
}
```

### Loading Indicator

```javascript
// Modelled on Claude Code's "{verb}ing..." pattern
export function showThinking(thread) {
  const el = document.createElement('div');
  el.className = 'chat-bubble chat-bubble--ai chat-thinking';
  el.textContent = 'Thinking...';
  el.setAttribute('aria-label', 'AI is thinking');
  el.dataset.thinking = 'true';
  thread.appendChild(el);
  return el;
}
```

```css
@keyframes thinking-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.35; }
}

.chat-thinking {
  color: var(--text-secondary);
  animation: thinking-pulse 1.4s ease-in-out infinite;
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `marked` with built-in sanitizer | `marked` + external `DOMPurify` | marked v1 (sanitizer removed ~2020) | Always pair marked with DOMPurify |
| `100vh` for full-screen mobile | `100dvh` (dynamic viewport height) | Chrome 108, Safari 15.4 (2022) | Use `dvh`; `vh` breaks with keyboard |
| `resize: both` textarea | JS scrollHeight resize | Stable pattern | No library needed; resize: both is ugly |
| `field-sizing: content` CSS | JS scrollHeight (fallback) | Chrome 123 (2024), Safari: not yet | Use JS for cross-browser correctness in 2026 |
| Fixed-position input bar | Flex column + `dvh` | 2022 | `position: fixed` breaks with iOS keyboard; flex is reliable |

**Deprecated/outdated:**
- `marked`'s own `sanitize: true` option: removed. Do not attempt to pass it. Use DOMPurify instead.
- `100vh` for mobile full-screen layouts: broken on iOS when keyboard is open. Use `100dvh`.
- `position: fixed` for chat input bar on iOS: iOS Safari converts fixed to absolute when keyboard opens — use flex column layout instead.

---

## Open Questions

1. **Load More UX pattern**
   - What we know: User decided "session holds last N messages with load more control". N=50 is the recommendation.
   - What's unclear: Scroll position after loading more (should the view stay at the same message, not jump to top). This requires capturing `scrollHeight` before inserting older messages and restoring it after.
   - Recommendation: Save `const prevScrollHeight = thread.scrollHeight` before prepending older messages. After prepend: `thread.scrollTop = thread.scrollHeight - prevScrollHeight`.

2. **Instrument Serif font-weight for empty state title**
   - What we know: Instrument Serif is a display serif loaded via Google Fonts. The CONTEXT.md says "medium weight."
   - What's unclear: Instrument Serif only ships in weight 400 on Google Fonts (no 500 available). "Medium weight" in the design intent may mean font-weight: 400 at a larger size, not font-weight: 500.
   - Recommendation: Use `font-weight: 400` (only available weight). Achieve "present but not dominant" through size (~1.75rem) and color (`var(--text-secondary)` #888888).

3. **Chat view layout: replace placeholder vs. append to main**
   - What we know: `createAppShell(root)` returns `{ header, main }`. Currently `main` contains the placeholder `div`. Chat view needs to replace it.
   - Recommendation: `main.innerHTML = ''` then mount the chat view into `main`. The chat view itself uses `100dvh` but must account for the header height. Use `height: calc(100dvh - header-height)` or adjust flex layout at the app level.

---

## Sources

### Primary (HIGH confidence)

- `compound.os-main/src/view/toast.js` — factory function pattern with requestAnimationFrame and CSS class transitions (directly applicable)
- `compound.os-main/src/styles/main.css` — existing CSS variables confirmed; chat styles must use these tokens
- `src/styles/main.css` — existing Sustenance OS CSS; `box-sizing: border-box` already applied globally
- https://github.com/markedjs/marked — v17.0.3 confirmed (Feb 17, 2026); XSS sanitization requirement confirmed
- https://marked.js.org/ — API confirmed: `marked.parse()`, `marked.use({ hooks: { postprocess } })`, `marked.setOptions({ gfm, breaks })`
- https://www.htmhell.dev/adventcalendar/2024/4/ — `interactive-widget=resizes-content` values and browser support confirmed
- MDN Element.scrollHeight — `scrollHeight - scrollTop - clientHeight` formula verified

### Secondary (MEDIUM confidence)

- DOMPurify v3.3.1 (npm) — version confirmed from WebSearch; pairing with marked confirmed from marked docs discussion
- https://www.franciscomoretti.com/blog/fix-mobile-keyboard-overlap-with-visualviewport — `dvh` approach verified as current best practice (2024 article)
- CSS `field-sizing: content` browser support — Chrome-only as of Feb 2026 confirmed across multiple sources (MDN, caniuse.com results, CSS-Tricks)

### Tertiary (LOW confidence)

- scrollHeight textarea resize implementation — pattern appears in multiple tutorials; reliable in principle but specific `box-sizing` caveat verified from multiple sources
- N=50 for message cap — judgement call based on typical chat session length; no authoritative source

---

## Metadata

**Confidence breakdown:**
- Standard stack (marked + DOMPurify): HIGH — library versions confirmed from GitHub/npm, API verified from official docs
- Architecture patterns: HIGH — directly derived from existing Compound OS code patterns
- Scroll anchoring logic: HIGH — formula verified from MDN, pattern is standard
- Textarea auto-resize: HIGH — well-established JS pattern, box-sizing gotcha cross-verified
- Mobile keyboard handling (dvh + interactive-widget): MEDIUM — `dvh` is broadly supported; `interactive-widget` Safari support unconfirmed (WebKit bug open)
- Message cap (N=50): LOW — judgement call, no authoritative source

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (marked releases frequently but v17 API is stable; browser `field-sizing` support may improve within 30 days)
