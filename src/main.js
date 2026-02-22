import './styles/main.css';
import { createAppShell } from './view/app-shell.js';
import { createChatView } from './chat/chat-view.js';

function init() {
  const app = document.getElementById('app');
  const { main } = createAppShell(app);
  createChatView(main);
}

init();
