# Phase 3: AI Coaching + OCR - Research

**Researched:** 2026-02-22
**Domain:** Claude Vision API, XLSX parsing, file upload UI, coaching persona system prompt
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Screenshot upload flow
- Entry point: `+` button in the input bar, bottom-left, same row as the send button — matches the Claude.ai app pattern exactly
- Tapping `+` opens a modal: Camera / Photos / Files (three large tappable tiles, dark background, X to dismiss)
- **Files option is required** — users upload MacroFactor `.xls` exports alongside screenshots. This is a different data path from image OCR and the researcher should investigate both
- Preview treatment before sending: Claude's discretion to fit existing input bar design
- In the chat thread: uploaded image renders as a thumbnail in the user's message bubble (like iMessage)
- Sending behaviour: file alone is enough — selecting from the modal sends immediately without requiring a text message
- When a file-only message is sent, Claude should auto-generate a default prompt (e.g., "Analyse this")

#### Coach voice
- Personality: warm and grounding — like a wise friend who gets it. Not clinical, not prescriptive. Calm, never alarmed.
- Pattern language: **relative framing** — "a bit more protein today than yesterday". Comparisons between days are allowed; absolute numbers are not.
- When asked for calorie counts directly: deflect and reframe — acknowledge the question, redirect to patterns. Never state the figure.
- Close most responses with a contextual question — open/curious, forward-focused, or reflective depending on what was just discussed.
- Be encouraging in both directions: celebrate a great day, stay supportive on a difficult one.

#### BED guardrails — hard lines
The coach must NEVER:
- State or calculate calorie totals (even if asked directly)
- Label foods as good/bad, clean/dirty, or use moral framing
- Comment on body weight or body shape

#### Gold/Silver/Bronze tier system
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

#### Contextual follow-up behaviour
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

## Summary

Phase 3 has four implementation domains: (1) the file upload UI — a `+` button triggering a three-option modal, (2) Claude Vision OCR — sending images as base64 to Claude Haiku 4.5, (3) XLSX parsing — using SheetJS to parse MacroFactor exports into structured data in the browser, and (4) the Sustenance persona — a system prompt with BED guardrails, tier logic, and coaching voice injected into every message call.

The current model family is Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), not the old claude-3-haiku — **critical difference** as the old model is deprecated April 2026 and the new one is significantly more capable. Calling Claude directly from the browser is supported via the `anthropic-dangerous-direct-browser-access: true` header, which enables CORS. For a personal app where the user supplies their own API key stored in localStorage, this is the correct and standard pattern.

The MacroFactor XLSX export has two sheets: "Quick Export" (daily summary: Calories, Protein, Fat, Carbs, Targets) and "Food Log" (per-item rows: Date, Time, Food Name, Calories, Protein, Fat, Carbs + 50+ micronutrients). The coaching tier logic needs: Calories (kcal), Protein (g), Fat (g), Carbs (g), and the Target columns from the Quick Export sheet. SheetJS 0.20.3 (`xlsx` npm package, installed from SheetJS CDN tarball) reads XLSX from an ArrayBuffer in the browser with no server required.

**Primary recommendation:** Wire the `+` modal to `<input type="file" accept="image/*,.xlsx">` elements — one for camera/photos (images), one for files (`.xlsx`). Read images as DataURL for base64, read XLSX via SheetJS ArrayBuffer. Send to Claude Haiku 4.5 with the persona system prompt. Store parsed data in session context only — never render raw numbers in the UI.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Claude Haiku 4.5 | `claude-haiku-4-5-20251001` | Vision OCR + coaching responses | Fastest model, cheapest ($1/MTok in, $5/MTok out), replaces stub from Phase 2 |
| `xlsx` (SheetJS) | 0.20.3 | Parse MacroFactor XLSX in browser | Only viable browser-native XLSX parser; no server needed |
| Native `fetch` | Browser built-in | Call Anthropic API from browser | CORS-enabled via `anthropic-dangerous-direct-browser-access` header |
| Native File API | Browser built-in | Read uploaded files | `FileReader.readAsDataURL` for images, `FileReader.readAsArrayBuffer` for XLSX |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `marked` + `DOMPurify` | Already installed | Render coaching markdown | Already in project from Phase 2 — no new deps |
| Native `<input type="file">` | Browser built-in | Trigger OS file picker | Hidden input, triggered by modal tile click |
| `localStorage` | Browser built-in | Store user API key | Personal app pattern; user provides own key |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `xlsx` (SheetJS) | `read-excel-file` npm | read-excel-file is simpler API but less capable; SheetJS is the standard and handles both sheets properly |
| Direct browser fetch | Server-side proxy | Proxy adds infrastructure complexity; browser fetch with dangerous header is Anthropic's documented pattern for personal apps |
| `claude-haiku-4-5-20251001` | `claude-3-5-haiku-latest` | claude-3-5-haiku is older generation; Haiku 4.5 is the current fastest model at same cost tier |

