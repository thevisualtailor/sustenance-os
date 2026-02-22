---
phase: 03-ai-coaching-ocr
plan: 02
subsystem: ui
tags: [upload-modal, sheetjs, thumbnails, attachments, file-picker]
requires: ["03-01"]
provides: ["upload modal", "image thumbnails", "xlsx parsing", "attach button"]
affects: ["03-03"]
tech-stack:
  added: [xlsx]
  patterns: ["modal overlay pattern", "blob URL for thumbnails", "FileReader async XLSX parse"]
key-files:
  created:
    - src/chat/upload-modal.js
    - src/chat/upload-modal.css
  modified:
    - src/chat/chat-view.js
    - src/chat/chat-view.css
    - src/chat/message-store.js
    - src/chat/message-renderer.js
    - package.json
key-decisions: []
duration: 2 min
completed: 2026-02-22
---

# Phase 3 Plan 02: Upload Modal + XLSX Parsing Summary

**One-liner:** Three-tile upload modal (Camera/Photos/Files) with + button in input bar, SheetJS XLSX parsing of MacroFactor Quick Export and Food Log sheets, and iMessage-style image thumbnails in user message bubbles.

## What Was Built

### Upload Modal (`src/chat/upload-modal.js` + `upload-modal.css`)

- `createUploadModal({ onImage, onFile, onDismiss })` returns `{ open, close }`
- Dark overlay (rgba 0,0,0,0.85) with modal card, dismiss X button, and three tiles: Camera / Photos / Files
- Camera tile: `<input capture="environment">` — triggers native camera
- Photos tile: `<input accept="image/*">` (no capture) — opens photo library
- Files tile: `<input accept=".xlsx,.xls">` — opens document picker
- File input `value` reset on `close()` so re-selecting the same file works
- Overlay background click dismisses; X button dismisses; file selection auto-closes

### + Button in Input Bar (`src/chat/chat-view.js`)

- Attach button (`chat-input__attach`) inserted before textarea — layout: [+] [textarea] [send]
- Matches send button styling (44x44, #333 background, 12px radius)
- `handleSendWithAttachment()` called immediately on file selection (no separate confirm step)
- Auto-fills "Analyse this" when textarea is empty
- Uses stub AI response (Phase 2 pipeline) — Plan 03 replaces with real Claude API

### Message Attachments (`src/chat/message-store.js`)

- `addMessage(role, content, attachment = null)` — backward-compatible optional third param
- `createImageAttachment(file)` — `URL.createObjectURL(file)` for blob URL display, keeps `file` reference for Plan 03 base64 conversion
- `createXlsxAttachment(file)` — async FileReader + SheetJS `read()`, parses `'Quick Export'` and `'Food Log'` sheets by exact name, returns `{ type, filename, data: { dailyRows, foodRows } }`

### Thumbnail Rendering (`src/chat/message-renderer.js`)

- `renderMessage()` checks `message.attachment` before rendering text
- Image: `<img class="message__thumbnail">` with blob URL, rendered above text in user bubble (iMessage-style)
- XLSX: `<div class="message__file-badge">` with document icon and filename
- User message still uses plain `textContent` for text (XSS-safe)

### CSS (`src/chat/chat-view.css`)

- `.chat-input__attach` — same dimensions/style as send button
- `.message__thumbnail` — max 200x200, border-radius 12px, object-fit cover, margin-bottom 6px
- `.message__file-badge` — inline-flex pill with icon + filename, bg-surface, text-secondary

## Task Commits

| Task | Commit  | Description                                              |
|------|---------|----------------------------------------------------------|
| 1    | 2615b15 | feat(03-02): upload modal with + button and SheetJS      |
| 2    | 0559228 | feat(03-02): message attachments with thumbnails and XLSX parsing |

## Deviations from Plan

None — plan executed exactly as written.

## Next Phase Readiness

Plan 03 (`03-03`) can now:
- Read `message.attachment.type` to detect image vs xlsx
- Convert `attachment.file` to base64 for Claude Vision API
- Pass `attachment.data.dailyRows` / `attachment.data.foodRows` as context to the Claude API call
- The upload flow, parsing, and rendering are all in place

## Self-Check: PASSED
