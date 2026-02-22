/**
 * Chat View — Sustenance OS
 * Flex column layout: scrollable message thread + fixed input bar.
 * Empty state branding fades out on first message.
 */
import './chat-view.css';
import { createMessageStore, createImageAttachment, createXlsxAttachment } from './message-store.js';
import { renderMessage } from './message-renderer.js';
import { createScrollAnchor } from './scroll-anchor.js';
import { createUploadModal } from './upload-modal.js';
import { sendMessage, sendOcrExtraction, fileToBase64 } from './claude-api.js';
import { buildSustenancePersonaPrompt } from './sustenance-persona.js';
import { setOcrData, setXlsxData, getContextBlock, clearSession } from './session-context.js';

/**
 * @param {HTMLElement} container — the .app-main element from createAppShell
 */
export function createChatView(container) {
  const store = createMessageStore();

  // Pending attachments — array of { url, file } objects, max 5
  let pendingAttachments = []; // array of { url, file } objects, max 5

  // Conversation history in Anthropic API format — separate from UI store
  let conversationHistory = [];

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
  emptyTitle.textContent = 'F*ck Perfection.';

  const emptySubtitle = document.createElement('p');
  emptySubtitle.className = 'chat-empty__subtitle';
  emptySubtitle.innerHTML = 'Success comes from 70% every day,<br>not perfect once a week.';

  emptyState.appendChild(emptyTitle);
  emptyState.appendChild(emptySubtitle);
  thread.appendChild(emptyState);

  // ─── Attachment Preview Strip ───
  const previewStrip = document.createElement('div');
  previewStrip.className = 'chat-input__previews';

  // ─── Input Bar ───
  const inputBar = document.createElement('div');
  inputBar.className = 'chat-input';

  const textarea = document.createElement('textarea');
  textarea.placeholder = "Let's chat...";
  textarea.rows = 1;
  textarea.setAttribute('aria-label', 'Message input');

  // Auto-expand textarea: 1 line to max 4 lines (~96px at 24px line-height)
  // box-sizing: border-box is set in CSS to prevent infinite growth
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
    textarea.style.overflowY = textarea.scrollHeight > 96 ? 'scroll' : 'hidden';
  });

  // Desktop only: Enter sends, Shift+Enter inserts newline.
  // Mobile keyboards have unreliable keydown behaviour so we skip it there.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (pendingAttachments.length > 0) {
          handleSendWithImages();
        } else {
          handleSend();
        }
      }
      // Shift+Enter falls through to default textarea behaviour (newline)
    });
  }

  // ─── Attach (+) Button ───
  const attachBtn = document.createElement('button');
  attachBtn.className = 'chat-input__attach';
  attachBtn.setAttribute('aria-label', 'Add attachment');
  attachBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
    '<line x1="12" y1="5" x2="12" y2="19"/>' +
    '<line x1="5" y1="12" x2="19" y2="12"/>' +
    '</svg>';

  // Upload modal (created once, reused)
  const uploadModal = createUploadModal({
    onImage: (file) => {
      addPendingImage(file);
      // Does NOT auto-send — user taps send when ready
    },
    onFile: (file) => {
      // XLSX still sends immediately (single file, different flow)
      handleSendWithXlsx(file);
    },
    onDismiss: () => {},
  });

  attachBtn.addEventListener('click', () => uploadModal.open());

  const sendBtn = document.createElement('button');
  sendBtn.className = 'chat-input__send';
  sendBtn.setAttribute('aria-label', 'Send message');
  sendBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true">' +
    '<path d="M868 545.5L536.1 163a31.96 31.96 0 0 0-48.3 0L156 545.5a7.97 7.97 0 0 0 6 13.2h81c4.6 0 9-2 12.1-5.5L474 300.9V864c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V300.9l218.9 252.3c3 3.5 7.4 5.5 12.1 5.5h81c6.8 0 10.5-8 6-13.2"/>' +
    '</svg>';
  // Send button is NEVER disabled (locked decision)

  // Layout: [previews strip] [+] [textarea] [send]
  inputBar.appendChild(previewStrip);
  inputBar.appendChild(attachBtn);
  inputBar.appendChild(textarea);
  inputBar.appendChild(sendBtn);

  // ─── Assemble ───
  chatView.appendChild(thread);
  chatView.appendChild(inputBar);
  container.appendChild(chatView);

  // ─── Header Buttons ───
  // History (left, visual-only — session persistence in Phase 3)
  // New Conversation (right, functional — clears thread and store)
  const appHeader = container.parentElement && container.parentElement.querySelector('.app-header');
  if (appHeader) {
    const historyBtn = document.createElement('button');
    historyBtn.className = 'header-action-btn';
    historyBtn.setAttribute('aria-label', 'Conversation history');
    historyBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
      '<line x1="4" y1="7" x2="20" y2="7"/>' +
      '<line x1="4" y1="12" x2="20" y2="12"/>' +
      '<line x1="4" y1="17" x2="20" y2="17"/>' +
      '</svg>';
    appHeader.insertBefore(historyBtn, appHeader.firstChild);

    const newConvoBtn = document.createElement('button');
    newConvoBtn.className = 'header-action-btn';
    newConvoBtn.setAttribute('aria-label', 'New conversation');
    newConvoBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
      '<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
      '</svg>';
    newConvoBtn.addEventListener('click', () => {
      store.clear();
      // Clear conversation history and session context
      conversationHistory = [];
      clearSession();
      // Remove all thread children except emptyState (first child)
      while (thread.children.length > 1) {
        thread.removeChild(thread.lastChild);
      }
      emptyState.classList.remove('chat-empty--hidden');
      loadOffset = 1;
    });
    appHeader.appendChild(newConvoBtn);
  }

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

  /**
   * Shared post-response handler: renders assistant message, updates history, manages load-more.
   */
  function handleAssistantResponse(responseText) {
    const assistantMsg = store.addMessage('assistant', responseText);
    thread.appendChild(renderMessage(assistantMsg));
    conversationHistory.push({ role: 'assistant', content: responseText });
    scrollAnchor.onNewMessage();

    if (store.hasMore(50)) {
      const existing = thread.querySelector('.load-more-btn');
      if (!existing) {
        const btn = renderLoadMoreBtn();
        thread.insertBefore(btn, thread.children[1]); // after emptyState
      }
    }
  }

  /**
   * Shared error handler: shows a graceful error message as an assistant message.
   */
  function handleApiError(errorMsg) {
    const errMsg = store.addMessage('assistant', errorMsg);
    thread.appendChild(renderMessage(errMsg));
    scrollAnchor.onNewMessage();
  }

  // ─── Pending Attachment Helpers ───

  function addPendingImage(file) {
    if (pendingAttachments.length >= 5) return;
    const url = URL.createObjectURL(file);
    pendingAttachments.push({ url, file });
    renderPreviewStrip();
  }

  function removePendingImage(index) {
    URL.revokeObjectURL(pendingAttachments[index].url);
    pendingAttachments.splice(index, 1);
    renderPreviewStrip();
  }

  function clearPendingImages() {
    pendingAttachments.forEach(a => URL.revokeObjectURL(a.url));
    pendingAttachments = [];
    renderPreviewStrip();
  }

  function renderPreviewStrip() {
    previewStrip.innerHTML = '';
    if (pendingAttachments.length === 0) {
      previewStrip.className = 'chat-input__previews';
      return;
    }
    previewStrip.className = 'chat-input__previews chat-input__previews--visible';
    pendingAttachments.forEach((att, i) => {
      const item = document.createElement('div');
      item.className = 'chat-input__preview-item';

      const img = document.createElement('img');
      img.className = 'chat-input__preview-thumb';
      img.src = att.url;
      img.alt = 'Attachment ' + (i + 1);

      const removeBtn = document.createElement('button');
      removeBtn.className = 'chat-input__preview-remove';
      removeBtn.setAttribute('aria-label', 'Remove attachment');
      removeBtn.textContent = '×';
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        removePendingImage(i);
      });

      item.appendChild(img);
      item.appendChild(removeBtn);
      previewStrip.appendChild(item);
    });
  }

  // Case A: Text-only message
  async function handleSend() {
    const text = textarea.value.trim();
    if (!text) return;
    if (isThinking) return;

    // Clear input immediately
    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';

    // Add user message to store + render
    const userMsg = store.addMessage('user', text);
    thread.appendChild(renderMessage(userMsg));
    conversationHistory.push({ role: 'user', content: text });

    // Fade out empty state on first message
    if (store.getMessages().length === 1) {
      emptyState.classList.add('chat-empty--hidden');
    }

    scrollAnchor.onNewMessage();

    isThinking = true;
    const indicator = renderThinkingIndicator();

    try {
      const systemPrompt = buildSustenancePersonaPrompt(getContextBlock());
      const responseText = await sendMessage({ systemPrompt, messages: conversationHistory });
      indicator.remove();
      handleAssistantResponse(responseText);
    } catch (err) {
      indicator.remove();
      console.error('sendMessage error:', err);
      handleApiError('Something went wrong — please check your API key and try again.');
    } finally {
      isThinking = false;
    }
  }

  sendBtn.addEventListener('click', () => {
    if (pendingAttachments.length > 0) {
      handleSendWithImages();
    } else {
      handleSend();
    }
  });

  // ─── Attachment Send Logic ───

  // Case B: Image attachment(s) — two-call OCR pipeline
  async function handleSendWithImages() {
    if (pendingAttachments.length === 0) return;
    if (isThinking) return;

    const attachments = [...pendingAttachments];
    const text = textarea.value.trim() || 'Analyse this';

    // Clear input + previews
    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
    clearPendingImages();

    // Build attachment object for the message store (use first image for thumbnail)
    const attachmentObj = createImageAttachment(attachments[0].file);
    // For multiple images, store all URLs on the attachment object
    if (attachments.length > 1) {
      attachmentObj.extraUrls = attachments.slice(1).map(a => URL.createObjectURL(a.file));
    }

    // Add user message with attachment to store + render
    const userMsg = store.addMessage('user', text, attachmentObj);
    thread.appendChild(renderMessage(userMsg));

    if (store.getMessages().length === 1) {
      emptyState.classList.add('chat-empty--hidden');
    }

    scrollAnchor.onNewMessage();

    isThinking = true;
    const indicator = renderThinkingIndicator();

    try {
      // OCR extraction: convert all images to base64, send in one call
      const imagePayloads = await Promise.all(
        attachments.map(async (att) => ({
          base64: await fileToBase64(att.file),
          mediaType: att.file.type,
        }))
      );

      let ocrText;
      try {
        ocrText = await sendOcrExtraction(imagePayloads);
      } catch (ocrErr) {
        console.error('OCR extraction error:', ocrErr);
        indicator.remove();
        handleApiError("I had trouble reading that image. Could you try again?");
        return;
      }

      try {
        const ocrResult = JSON.parse(ocrText);
        setOcrData(ocrResult);
      } catch (parseErr) {
        console.warn('OCR result was not valid JSON, storing raw:', parseErr);
        setOcrData({ raw: ocrText });
      }

      conversationHistory.push({
        role: 'user',
        content: text + '\n[MacroFactor screenshot(s) analysed — nutrition data stored in session context]',
      });

      const systemPrompt = buildSustenancePersonaPrompt(getContextBlock());
      const responseText = await sendMessage({ systemPrompt, messages: conversationHistory });
      indicator.remove();
      handleAssistantResponse(responseText);
    } catch (err) {
      indicator.remove();
      console.error('Image pipeline error:', err);
      handleApiError('Something went wrong — please check your API key and try again.');
    } finally {
      isThinking = false;
    }
  }

  // Case C: XLSX attachment — immediate send
  async function handleSendWithXlsx(file) {
    if (isThinking) return;

    const text = textarea.value.trim() || 'Analyse this';

    textarea.value = '';
    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';

    let attachmentObj = null;
    try {
      attachmentObj = await createXlsxAttachment(file);
    } catch (err) {
      console.error('Failed to parse XLSX:', err);
      attachmentObj = { type: 'xlsx', filename: file.name, data: null };
    }

    const userMsg = store.addMessage('user', text, attachmentObj);
    thread.appendChild(renderMessage(userMsg));

    if (store.getMessages().length === 1) {
      emptyState.classList.add('chat-empty--hidden');
    }

    scrollAnchor.onNewMessage();

    isThinking = true;
    const indicator = renderThinkingIndicator();

    try {
      if (attachmentObj && attachmentObj.data) {
        setXlsxData(attachmentObj.data);
      }

      conversationHistory.push({
        role: 'user',
        content: text + '\n[MacroFactor XLSX uploaded: ' + (attachmentObj ? attachmentObj.filename : file.name) + ' — data stored in session context]',
      });

      const systemPrompt = buildSustenancePersonaPrompt(getContextBlock());
      const responseText = await sendMessage({ systemPrompt, messages: conversationHistory });
      indicator.remove();
      handleAssistantResponse(responseText);
    } catch (err) {
      indicator.remove();
      console.error('XLSX pipeline error:', err);
      handleApiError('Something went wrong — please check your API key and try again.');
    } finally {
      isThinking = false;
    }
  }

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
