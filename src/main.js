import './styles/main.css';
import { createAppShell } from './view/app-shell.js';

function init() {
  const app = document.getElementById('app');
  const { main } = createAppShell(app);

  const placeholder = document.createElement('div');
  placeholder.className = 'app-placeholder';

  const title = document.createElement('p');
  title.className = 'app-placeholder__title';
  title.textContent = 'Sustenance OS';

  const subtitle = document.createElement('p');
  subtitle.className = 'app-placeholder__subtitle';
  subtitle.textContent = 'Your BED-safe nutrition coach';

  placeholder.appendChild(title);
  placeholder.appendChild(subtitle);
  main.appendChild(placeholder);
}

init();
