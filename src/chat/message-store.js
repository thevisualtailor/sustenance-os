/**
 * Message Store — Sustenance OS
 * In-memory store for chat messages with stub AI response.
 * Phase 2 only — stub response is replaced by real AI calls in Phase 3.
 */
import { read, utils } from 'xlsx';

let _counter = 0;

/**
 * Creates a new in-memory message store.
 * @returns {{ addMessage, getMessages, getVisible, hasMore, getOlder, clear }}
 */
export function createMessageStore() {
  const messages = [];

  return {
    /**
     * Add a new message to the store.
     * @param {'user'|'assistant'} role
     * @param {string} content
     * @param {object|null} attachment — optional attachment object
     * @returns {{ id, role, content, timestamp, attachment }}
     */
    addMessage(role, content, attachment = null) {
      const message = {
        id: ++_counter,
        role,
        content,
        timestamp: Date.now(),
        attachment,
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

/**
 * Creates an image attachment from a File.
 * Generates a blob URL for in-browser display.
 * Keeps the original File reference for base64 conversion in Plan 03.
 *
 * @param {File} file
 * @returns {{ type: 'image', url: string, file: File }}
 */
export function createImageAttachment(file) {
  const url = URL.createObjectURL(file);
  return { type: 'image', url, file };
}

/**
 * Parses a MacroFactor XLSX export and returns structured data.
 * Reads 'Quick Export' and 'Food Log' sheets (exact names with spaces).
 *
 * @param {File} file
 * @returns {Promise<{ type: 'xlsx', filename: string, data: { dailyRows: object[], foodRows: object[] } }>}
 */
export function createXlsxAttachment(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = read(arrayBuffer);
        const dailyRows = workbook.Sheets['Quick Export']
          ? utils.sheet_to_json(workbook.Sheets['Quick Export'])
          : [];
        const foodRows = workbook.Sheets['Food Log']
          ? utils.sheet_to_json(workbook.Sheets['Food Log'])
          : [];
        resolve({
          type: 'xlsx',
          filename: file.name,
          data: { dailyRows, foodRows },
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}
