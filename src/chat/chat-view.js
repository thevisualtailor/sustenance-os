/**
 * Chat View — Sustenance OS
 * Flex column layout: scrollable message thread + fixed input bar.
 * Empty state branding fades out on first message.
 */
import './chat-view.css';
import { createMessageStore, getStubResponse } from './message-store.js';

/**
 * @param {HTMLElement} container — the .app-main element from createAppShell
 */
export function createChatView(container) {
  const store = createMessageStore();

  // ─── Root wrapper ───
  const chatView = document.createElement('div');
  chatView.className = 'chat-view';

  // ─── Message Thread ───
  const thread = document.createElement('div');
  thread.className = 'message-thread';

  // ─── Empty State ───
  const emptyState = document.createElement('div');
  emptyState.className = 'chat-empty';

  const emptyTitle = document.createElement('p');
  emptyTitle.className = 'chat-empty__title';
  emptyTitle.textContent = 'SustenanceOS';

  const emptySubtitle = document.createElement('p');
  emptySubtitle.className = 'chat-empty__subtitle';
  emptySubtitle.textContent = 'Persistent Imperfection';

  emptyState.appendChild(emptyTitle);
  emptyState.appendChild(emptySubtitle);
  thread.appendChild(emptyState);

  // ─── Input Bar ───
  const inputBar = document.createElement('div');
  inputBar.className = 'chat-input';

  const textarea = document.createElement('textarea');
  textarea.placeholder = 'Message...';
  textarea.rows = 1;
  textarea.setAttribute('aria-label', 'Message input');

  // Auto-expand textarea: 1 line to max 4 lines (~96px at 24px line-height)
  // box-sizing: border-box is set in CSS to prevent infinite growth
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
    textarea.style.overflowY = textarea.scrollHeight > 96 ? 'scroll' : 'hidden';
  });

  // Enter key adds newline — do NOT send on Enter (locked decision)
  // Default textarea behavior already handles this; no interception needed.

  const sendBtn = document.createElement('button');
  sendBtn.className = 'chat-input__send';
  sendBtn.setAttribute('aria-label', 'Send message');
  sendBtn.innerHTML = '&#8593;'; // Up arrow — minimal send icon
  // Send button is NEVER disabled (locked decision)

  inputBar.appendChild(textarea);
  inputBar.appendChild(sendBtn);

  // ─── Assemble ───
  chatView.appendChild(thread);
  chatView.appendChild(inputBar);
  container.appendChild(chatView);

  // ─── Send Logic ───
  let isThinking = false;

  async function handleSend() {
    const text = textarea.value.trim();
    if (!text) return;
    if (isThinking) return; // Prevent double-send during stub delay

    // Clear input immediately
    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';

    // Add user message to store + render
    store.addMessage('user', text);
    renderMessage('user', text);

    // Fade out empty state on first message
    if (store.getMessages().length === 1) {
      emptyState.classList.add('chat-empty--hidden');
    }

    // Scroll to bottom
    scrollToBottom();

    // Show thinking indicator
    isThinking = true;
    const indicator = renderThinkingIndicator();

    try {
      const response = await getStubResponse();
      // Remove thinking indicator
      indicator.remove();

      // Add AI message to store + render
      store.addMessage('assistant', response);
      renderMessage('assistant', response);
      scrollToBottom();
    } finally {
      isThinking = false;
    }
  }

  sendBtn.addEventListener('click', handleSend);

  // ─── Render Helpers ───

  function renderMessage(role, content) {
    const wrapper = document.createElement('div');
    wrapper.className = `message message--${role}`;

    const contentEl = document.createElement('div');
    contentEl.className = 'message__content';

    if (role === 'user') {
      // Plain text for user messages — safe
      contentEl.textContent = content;
    } else {
      // Raw text for assistant — Plan 02 will replace with markdown parsing
      contentEl.innerHTML = escapeHtmlPreserveNewlines(content);
    }

    wrapper.appendChild(contentEl);
    thread.appendChild(wrapper);
    return wrapper;
  }

  function renderThinkingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'thinking-indicator';
    indicator.innerHTML = 'Thinking<span>.</span><span>.</span><span>.</span>';
    thread.appendChild(indicator);
    scrollToBottom();
    return indicator;
  }

  function scrollToBottom() {
    thread.scrollTop = thread.scrollHeight;
  }

  // Minimal escape: converts markdown-ish text to readable HTML for stub responses
  // Plan 02 replaces this with a proper markdown renderer
  function escapeHtmlPreserveNewlines(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '<br>');
  }

  return { chatView, thread };
}
