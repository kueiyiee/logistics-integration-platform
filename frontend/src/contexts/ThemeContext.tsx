import React, { createContext, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system' | 'high-contrast';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark' | 'high-contrast';
  setThemeMode: (mode: ThemeMode) => void;
}

const storageKey = '3pdms_theme';

export const ThemeContext = createContext<ThemeContextValue>({
  mode: 'system',
  resolvedMode: 'dark',
  setThemeMode: () => undefined,
});

interface ThemeProviderProps {
  children: ReactNode;
}

const getPreferredTheme = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyThemeClass = (theme: 'light' | 'dark' | 'high-contrast') => {
  document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
  document.documentElement.classList.add(`theme-${theme}`);
  document.documentElement.style.colorScheme = theme === 'light' ? 'light' : 'dark';
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return (localStorage.getItem(storageKey) as ThemeMode) || 'system';
  });

  const prefersDark = useMemo(() => window.matchMedia('(prefers-color-scheme: dark)'), []);

  const resolvedMode = useMemo(() => {
    if (mode === 'system') {
      return prefersDark.matches ? 'dark' : 'light';
    }

    return mode === 'high-contrast' ? 'high-contrast' : mode;
  }, [mode, prefersDark.matches]);

  useEffect(() => {
    applyThemeClass(resolvedMode);
  }, [resolvedMode]);

  useEffect(() => {
    const listener = (event: MediaQueryListEvent) => {
      if (mode === 'system') {
        applyThemeClass(event.matches ? 'dark' : 'light');
      }
    };

    prefersDark.addEventListener('change', listener);
    return () => prefersDark.removeEventListener('change', listener);
  }, [mode, prefersDark]);

  const setThemeMode = useCallback((nextMode: ThemeMode) => {
    setMode(nextMode);
    localStorage.setItem(storageKey, nextMode);
  }, []);

  const value = useMemo(
    () => ({ mode, resolvedMode, setThemeMode }),
    [mode, resolvedMode, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
