/**
 * Message Renderer — Sustenance OS
 * Converts a message object into a DOM element.
 * AI messages: markdown via marked, tier pills injected, sanitized via DOMPurify.
 * User messages: plain text (no innerHTML, XSS-safe by construction).
 * Attachments: image thumbnails or xlsx file badges rendered above text.
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Tier configuration: maps [TIER:KEY] tokens to label and CSS class.
 */
const TIER_CONFIG = {
  GOLD: { label: 'Gold Tier', cssClass: 'tier-pill tier-pill--gold' },
  SILVER: { label: 'Silver Tier', cssClass: 'tier-pill tier-pill--silver' },
  BRONZE: { label: 'Bronze Tier', cssClass: 'tier-pill tier-pill--bronze' },
  SHOWING_UP: { label: 'Showing Up', cssClass: 'tier-pill tier-pill--showing-up' },
  OFF_TRACK: { label: 'Off Track', cssClass: 'tier-pill tier-pill--off-track' },
};

/**
 * DOMPurify config — allow tier pill spans through sanitization.
 * Tier pill HTML is injected BEFORE sanitize so DOMPurify validates it.
 */
const CLEAN_CONFIG = {
  ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'code', 'pre', 'br', 'span', 'a', 'blockquote'],
  ALLOWED_ATTR: ['class', 'href'],
};

/**
 * Replaces [TIER:KEY] tokens with styled span elements.
 * Called BEFORE DOMPurify.sanitize so the HTML is validated.
 * @param {string} html
 * @returns {string}
 */
function injectTierPills(html) {
  return html.replace(/\[TIER:([A-Z_]+)\]/g, (match, key) => {
    const tier = TIER_CONFIG[key];
    if (!tier) return match; // Unknown tier — leave as-is
    return `<span class="${tier.cssClass}">${tier.label}</span>`;
  });
}

/**
 * Renders a message object as a DOM element.
 * @param {{ id: number, role: 'user'|'assistant', content: string, timestamp: number, attachment?: object }} message
 * @returns {HTMLElement}
 */
export function renderMessage(message) {
  const { role, content, timestamp, attachment } = message;

  const wrapper = document.createElement('div');
  wrapper.className = `message message--${role}`;

  const contentEl = document.createElement('div');
  contentEl.className = 'message__content';

  if (role === 'user') {
    // Render attachment above text (iMessage-style) if present
    if (attachment) {
      const attachmentEl = renderAttachment(attachment);
      if (attachmentEl) {
        contentEl.appendChild(attachmentEl);
      }
    }
    // Plain text — safe by construction, no innerHTML
    const textEl = document.createElement('span');
    textEl.textContent = content;
    contentEl.appendChild(textEl);
  } else {
    // AI response pipeline:
    // 1. marked.parse — markdown to HTML
    // 2. injectTierPills — replace [TIER:X] tokens with styled spans
    // 3. DOMPurify.sanitize — validate and clean (tier pill spans are in ALLOWED_TAGS)
    const rawHtml = marked.parse(content);
    const withPills = injectTierPills(rawHtml);
    contentEl.innerHTML = DOMPurify.sanitize(withPills, CLEAN_CONFIG);

    // Timestamp on AI messages only (locked decision)
    const timestampEl = document.createElement('span');
    timestampEl.className = 'message__timestamp';
    timestampEl.textContent = new Date(timestamp).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    wrapper.appendChild(contentEl);
    wrapper.appendChild(timestampEl);
    return wrapper;
  }

  wrapper.appendChild(contentEl);
  return wrapper;
}

/**
 * Renders an attachment element (image thumbnail or xlsx badge).
 * @param {{ type: string, url?: string, filename?: string }} attachment
 * @returns {HTMLElement|null}
 */
function renderAttachment(attachment) {
  if (attachment.type === 'image') {
    const img = document.createElement('img');
    img.className = 'message__thumbnail';
    img.src = attachment.url;
    img.alt = 'Uploaded screenshot';
    return img;
  }

  if (attachment.type === 'xlsx') {
    const badge = document.createElement('div');
    badge.className = 'message__file-badge';

    // Document icon
    const icon = document.createElement('span');
    icon.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '</svg>';

    const filename = document.createElement('span');
    filename.textContent = attachment.filename || 'Spreadsheet';

    badge.appendChild(icon);
    badge.appendChild(filename);
    return badge;
  }

  return null;
}
