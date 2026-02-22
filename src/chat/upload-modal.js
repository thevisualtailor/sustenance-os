/**
 * Upload Modal — Sustenance OS
 * Three-tile modal: Camera / Photos / Files
 * Triggers appropriate file pickers and calls back with selected File.
 */
import './upload-modal.css';

/**
 * Creates the upload modal.
 * @param {{ onImage: (file: File) => void, onFile: (file: File) => void, onDismiss: () => void }} callbacks
 * @returns {{ open: () => void, close: () => void }}
 */
export function createUploadModal({ onImage, onFile, onDismiss }) {
  // ─── Hidden file inputs (appended to overlay to avoid layout issues) ───
  const cameraInput = document.createElement('input');
  cameraInput.type = 'file';
  cameraInput.accept = 'image/*';
  cameraInput.capture = 'environment';
  cameraInput.style.display = 'none';

  const photosInput = document.createElement('input');
  photosInput.type = 'file';
  photosInput.accept = 'image/*';
  photosInput.style.display = 'none';

  const filesInput = document.createElement('input');
  filesInput.type = 'file';
  filesInput.accept = '.xlsx,.xls';
  filesInput.style.display = 'none';

  // ─── Overlay ───
  const overlay = document.createElement('div');
  overlay.className = 'upload-modal-overlay';

  // Clicking overlay background (outside modal content) dismisses
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
      onDismiss();
    }
  });

  // ─── Modal content ───
  const modal = document.createElement('div');
  modal.className = 'upload-modal';

  // Prevent click on modal content from bubbling to overlay
  modal.addEventListener('click', (e) => e.stopPropagation());

  // Title
  const title = document.createElement('p');
  title.className = 'upload-modal__title';
  title.textContent = 'Add attachment';

  // Dismiss button
  const dismissBtn = document.createElement('button');
  dismissBtn.className = 'upload-modal__dismiss';
  dismissBtn.setAttribute('aria-label', 'Close upload menu');
  dismissBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">' +
    '<line x1="18" y1="6" x2="6" y2="18"/>' +
    '<line x1="6" y1="6" x2="18" y2="18"/>' +
    '</svg>';
  dismissBtn.addEventListener('click', () => {
    close();
    onDismiss();
  });

  // ─── Camera tile ───
  const cameraTile = createTile(
    'Camera',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
      '<circle cx="12" cy="13" r="4"/>' +
      '</svg>'
  );
  cameraTile.addEventListener('click', () => cameraInput.click());

  // ─── Photos tile ───
  const photosTile = createTile(
    'Photos',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>' +
      '<circle cx="8.5" cy="8.5" r="1.5"/>' +
      '<polyline points="21 15 16 10 5 21"/>' +
      '</svg>'
  );
  photosTile.addEventListener('click', () => photosInput.click());

  // ─── Files tile ───
  const filesTile = createTile(
    'Files',
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>' +
      '<polyline points="14 2 14 8 20 8"/>' +
      '<line x1="16" y1="13" x2="8" y2="13"/>' +
      '<line x1="16" y1="17" x2="8" y2="17"/>' +
      '<polyline points="10 9 9 9 8 9"/>' +
      '</svg>'
  );
  filesTile.addEventListener('click', () => filesInput.click());

  // ─── File input change handlers ───
  cameraInput.addEventListener('change', () => {
    const file = cameraInput.files[0];
    if (file) {
      close();
      onImage(file);
    }
  });

  photosInput.addEventListener('change', () => {
    const file = photosInput.files[0];
    if (file) {
      close();
      onImage(file);
    }
  });

  filesInput.addEventListener('change', () => {
    const file = filesInput.files[0];
    if (file) {
      close();
      onFile(file);
    }
  });

  // ─── Assemble ───
  modal.appendChild(dismissBtn);
  modal.appendChild(title);
  modal.appendChild(cameraTile);
  modal.appendChild(photosTile);
  modal.appendChild(filesTile);

  overlay.appendChild(modal);
  overlay.appendChild(cameraInput);
  overlay.appendChild(photosInput);
  overlay.appendChild(filesInput);

  // ─── Public API ───
  function open() {
    document.body.appendChild(overlay);
  }

  function close() {
    // Reset input values so re-selecting the same file triggers change event
    cameraInput.value = '';
    photosInput.value = '';
    filesInput.value = '';
    overlay.remove();
  }

  return { open, close };
}

// ─── Helpers ───

function createTile(label, svgString) {
  const tile = document.createElement('button');
  tile.className = 'upload-modal__tile';

  const icon = document.createElement('span');
  icon.innerHTML = svgString;

  const labelEl = document.createElement('span');
  labelEl.textContent = label;

  tile.appendChild(icon);
  tile.appendChild(labelEl);
  return tile;
}