**Installation:**
```bash
npm install --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
```

Note: SheetJS is not distributed on the standard npm registry — it must be installed from the SheetJS CDN tarball URL. This is an intentional upstream decision.

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── chat/
│   ├── chat-view.js         # MODIFIED: add + button, file handling, OCR flow
│   ├── chat-view.css        # MODIFIED: modal styles, thumbnail styles, tier pill styles
│   ├── message-store.js     # MODIFIED: add attachment field to messages
│   ├── message-renderer.js  # MODIFIED: render image thumbnails in user bubbles
│   ├── scroll-anchor.js     # unchanged
│   ├── upload-modal.js      # NEW: + modal with Camera/Photos/Files tiles
│   ├── upload-modal.css     # NEW: modal overlay styles (co-located with JS)
│   ├── claude-api.js        # NEW: Anthropic API client (replaces getStubResponse)
│   ├── sustenance-persona.js # NEW: system prompt, tier logic, BED guardrails
│   └── session-context.js   # NEW: holds parsed OCR/XLSX data for session (never renders raw)
└── styles/
    └── main.css             # unchanged
```

### Pattern 1: API Key Storage — localStorage + prompt-on-first-use

**What:** User enters their own Anthropic API key once; it's stored in localStorage and used for all API calls. No server, no env vars exposed to the browser bundle.

**When to use:** Personal apps where a single known user provides their own API key. Matches the documented Anthropic pattern for CORS-enabled browser apps.

**Example:**
```javascript
// Source: Anthropic CORS documentation + Simon Willison's reference implementation
// src/chat/claude-api.js

const API_KEY_STORAGE_KEY = 'sustenance_anthropic_key';

