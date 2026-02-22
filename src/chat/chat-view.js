/**
 * Chat View — Sustenance OS
 * Flex column layout: scrollable message thread + fixed input bar.
 * Empty state branding fades out on first message.
 */
import './chat-view.css';
import { createMessageStore, getStubResponse } from './message-store.js';
import { renderMessage } from './message-renderer.js';
import { createScrollAnchor } from './scroll-anchor.js';

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

  // ─── Scroll Anchor ───
  // Instantiated after thread is in the DOM
  const scrollAnchor = createScrollAnchor(thread);

  // ─── Load More Control ───
  let loadOffset = 1; // tracks how many older pages have been loaded

  function renderLoadMoreBtn() {
    const btn = document.createElement('button');
    btn.className = 'load-more-btn';
    btn.textContent = 'Load earlier messages';
    btn.addEventListener('click', () => {
      const olderMessages = store.getOlder(50, loadOffset + 1);
      loadOffset++;

      // Preserve scroll position when prepending
      const prevScrollHeight = thread.scrollHeight;

      // Remove existing load-more button
      btn.remove();

      // Prepend older messages (in chronological order)
      const fragment = document.createDocumentFragment();
      olderMessages.forEach((msg) => {
        fragment.appendChild(renderMessage(msg));
      });

      // Insert after emptyState (or at very top if no empty state)
      const firstChild = thread.firstChild;
      thread.insertBefore(fragment, firstChild ? firstChild.nextSibling : null);

      // Restore scroll position so user stays at same visual point
      thread.scrollTop = thread.scrollTop + (thread.scrollHeight - prevScrollHeight);

      // If there are even older messages, add another button
      if (store.hasMore(50 * loadOffset)) {
        const nextBtn = renderLoadMoreBtn();
        thread.insertBefore(nextBtn, thread.children[1]); // after emptyState
      }
    });
    return btn;
  }

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
    const userMsg = store.addMessage('user', text);
    thread.appendChild(renderMessage(userMsg));

    // Fade out empty state on first message
    if (store.getMessages().length === 1) {
      emptyState.classList.add('chat-empty--hidden');
    }

    // Notify scroll anchor (will auto-scroll since we're at bottom)
    scrollAnchor.onNewMessage();

    // Show thinking indicator
    isThinking = true;
    const indicator = renderThinkingIndicator();

    try {
      const response = await getStubResponse();
      // Remove thinking indicator
      indicator.remove();

      // Add AI message to store + render
      const assistantMsg = store.addMessage('assistant', response);
      thread.appendChild(renderMessage(assistantMsg));

      // Notify scroll anchor (auto-scroll if at bottom, chip if scrolled up)
      scrollAnchor.onNewMessage();

      // Add load-more button if message history exceeds visible window
      if (store.hasMore(50)) {
        const existing = thread.querySelector('.load-more-btn');
        if (!existing) {
          const btn = renderLoadMoreBtn();
          thread.insertBefore(btn, thread.children[1]); // after emptyState
        }
      }
    } finally {
      isThinking = false;
    }
  }

  sendBtn.addEventListener('click', handleSend);

  // ─── Render Helpers ───

  function renderThinkingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'thinking-indicator';
    indicator.innerHTML = 'Thinking<span>.</span><span>.</span><span>.</span>';
    thread.appendChild(indicator);
    scrollAnchor.onNewMessage();
    return indicator;
  }

  return { chatView, thread };
}
