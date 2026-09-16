import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from 'react';
import { THEME_KEY } from '../config/api';

const ThemeContext = createContext(null);

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  // Default theme is LIGHT for SIH presentation readiness.
  return 'light';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const chartTheme = useMemo(
    () => ({
      axisStroke: theme === 'dark' ? '#94a3b8' : '#64748b',
      gridStroke: theme === 'dark' ? '#1e293b' : '#e2e8f0',
      tooltipBg: theme === 'dark' ? '#1e293b' : '#ffffff',
      tooltipBorder: theme === 'dark' ? '#334155' : '#e2e8f0',
      tooltipText: theme === 'dark' ? '#f8fafc' : '#0f172a',
      primary: theme === 'dark' ? '#3b82f6' : '#2563eb', // Blue
      emerald: theme === 'dark' ? '#10b981' : '#059669', // Emerald (Brand / Success)
      success: theme === 'dark' ? '#10b981' : '#059669', // Emerald
      info: theme === 'dark' ? '#3b82f6' : '#2563eb',    // Blue
      warning: theme === 'dark' ? '#f59e0b' : '#d97706', // Amber
      danger: theme === 'dark' ? '#ef4444' : '#dc2626',  // Red
      ai: theme === 'dark' ? '#818cf8' : '#4f46e5',      // Indigo
      neutral: theme === 'dark' ? '#94a3b8' : '#64748b', // Slate
    }),
    [theme]
  );

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', setTheme, toggleTheme, chartTheme }),
    [theme, toggleTheme, chartTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