export function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function setApiKey(key) {
  localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

export function hasApiKey() {
  return Boolean(getApiKey());
}
```

### Pattern 2: Claude Haiku API Call (text + optional image)

**What:** Replace `getStubResponse` with a real fetch to the Anthropic messages endpoint.

**When to use:** Every user message. Include image content block only when an image was attached.

**Example:**
```javascript
// Source: https://platform.claude.com/docs/en/build-with-claude/vision
// src/chat/claude-api.js

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';

export async function sendMessage({ systemPrompt, messages }) {
  const apiKey = getApiKey();

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',  // REQUIRED for browser CORS
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,  // array of { role, content } — content can be string or array of blocks
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
```

### Pattern 3: Image as base64 in message content

**What:** Convert image File object to base64 DataURL, strip the prefix, send as image content block.

**When to use:** User attaches a screenshot (JPEG/PNG/WebP/GIF) via camera or photos.

**Example:**
```javascript
// Source: https://platform.claude.com/docs/en/build-with-claude/vision
// Converts File → base64 string (no data URL prefix)

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // result is "data:image/jpeg;base64,XXXXX..."
      // Strip the prefix to get raw base64
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Build a user message with image
async function buildUserMessageWithImage(text, imageFile) {
  const base64 = await fileToBase64(imageFile);
  const mediaType = imageFile.type; // e.g. "image/jpeg"

  return {
    role: 'user',
    content: [
      {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64,
        },
      },
      {
        type: 'text',
        text: text || 'Analyse this.',  // default prompt for file-only sends
      },
    ],
  };
}
```

### Pattern 4: XLSX parsing with SheetJS

**What:** Read MacroFactor XLSX export in browser, extract Quick Export sheet (daily totals + targets) and Food Log sheet (per-meal items).

**When to use:** User attaches a `.xlsx` file via the Files option in the upload modal.

**MacroFactor XLSX structure (verified from actual export files):**
- Sheet 1: "Quick Export" — columns: Date, Expenditure, Trend Weight (lbs), Weight (lbs), Calories (kcal), Protein (g), Fat (g), Carbs (g), **Target Calories (kcal), Target Protein (g), Target Fat (g), Target Carbs (g)**, Steps, ...
- Sheet 2: "Food Log" — columns: Date, Time, Food Name, Serving Size, Serving Qty, Serving Weight (g), Calories (kcal), Fat (g), Carbs (g), Protein (g), ...

**Example:**
```javascript
// Source: https://docs.sheetjs.com (SheetJS official docs)
// src/chat/session-context.js

import { read, utils } from 'xlsx';

export function parseXlsxFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const workbook = read(e.target.result);

        // Quick Export sheet — daily summaries
        const quickSheet = workbook.Sheets['Quick Export'];
        const dailyRows = utils.sheet_to_json(quickSheet);
        // Each row: { Date, 'Calories (kcal)': 1800, 'Target Calories (kcal)': 1650, ... }

        // Food Log sheet — per-item entries
        const foodSheet = workbook.Sheets['Food Log'];
        const foodRows = utils.sheet_to_json(foodSheet);
        // Each row: { Date, Time, 'Food Name', 'Calories (kcal)': 208, 'Protein (g)': 10, ... }

        resolve({ dailyRows, foodRows });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Converts parsed XLSX data to a coaching-safe text summary for the system context
// NEVER includes raw numbers in the user-visible chat — only in the hidden system context
export function xlsxToCoachingContext(dailyRows, foodRows) {
  // Format as structured text Claude can read
  // This goes into the system prompt or as a hidden user turn, not rendered in UI
  return `
MACROFACTOR DATA (INTERNAL — DO NOT DISPLAY RAW NUMBERS TO USER):
${JSON.stringify({ dailyRows: dailyRows.slice(-7), foodRows: foodRows.slice(-50) })}
`.trim();
}
```

### Pattern 5: Session context — hide raw numbers from UI

**What:** Parsed OCR/XLSX data is stored in a session-level object and injected into the system prompt or as context. It is never rendered in the chat thread.

**When to use:** Every Claude API call after data is loaded. The session context accumulates across the conversation.

**Example:**
```javascript
// src/chat/session-context.js

let _sessionContext = {
  ocrData: null,     // extracted from screenshot via Claude Vision
  xlsxData: null,    // parsed from .xlsx file
};

export function setOcrData(data) { _sessionContext.ocrData = data; }
export function setXlsxData(data) { _sessionContext.xlsxData = data; }

export function getContextBlock() {
  // Returns hidden context to inject — never rendered in UI
  if (!_sessionContext.ocrData && !_sessionContext.xlsxData) return '';
  return `
[COACH CONTEXT — NOT FOR DISPLAY]
${_sessionContext.ocrData ? `OCR Data: ${_sessionContext.ocrData}` : ''}
${_sessionContext.xlsxData ? `XLSX Data: ${JSON.stringify(_sessionContext.xlsxData)}` : ''}
`.trim();
}
```

### Pattern 6: Upload modal — three tiles

**What:** Full-screen overlay with three large tappable tiles (Camera, Photos, Files). Each tile triggers a hidden `<input type="file">` with different `accept` and `capture` attributes.

**Example:**
```javascript
// src/chat/upload-modal.js

export function createUploadModal({ onImage, onFile }) {
  const overlay = document.createElement('div');
  overlay.className = 'upload-modal-overlay';

  // Hidden file inputs
  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*';
  cameraInput.capture = 'environment';  // rear camera on mobile
  cameraInput.style.display = 'none';

  const photosInput = document.createElement('input');
  photosInput.type = 'file';
  photosInput.accept = 'image/*';
  photosInput.style.display = 'none';

  const filesInput = document.createElement('input');
  filesInput.type = 'file';
  filesInput.accept = '.xlsx,.xls';
  filesInput.style.display = 'none';

  // Wire change events
  cameraInput.addEventListener('change', () => {
    if (cameraInput.files[0]) onImage(cameraInput.files[0]);
    close();
  });
  photosInput.addEventListener('change', () => {
    if (photosInput.files[0]) onImage(photosInput.files[0]);
    close();
  });
  filesInput.addEventListener('change', () => {
    if (filesInput.files[0]) onFile(filesInput.files[0]);
    close();
  });

  // ... build tile UI, X dismiss button, etc.

  function close() { overlay.remove(); }

  return { overlay, open: () => document.body.appendChild(overlay), close };
}
```

### Anti-Patterns to Avoid

- **Rendering raw numbers in the UI:** OCR/XLSX data must stay in session context / system prompt only. Never `textContent` or `innerHTML` a calorie count anywhere in the chat thread.
- **Sending full conversation history with images:** Images in every message balloon the request payload and cost. Only send the image in the message where it was originally attached; subsequent messages use text context only.
- **Using `claude-3-haiku-20240307`:** This model is deprecated and retires April 2026. Use `claude-haiku-4-5-20251001`.
- **Embedding API key in Vite env variable:** `VITE_` prefix exposes keys to the JS bundle. Use localStorage with user-provided key instead.
- **Calling the API without `anthropic-dangerous-direct-browser-access: true`:** The API will return a CORS error.
- **Parsing XLSX without SheetJS:** XLSX files are ZIP archives with XML internals. Rolling a custom parser is impractical; use SheetJS.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| XLSX parsing | Custom ZIP + XML parser | SheetJS `xlsx` 0.20.3 | XLSX is a ZIP of XML; handling shared string tables, type coercion, date serial numbers from scratch has dozens of edge cases |
| Image-to-base64 | Manual binary string manipulation | `FileReader.readAsDataURL` + split | Browser API handles all MIME type detection and encoding correctly |
| API key storage | Custom encrypted storage | `localStorage` | Standard pattern for personal apps; no server overhead |
| Markdown rendering | Custom markdown parser | `marked` + `DOMPurify` (already installed) | Already in project from Phase 2 — tier pill HTML can be injected safely via DOMPurify whitelist |
| OCR / data extraction from screenshots | Tesseract or custom CV | Claude Vision (Haiku 4.5) | Claude reads MacroFactor UI screenshots natively; no additional service |

**Key insight:** The entire "AI reads the screenshot" feature is a single API call with a base64 image in the content blocks. No OCR infrastructure, no separate pipeline. Claude Vision does it all.

---

## Common Pitfalls

### Pitfall 1: Raw numbers leaking to UI

**What goes wrong:** A developer renders `message.content` which contains the raw OCR extraction text (e.g., "Calories: 1847 kcal") in the chat thread.
**Why it happens:** The OCR extraction step returns text; if that text is stored as a message and rendered, numbers appear.
**How to avoid:** Two-step pipeline: (a) send image to Claude with an OCR-extraction system prompt, store result in session context — NOT as a chat message; (b) send a second call (or use the context in the main persona call) to generate the coaching response. The coaching response is the only thing rendered.
**Warning signs:** Any numeric digit appearing in the assistant message bubble.

### Pitfall 2: Wrong Haiku model ID

**What goes wrong:** Using `claude-3-haiku-20240307` (the old model). It's deprecated and retires April 19, 2026. It also has a 4K max output limit vs 64K for Haiku 4.5.
**Why it happens:** Stale docs or training data references the old model.
**How to avoid:** Use `claude-haiku-4-5-20251001` (or alias `claude-haiku-4-5`). Confirmed from official Anthropic models page (2026-02-22).
**Warning signs:** Responses truncate early; deprecation warning in API response headers.

### Pitfall 3: Image sent in every subsequent message

**What goes wrong:** The full conversation history is sent with the image content block included in every user message, inflating token cost by ~1300 tokens per turn.
**Why it happens:** The message history array includes the original user message with the image block, and the whole array is sent on each turn.
**How to avoid:** After the first call where the image is used for OCR extraction, replace the image content block with a text placeholder in the history (e.g., `"[Image analysed — data stored in session context]"`). Pass the extracted data as session context, not as the original image.
**Warning signs:** API cost per message growing linearly with conversation length.

### Pitfall 4: CORS error from missing header

**What goes wrong:** `fetch` to `api.anthropic.com` is blocked by CORS.
**Why it happens:** Anthropic only enables CORS for requests that explicitly include `anthropic-dangerous-direct-browser-access: true`.
**How to avoid:** Always include this header in every browser fetch to the API.
**Warning signs:** Browser console shows "CORS policy" error on the preflight OPTIONS request.

### Pitfall 5: SheetJS npm install from wrong registry

**What goes wrong:** `npm install xlsx` installs an outdated/abandoned version from the public npm registry (last updated 2023).
**Why it happens:** SheetJS moved off npm registry after a licensing dispute.
**How to avoid:** Install from the SheetJS CDN tarball: `npm install --save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`
**Warning signs:** Version in `package.json` is `0.18.x` or lower; many features missing.

### Pitfall 6: MacroFactor sheet name typo

**What goes wrong:** `workbook.Sheets['QuickExport']` returns undefined because the actual sheet name is `'Quick Export'` (with a space).
**Why it happens:** Developer assumes a camelCase or hyphenated sheet name.
**How to avoid:** Use the exact names `'Quick Export'` and `'Food Log'` — verified from inspecting the actual export files in this repository.
**Warning signs:** `sheet_to_json` returns empty array; no console error.

### Pitfall 7: Tier pill HTML in markdown

**What goes wrong:** The AI response includes raw HTML for the tier pill, but `marked` escapes it, so `<span class="tier-pill">Gold</span>` renders as literal text.
**Why it happens:** `marked` escapes HTML by default in recent versions.
**How to avoid:** Post-process the AI response to inject the tier pill DOM element after rendering — detect a tier signal in the text (e.g., a marker token like `[TIER:GOLD]`) and replace it with the pill element. Alternatively, configure `marked` to allow a specific whitelist via `DOMPurify`.
**Warning signs:** Tier pill appears as raw text in the bubble.

### Pitfall 8: `capture="environment"` breaks desktop file picker

**What goes wrong:** On desktop browsers, `<input capture="environment">` either fails silently or opens the wrong thing.
**Why it happens:** `capture` is a mobile-only attribute. Desktop Chrome ignores it but some desktop browsers handle it unexpectedly.
**How to avoid:** Only the Camera tile uses `capture="environment"`. The Photos tile uses `accept="image/*"` without `capture`. Both work on desktop (Photos opens standard file picker). This is the intended distinction — Camera = live capture on mobile, Photos = library/file on all devices.
**Warning signs:** Desktop users can't select images; error in Safari desktop.

---

## Code Examples

### OCR extraction call (two-step pipeline)

```javascript
// Source: Anthropic Messages API docs + Vision docs
// Step 1: Extract data from screenshot via vision (result NEVER rendered in UI)

async function extractDataFromScreenshot(imageFile) {
  const base64 = await fileToBase64(imageFile);
  const mediaType = imageFile.type;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: `You are a data extraction assistant. Extract nutrition data from this MacroFactor screenshot.
Return ONLY a JSON object with these fields (use null for any not visible):
{
  "date": "YYYY-MM-DD",
  "meals": [{"name": "Breakfast", "calories": number, "protein": number, "fat": number, "carbs": number}],
  "dailyTotal": {"calories": number, "protein": number, "fat": number, "carbs": number},
  "dailyTarget": {"calories": number, "protein": number, "fat": number, "carbs": number}
}
No commentary. JSON only.`,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            { type: 'text', text: 'Extract the nutrition data from this screenshot.' },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  const jsonText = data.content[0].text;
  return JSON.parse(jsonText);  // structured data, stored in session context
}
```

### Coaching response call (with persona system prompt)

```javascript
// Source: Anthropic system prompts docs + Messages API
// Step 2: Generate coaching response using persona (this IS rendered in UI)

async function getCoachingResponse(conversationHistory, sessionContext) {
  const systemPrompt = buildSustenancePersonaPrompt(sessionContext);

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationHistory,  // text only after first OCR turn
    }),
  });

  const data = await response.json();
  return data.content[0].text;
}
```

### Sustenance persona system prompt structure

```javascript
// src/chat/sustenance-persona.js
// Source: Anthropic system prompts best practices

