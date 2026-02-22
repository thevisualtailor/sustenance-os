/* ─── Claude API Client ─── */

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001';
const STORAGE_KEY = 'sustenance_anthropic_key';

/* ─── API Key Management ─── */

export function getApiKey() {
  return localStorage.getItem(STORAGE_KEY) || '';
}

export function setApiKey(key) {
  localStorage.setItem(STORAGE_KEY, key);
}

export function hasApiKey() {
  const key = getApiKey();
  return key.length > 0;
}

/* ─── Core Message Send ─── */

export async function sendMessage({ systemPrompt, messages }) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

/* ─── OCR Extraction Call ─── */

const OCR_SYSTEM_PROMPT = `You are a nutrition data extractor. Extract data from MacroFactor screenshots.
Return ONLY valid JSON with this exact structure — no commentary, no markdown, JSON only:
{
  "date": "YYYY-MM-DD or null",
  "meals": [{ "name": "string", "calories": number, "protein": number, "fat": number, "carbs": number }],
  "dailyTotal": { "calories": number, "protein": number, "fat": number, "carbs": number },
  "dailyTarget": { "calories": number, "protein": number, "fat": number, "carbs": number }
}
If a field is not visible, use null. Return only the JSON object.`;

export async function sendOcrExtraction({ base64, mediaType }) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': getApiKey(),
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 512,
      system: OCR_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Extract the nutrition data from this screenshot.',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
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
