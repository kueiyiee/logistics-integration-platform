import React, { useMemo } from 'react';
import { useTheme } from '../../hooks/useTheme';

const modeLabels: Record<string, string> = {
  system: 'Auto',
  light: 'Light',
  dark: 'Dark',
  'high-contrast': 'Contrast',
};

const modeIcons: Record<string, string> = {
  system: '🖥️',
  light: '☀️',
  dark: '🌙',
  'high-contrast': '⚡',
};

const modeOrder: Array<'system' | 'dark' | 'light' | 'high-contrast'> = ['system', 'dark', 'light', 'high-contrast'];

export function ThemeToggle() {
  const { mode, resolvedMode, setThemeMode } = useTheme();

  const buttonLabel = useMemo(() => modeLabels[mode] || 'Theme', [mode]);
  const buttonIcon = useMemo(() => modeIcons[mode] || '🎨', [mode]);
  const isLightMode = resolvedMode === 'light';

  const buttonTextColor = 'var(--text-primary)';
  const buttonBackground = 'var(--surface-2)';
  const buttonBorder = '1px solid var(--border)';
  const iconBackground = 'var(--surface-3)';
  const iconColor = 'var(--accent)';
  const labelColor = 'var(--text-muted)';

  const handleToggle = () => {
    const nextIndex = (modeOrder.indexOf(mode) + 1) % modeOrder.length;
    setThemeMode(modeOrder[nextIndex]);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`${buttonLabel}, change theme mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.7rem',
        borderRadius: 999,
        border: buttonBorder,
        background: buttonBackground,
        color: buttonTextColor,
        padding: '0.75rem 1rem',
        fontSize: '0.92rem',
        fontWeight: 700,
        boxShadow: isLightMode ? '0 18px 40px rgba(15,23,42,0.08)' : '0 18px 40px rgba(15,23,42,0.16)',
        backdropFilter: isLightMode ? 'none' : 'blur(16px)',
        transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(event) => {
        (event.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(event) => {
        (event.currentTarget as HTMLButtonElement).style.transform = 'translateY(0px)';
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 30,
          height: 30,
          borderRadius: 999,
          background: iconBackground,
          color: iconColor,
          boxShadow: isLightMode ? 'inset 0 0 0 1px rgba(15,23,42,0.06)' : 'inset 0 0 0 1px rgba(255,255,255,0.08)',
        }}
      >
        {buttonIcon}
      </span>
      <span style={{ minWidth: 56 }}>{buttonLabel}</span>
      <span style={{ fontSize: '0.85rem', color: labelColor }}>⟳</span>
    </button>
  );
}