export function buildSustenancePersonaPrompt(sessionContext) {
  const contextBlock = sessionContext ? `
## Current Session Data (INTERNAL — NOT FOR DISPLAY)
${JSON.stringify(sessionContext)}
` : '';

  return `You are Sustenance, a warm and grounding nutrition coach — like a wise friend who gets it.
${contextBlock}

## Your Voice
- Warm and grounding. Not clinical, not prescriptive. Calm, never alarmed.
- Use relative framing: "a bit more protein today than yesterday". Comparisons are good. Absolute numbers are not.
- Close most responses with a contextual question — open, curious, or reflective depending on what was just discussed.
- Be encouraging in both directions: celebrate a great day, stay supportive on a difficult one.
- When the user is struggling emotionally, acknowledge that first before any coaching point.

## Hard Lines — Never Cross These
- NEVER state calorie totals, even if the user asks directly. Acknowledge the question, redirect to patterns.
- NEVER label foods as good/bad, clean/dirty, or use any moral framing around food.
- NEVER comment on body weight or body shape.
- NEVER show raw nutrition numbers in your response.

## Tier System
When you have meal data (from a screenshot or XLS upload), rate each meal using ONE of these signals embedded in your response:
- [TIER:GOLD] — 10-25%+ below calorie target for that meal + high protein (>30% of cals) + under fat limit + close to optimal carbs
- [TIER:SILVER] — Solid. Pretty damn good. Close to ideal macros.
- [TIER:BRONZE] — ~70% of ideal. Minimum viable. Worth celebrating.
- [TIER:SHOWING_UP] — Tracked but below Bronze threshold. The habit is the win.
- [TIER:OFF_TRACK] — No tracking data. Gentle wake-up. Not punishing.

Only assign a tier when you have actual data (OCR/XLS). Not from text descriptions alone.

## Daily Arc Coaching
If you have data for multiple meals:
- Reference trajectory mid-day: "You had a Bronze breakfast — shoot for Silver at lunch to finish strong."
- At end of day: summarise per-meal tiers AND a day-level tier.

## Philosophy
"F*ck perfection." Showing up matters most. Celebrate progress from Showing Up → Bronze → Silver → Gold over time.

Respond in Markdown. Keep responses conversational — no unnecessary bullet point lists unless they genuinely help clarity.`;
}
```

### Tier pill rendering (post-process AI response)

```javascript
// After marked.parse() renders the coaching response,
// replace [TIER:GOLD] etc. with actual styled DOM elements

