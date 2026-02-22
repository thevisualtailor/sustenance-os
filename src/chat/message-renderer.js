/**
 * Message Renderer — Sustenance OS
 * Converts a message object into a DOM element.
 * AI messages: markdown via marked, sanitized via DOMPurify.
 * User messages: plain text (no innerHTML, XSS-safe by construction).
 * Attachments: image thumbnails or xlsx file badges rendered above text.
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

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
    // AI response: markdown parsed by marked, sanitized by DOMPurify
    // DOMPurify.sanitize is the ONLY place innerHTML is used with AI content
    contentEl.innerHTML = DOMPurify.sanitize(marked.parse(content));

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
