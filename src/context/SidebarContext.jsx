import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SIDEBAR_KEY = 'invintell_sidebar_collapsed';

function readCollapsed() {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1';
  } catch {
    return false;
  }
}

const SidebarContext = createContext(null);

/**
 * Global sidebar state — single source of truth for the entire website.
 * - collapsed: desktop rail state (240px open / 70px closed), persisted.
 * - mobileOpen: mobile drawer state (not persisted, always starts closed).
 * - toggle(): hamburger behavior — collapses on desktop, opens drawer on mobile.
 */
export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);

  const setCollapsedPersisted = useCallback((value) => {
    setCollapsed(value);
    try {
      localStorage.setItem(SIDEBAR_KEY, value ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches) {
      setCollapsedPersisted(!collapsed);
    } else {
      setMobileOpen((o) => !o);
    }
  }, [collapsed, setCollapsedPersisted]);

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed: setCollapsedPersisted,
      mobileOpen,
      setMobileOpen,
      toggle,
    }),
    [collapsed, mobileOpen, setCollapsedPersisted, toggle]
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within a SidebarProvider');
  return ctx;
}