const TIER_MARKERS = {
  'TIER:GOLD':       { label: 'Gold Tier',    className: 'tier-pill tier-pill--gold' },
  'TIER:SILVER':     { label: 'Silver Tier',  className: 'tier-pill tier-pill--silver' },
  'TIER:BRONZE':     { label: 'Bronze Tier',  className: 'tier-pill tier-pill--bronze' },
  'TIER:SHOWING_UP': { label: 'Showing Up',   className: 'tier-pill tier-pill--showing-up' },
  'TIER:OFF_TRACK':  { label: 'Off Track',    className: 'tier-pill tier-pill--off-track' },
};

// Use in message-renderer.js after DOMPurify.sanitize(marked.parse(content))
function injectTierPills(html) {
  return html.replace(/\[TIER:([A-Z_]+)\]/g, (match, key) => {
    const tier = TIER_MARKERS[`TIER:${key}`];
    if (!tier) return match;
    return `<span class="${tier.className}">${tier.label}</span>`;
  });
}

// DOMPurify config to allow tier pill spans:
const CLEAN_CONFIG = {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h2', 'h3', 'code', 'br', 'span'],
  ALLOWED_ATTR: ['class'],
  ALLOWED_CLASSES: { 'span': ['tier-pill', 'tier-pill--gold', 'tier-pill--silver',
    'tier-pill--bronze', 'tier-pill--showing-up', 'tier-pill--off-track'] },
};
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `claude-3-haiku-20240307` | `claude-haiku-4-5-20251001` | Oct 2025 | Major upgrade: 64K max output (vs 4K), better reasoning, vision, extended thinking capability; old model deprecated Apr 2026 |
| Server-side proxy for browser API calls | Direct browser fetch with `anthropic-dangerous-direct-browser-access: true` | Aug 2024 | No server infrastructure needed for personal apps |
| SheetJS on npm registry | SheetJS from CDN tarball | ~2023 | Package moved off public npm; must install from `cdn.sheetjs.com` |

