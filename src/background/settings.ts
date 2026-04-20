import type { ViewerConfig } from '@/shared/types';
import { DEFAULT_CONFIG } from '@/shared/constants';

const SETTINGS_KEY = 'prettify-plus-settings';

export async function getSettings(): Promise<ViewerConfig> {
  try {
    const result = await chrome.storage.sync.get(SETTINGS_KEY);
    return (result[SETTINGS_KEY] as ViewerConfig) ?? DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function saveSettings(config: Partial<ViewerConfig>): Promise<ViewerConfig> {
  const current = await getSettings();
  const updated = { ...current, ...config };
  await chrome.storage.sync.set({ [SETTINGS_KEY]: updated });
  return updated;
}
