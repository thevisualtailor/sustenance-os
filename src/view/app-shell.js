/**
 * App Shell — Sustenance OS
 * Creates the top-level layout: header + main area.
 * No business logic. No settings. No dropzone.
 */
export function createAppShell(root) {
  root.innerHTML = '';

  const header = document.createElement('header');
  header.className = 'app-header';

  const title = document.createElement('h1');
  title.textContent = 'Sustenance OS';
  header.appendChild(title);
  root.appendChild(header);

  const main = document.createElement('main');
  main.className = 'app-main';
  root.appendChild(main);

  return { header, main };
}
