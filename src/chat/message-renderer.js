/**
 * Message Renderer — Sustenance OS
 * Converts a message object into a DOM element.
 * AI messages: markdown via marked, sanitized via DOMPurify.
 * User messages: plain text (no innerHTML, XSS-safe by construction).
 */
import { marked } from 'marked';
import DOMPurify from 'dompurify';

/**
 * Renders a message object as a DOM element.
 * @param {{ id: number, role: 'user'|'assistant', content: string, timestamp: number }} message
 * @returns {HTMLElement}
 */
export function renderMessage(message) {
  const { role, content, timestamp } = message;

  const wrapper = document.createElement('div');
  wrapper.className = `message message--${role}`;

  const contentEl = document.createElement('div');
  contentEl.className = 'message__content';

  if (role === 'user') {
    // Plain text — safe by construction, no innerHTML
    contentEl.textContent = content;
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
