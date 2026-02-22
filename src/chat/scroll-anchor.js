/**
 * Scroll Anchor — Sustenance OS
 * Manages scroll position in the message thread.
 * Auto-scrolls to bottom when user is at bottom.
 * Shows a "New message" chip when user has scrolled up.
 */

/**
 * Creates a scroll anchor controller for the given thread element.
 * @param {HTMLElement} threadEl — the .message-thread scrollable container
 * @returns {{ onNewMessage: () => void, destroy: () => void }}
 */
export function createScrollAnchor(threadEl) {
  let chipEl = null;

  function isAtBottom() {
    return threadEl.scrollHeight - threadEl.scrollTop - threadEl.clientHeight < 50;
  }

  function scrollToBottom() {
    threadEl.scrollTo({ top: threadEl.scrollHeight, behavior: 'smooth' });
  }

  function showChip() {
    if (chipEl) return; // already showing
    chipEl = document.createElement('button');
    chipEl.className = 'new-message-chip';
    chipEl.textContent = 'New message';
    chipEl.addEventListener('click', () => {
      scrollToBottom();
      hideChip();
    });
    // Append to .chat-view (parent of thread), not thread itself
    // so it sits above the input bar via absolute positioning
    threadEl.parentElement.appendChild(chipEl);
  }

  function hideChip() {
    if (chipEl) {
      chipEl.remove();
      chipEl = null;
    }
  }

  function onScroll() {
    if (isAtBottom()) hideChip();
  }

  threadEl.addEventListener('scroll', onScroll);

  return {
    onNewMessage() {
      if (isAtBottom()) {
        // Use requestAnimationFrame to ensure DOM has updated before measuring
        requestAnimationFrame(() => scrollToBottom());
      } else {
        showChip();
      }
    },
    destroy() {
      threadEl.removeEventListener('scroll', onScroll);
      hideChip();
    },
  };
}
