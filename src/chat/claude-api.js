/* ─── Claude API Client (proxy) ─── */
/* All Anthropic calls route through /api/chat (Vercel serverless function).
   API key lives server-side — never exposed to the browser. */

/* ─── Core Message Send ─── */

export async function sendMessage({ systemPrompt, messages }) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ systemPrompt, messages }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}

/* ─── OCR Extraction Call ─── */

// images: array of { base64, mediaType } — supports 1–5 screenshots
export async function sendOcrExtraction(images) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'ocr', images }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.text; // raw JSON string — caller parses it
}

/* ─── File to Base64 Helper ─── */

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // Strip the data URL prefix (e.g. "data:image/png;base64,")
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
