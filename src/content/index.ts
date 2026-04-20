import { detectFormat } from './format-detector';

function init() {
  // Don't run on extension pages
  if (window.location.protocol === 'chrome-extension:') return;

  const body = document.body;
  if (!body) return;

  // Only process if the page looks like raw data (e.g. text/plain or pre-formatted)
  const pre = body.querySelector('pre');
  const rawText = pre ? pre.textContent || '' : body.textContent || '';

  if (!rawText.trim()) return;

  const contentType = document.contentType || '';
  const result = detectFormat(rawText, contentType);

  if (result.format && result.confidence >= 0.7) {
    // Generate a unique storage key for this page's data
    const storageKey = `prettify_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Store data in chrome.storage.local (avoids URL length limits)
    chrome.storage.local.set(
      {
        [storageKey]: {
          url: window.location.href,
          data: rawText,
          format: result.format,
          timestamp: new Date().toISOString(),
        },
      },
      () => {
        // Ask background to open viewer in a new tab (preserves original page)
        chrome.runtime?.sendMessage?.({
          type: 'OPEN_VIEWER',
          format: result.format,
          storageKey,
          sourceUrl: window.location.href,
        });
      },
    );
  }
}

if (document.readyState === 'complete') {
  init();
} else {
  document.addEventListener('DOMContentLoaded', init);
}
