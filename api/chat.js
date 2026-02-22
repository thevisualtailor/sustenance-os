export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  const model = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5-20251001';

  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured in Vercel environment variables' });
  }

  const { type, systemPrompt, messages, base64, mediaType, images } = req.body;

  let requestBody;

  if (type === 'ocr') {
    // OCR extraction call — returns JSON nutrition data
    // Supports images array (new) with backward-compat fallback to single base64/mediaType
    const imageBlocks = (images || [{ base64, mediaType }]).map(img => ({
      type: 'image',
      source: { type: 'base64', media_type: img.mediaType, data: img.base64 }
    }));

    requestBody = {
      model,
      max_tokens: 512,
      system: 'You are a nutrition data extraction tool. Extract data from the MacroFactor screenshot(s) and return ONLY valid JSON with this exact shape: { "date": "YYYY-MM-DD", "meals": [{ "name": string, "calories": number, "protein": number, "fat": number, "carbs": number }], "dailyTotal": { "calories": number, "protein": number, "fat": number, "carbs": number }, "dailyTarget": { "calories": number, "protein": number, "fat": number, "carbs": number } }. If multiple screenshots are provided, merge the meal data. No commentary. JSON only.',
      messages: [{
        role: 'user',
        content: [
          ...imageBlocks,
          { type: 'text', text: 'Extract the nutrition data from these screenshots.' }
        ]
      }]
    };
  } else {
    // Standard coaching call
    requestBody = {
      model,
      max_tokens: 1024,
      system: systemPrompt,
      messages
    };
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(response.status).json({ error: err.error?.message || 'Anthropic API error' });
    }

    const data = await response.json();
    return res.status(200).json({ text: data.content[0].text });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
