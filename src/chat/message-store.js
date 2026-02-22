/**
 * Message Store — Sustenance OS
 * In-memory store for chat messages with stub AI response.
 * Phase 2 only — stub response is replaced by real AI calls in Phase 3.
 */

let _counter = 0;

/**
 * Creates a new in-memory message store.
 * @returns {{ addMessage, getMessages, getVisible, hasMore, getOlder }}
 */
export function createMessageStore() {
  const messages = [];

  return {
    /**
     * Add a new message to the store.
     * @param {'user'|'assistant'} role
     * @param {string} content
     * @returns {{ id, role, content, timestamp }}
     */
    addMessage(role, content) {
      const message = {
        id: ++_counter,
        role,
        content,
        timestamp: Date.now(),
      };
      messages.push(message);
      return message;
    },

    /** Returns all messages in chronological order. */
    getMessages() {
      return [...messages];
    },

    /**
     * Returns the last N messages (default 50).
     * @param {number} n
     */
    getVisible(n = 50) {
      return messages.slice(-n);
    },

    /**
     * Returns true if total messages exceed the visible window.
     * @param {number} n
     */
    hasMore(n = 50) {
      return messages.length > n;
    },

    /**
     * Returns messages before the visible window (for load-more).
     * @param {number} n  — visible window size
     * @param {number} offset — how many additional pages back
     */
    getOlder(n = 50, offset = 1) {
      const end = Math.max(0, messages.length - n * offset);
      const start = Math.max(0, end - n);
      return messages.slice(start, end);
    },

    /** Clears all messages (new conversation reset). */
    clear() {
      messages.length = 0;
    },
  };
}

/**
 * Returns a stub AI response after a simulated thinking delay.
 * STUB ONLY — replaced by real Claude API calls in Phase 3.
 *
 * @returns {Promise<string>} Markdown-formatted response string
 */
export function getStubResponse() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        '## Great question!\n\nHere are a few things to consider:\n\n- **Consistency** matters more than perfection\n- Try to include a source of protein with each meal\n- Your fire meals list has some solid options for this\n\nWhat meal are you thinking about?'
      );
    }, 1500);
  });
}
