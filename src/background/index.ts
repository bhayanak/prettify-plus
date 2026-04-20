import { cacheResponse, getCachedResponse } from './response-cache';
import { inferSchema } from './schema-inferrer';
import { getSettings, saveSettings } from './settings';
import type { CachedResponse, SupportedFormat, ViewerConfig } from '@/shared/types';

chrome.runtime.onMessage.addListener(
  (
    message: {
      type: string;
      payload?: CachedResponse;
      url?: string;
      data?: unknown;
      config?: Partial<ViewerConfig>;
      format?: SupportedFormat;
      storageKey?: string;
      sourceUrl?: string;
    },
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response: unknown) => void,
  ) => {
    switch (message.type) {
      case 'OPEN_VIEWER': {
        if (message.format && message.storageKey) {
          const viewerUrl = chrome.runtime.getURL('src/viewer/index.html');
          const params = new URLSearchParams({
            format: message.format,
            key: message.storageKey,
          });
          if (message.sourceUrl) {
            params.set('source', message.sourceUrl);
          }
          chrome.tabs.create({ url: `${viewerUrl}?${params.toString()}` });
          // Also cache for diff feature
          if (message.sourceUrl) {
            chrome.storage.local.get(message.storageKey, (result) => {
              const stored = result[message.storageKey!] as
                | { data?: string; timestamp?: string }
                | undefined;
              if (stored?.data) {
                cacheResponse({
                  url: message.sourceUrl!,
                  data: stored.data,
                  format: message.format!,
                  timestamp: stored.timestamp || new Date().toISOString(),
                });
              }
            });
          }
          sendResponse({ ok: true });
        }
        break;
      }
      case 'CACHE_RESPONSE': {
        if (message.payload) {
          const previous = cacheResponse(message.payload);
          sendResponse({ previous });
        }
        break;
      }
      case 'GET_CACHED': {
        if (message.url) {
          const cached = getCachedResponse(message.url);
          sendResponse({ cached });
        }
        break;
      }
      case 'INFER_SCHEMA': {
        const schema = inferSchema(message.data);
        sendResponse({ schema });
        break;
      }
      case 'GET_SETTINGS': {
        getSettings().then((settings) => sendResponse({ settings }));
        return true;
      }
      case 'SAVE_SETTINGS': {
        if (message.config) {
          saveSettings(message.config).then((settings) => sendResponse({ settings }));
          return true;
        }
        break;
      }
      default:
        sendResponse({ error: 'Unknown message type' });
    }
    return undefined;
  },
);
