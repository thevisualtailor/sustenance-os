/* ─── Session Context Store ─── */
/* Stores parsed OCR/XLSX data for hidden injection into the system prompt.
   Data is NEVER rendered in the chat thread — coach-only context. */

let _sessionContext = {
  ocrData: null,
  xlsxData: null,
};

/* ─── Setters ─── */

export function setOcrData(data) {
  _sessionContext.ocrData = data;
}

export function setXlsxData(data) {
  _sessionContext.xlsxData = data;
}

/* ─── Context Block for System Prompt Injection ─── */

export function getContextBlock() {
  const { ocrData, xlsxData } = _sessionContext;

  if (!ocrData && !xlsxData) {
    return '';
  }

  const parts = ['[COACH CONTEXT — NOT FOR DISPLAY]'];

  if (ocrData) {
    parts.push(`OCR Data: ${JSON.stringify(ocrData)}`);
  }

  if (xlsxData) {
    parts.push(`XLSX Data: ${JSON.stringify(xlsxData)}`);
  }

  return parts.join('\n');
}

/* ─── Reset ─── */

export function clearSession() {
  _sessionContext = { ocrData: null, xlsxData: null };
}
