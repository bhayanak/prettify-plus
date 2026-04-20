import { useState, useEffect } from 'react';
import type { SupportedFormat, ViewerConfig } from '@/shared/types';
import { DEFAULT_CONFIG, THEMES } from '@/shared/constants';

const ALL_FORMATS: SupportedFormat[] = ['json', 'yaml', 'xml', 'toml', 'csv'];
const SETTINGS_KEY = 'prettify-plus-settings';

export default function App() {
  const [config, setConfig] = useState<ViewerConfig>(DEFAULT_CONFIG);
  const [loaded, setLoaded] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    chrome.storage.sync.get(SETTINGS_KEY, (result) => {
      const stored = result[SETTINGS_KEY] as ViewerConfig | undefined;
      if (stored) setConfig((prev) => ({ ...prev, ...stored }));
      setLoaded(true);
    });
  }, []);

  // Save to chrome.storage.sync whenever config changes (after initial load)
  useEffect(() => {
    if (!loaded) return;
    chrome.storage.sync.set({ [SETTINGS_KEY]: config });
  }, [config, loaded]);

  const toggleFormat = (format: SupportedFormat) => {
    setConfig((prev) => ({
      ...prev,
      enabledFormats: prev.enabledFormats.includes(format)
        ? prev.enabledFormats.filter((f) => f !== format)
        : [...prev.enabledFormats, format],
    }));
  };

  return (
    <div className="popup">
      <h2>Prettify Plus</h2>
      <section>
        <h3>Enabled Formats</h3>
        {ALL_FORMATS.map((f) => (
          <label key={f} className="checkbox-row">
            <input
              type="checkbox"
              checked={config.enabledFormats.includes(f)}
              onChange={() => toggleFormat(f)}
            />
            {f.toUpperCase()}
          </label>
        ))}
      </section>
      <section>
        <h3>Theme</h3>
        <select
          value={config.theme}
          onChange={(e) =>
            setConfig((prev) => ({ ...prev, theme: e.target.value as ViewerConfig['theme'] }))
          }
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </section>
      <section>
        <h3>Font Size</h3>
        <input
          type="range"
          min={10}
          max={24}
          value={config.fontSize}
          onChange={(e) => setConfig((prev) => ({ ...prev, fontSize: Number(e.target.value) }))}
        />
        <span>{config.fontSize}px</span>
      </section>
      <section>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={config.enableDiff}
            onChange={() => setConfig((prev) => ({ ...prev, enableDiff: !prev.enableDiff }))}
          />
          Enable Diff View
        </label>
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={config.enableTypeGen}
            onChange={() => setConfig((prev) => ({ ...prev, enableTypeGen: !prev.enableTypeGen }))}
          />
          Enable Type Generation
        </label>
      </section>
    </div>
  );
}
