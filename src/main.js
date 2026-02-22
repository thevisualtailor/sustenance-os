import './styles/main.css';
import { createAppShell } from './view/app-shell.js';
import { createChatView } from './chat/chat-view.js';
import { hasApiKey, setApiKey } from './chat/claude-api.js';

function showApiKeyOverlay(main, onSuccess) {
  const overlay = document.createElement('div');
  overlay.className = 'api-key-overlay';

  overlay.innerHTML = `
    <h2>API Key Required</h2>
    <p>This app calls Claude directly from your browser. Enter your Anthropic API key to continue.</p>
    <input type="password" placeholder="sk-ant-..." autocomplete="off" spellcheck="false" />
    <button type="button">Continue</button>
  `;

  main.appendChild(overlay);

  const input = overlay.querySelector('input');
  const button = overlay.querySelector('button');

  function submit() {
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }
    setApiKey(value);
    overlay.remove();
    onSuccess();
  }

  button.addEventListener('click', submit);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') submit();
  });

  // Auto-focus the input
  setTimeout(() => input.focus(), 50);
}

function init() {
  const app = document.getElementById('app');
  const { main } = createAppShell(app);

  if (hasApiKey()) {
    createChatView(main);
  } else {
    showApiKeyOverlay(main, () => createChatView(main));
  }
}

init();
