import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useSidebar } from '../../context/SidebarContext';

/**
 * Global application layout (applies to the entire website):
 *
 *   flex row: [ Sidebar (flex-shrink-0) | Main (flex-1, min-w-0) ]
 *
 * No fixed margins or absolute positioning — the main area automatically
 * consumes all remaining horizontal space and expands when the sidebar
 * collapses. Content uses full available width (no max-w container).
 */
export default function AppLayout({ children }) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex min-h-screen w-full min-w-0" style={{ backgroundColor: 'var(--color-background-soft)' }}>
      {/* Sidebar — in-flow sticky column on desktop, overlay drawer on mobile */}
      <Sidebar isOpen={mobileOpen} setIsOpen={setMobileOpen} collapsed={collapsed} />

      {/* Main area: navbar + content, always fills remaining width */}
      <div className="flex min-h-screen flex-1 min-w-0 flex-col">
        <Topbar />
        <main className="w-full min-w-0 max-w-none flex-1 p-4 md:p-6 xl:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