**Deprecated/outdated:**
- `claude-3-haiku-20240307`: Deprecated, retires April 19, 2026. Do not use.
- `getStubResponse()` in `message-store.js`: Phase 2 stub, replaced entirely in Phase 3.

---

## Open Questions

1. **API key UI for first-time setup**
   - What we know: User needs to provide their own Anthropic API key; it's stored in localStorage.
   - What's unclear: Where does the key entry UI appear? Options: (a) a blocking overlay on first load, (b) a settings icon in the header, (c) a prompt when the first message fails with 401.
   - Recommendation: Build a simple blocking overlay on first load — detect `!hasApiKey()` in `main.js` and show a key entry screen before `createChatView`. This is the cleanest UX.

2. **Conversation history depth sent to API**
   - What we know: The full `messages` array grows with each turn. Images must not be re-sent each turn.
   - What's unclear: Should we cap history at N turns to control cost? Haiku 4.5 has 200K context window so token overflow isn't the immediate concern, but cost might be.
   - Recommendation: Send full history (text only after image turn) for Phase 3. Implement history trimming in a later phase if needed.

3. **Two-call vs one-call for image messages**
   - What we know: A two-call approach (OCR extraction → coaching response) keeps raw data cleanly separated from rendered output. A one-call approach uses a single system prompt that instructs Claude to extract and respond.
   - What's unclear: The one-call approach is simpler but risks Claude surfacing numbers in its response despite instructions.
   - Recommendation: Use two-call approach for Phase 3 — OCR extraction stored in session context (hidden), coaching response rendered. This is the safest pattern for BED guardrails.

