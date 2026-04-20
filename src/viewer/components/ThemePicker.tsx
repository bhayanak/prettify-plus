import type { ViewerConfig } from '@/shared/types';
import { THEMES } from '@/shared/constants';

interface ThemePickerProps {
  config: ViewerConfig;
  onThemeChange: (theme: ViewerConfig['theme']) => void;
}

export function ThemePicker({ config, onThemeChange }: ThemePickerProps) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <label style={{ fontSize: 12 }}>Theme:</label>
      <select
        value={config.theme}
        onChange={(e) => onThemeChange(e.target.value as ViewerConfig['theme'])}
        style={{
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          borderRadius: 4,
          padding: '4px 8px',
          fontSize: 12,
        }}
      >
        {THEMES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