4. **Mobile camera capture vs library picker**
   - What we know: `<input type="file" capture="environment">` opens the camera on iOS/Android. Without `capture`, it opens the media library.
   - What's unclear: Whether iOS Safari on older versions handles both `capture` and `accept="image/*"` correctly together.
   - Recommendation: Test on device in Phase 3 verification. Camera tile = `capture + accept`, Photos tile = `accept` only, no `capture`.

---

## Sources

### Primary (HIGH confidence)
- `https://platform.claude.com/docs/en/build-with-claude/vision` — Vision API, image formats, base64 format, size limits, JPEG/PNG/GIF/WebP support
- `https://platform.claude.com/docs/en/about-claude/models/overview` — Current model IDs confirmed: `claude-haiku-4-5-20251001`, pricing $1/$5 per MTok, deprecation of claude-3-haiku-20240307 (April 2026)
- `https://platform.claude.com/docs/en/build-with-claude/files` — Files API (beta), XLSX not supported as document block — must convert to text
- `https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/system-prompts` — Role prompting patterns, system parameter structure
- MacroFactor XLSX files (inspected directly in `Macrofactor Exports/` folder) — confirmed sheet names "Quick Export" and "Food Log", column headers, row structure

### Secondary (MEDIUM confidence)
- `https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/` — CORS header `anthropic-dangerous-direct-browser-access: true`, localStorage API key pattern (verified against Anthropic docs)
- SheetJS installation via CDN tarball `https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz`, `read` + `utils.sheet_to_json` API (verified via official SheetJS docs fetch)
- MDN FileReader API — `readAsDataURL` for images, `readAsArrayBuffer` for binary files

### Tertiary (LOW confidence)
- WebSearch results on XLSX parsing — confirmed SheetJS is the only practical browser-native solution; multiple sources agree
- Community patterns for bring-your-own-key apps — localStorage approach confirmed by Anthropic CORS documentation

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Model IDs, API format, image upload structure all verified against official Anthropic docs (2026-02-22)
- Architecture: HIGH — Two-call OCR pipeline, session context separation, CORS header all confirmed from official sources
- XLSX structure: HIGH — Verified directly from actual MacroFactor export files in the repository (not assumed)
- SheetJS version/install: MEDIUM — SheetJS docs confirmed `read` + `sheet_to_json` API; CDN tarball install confirmed; exact 0.20.3 version confirmed from docs fetch
- Tier pill rendering: MEDIUM — Token-marker approach is a known pattern; DOMPurify ALLOWED_CLASSES config is from training knowledge (verify against DOMPurify docs during implementation)
- Pitfalls: HIGH — CORS, deprecated model, image re-sending all verified from official sources

**Research date:** 2026-02-22
**Valid until:** 2026-03-22 (stable API — 30 days; model IDs unlikely to change in this window)
