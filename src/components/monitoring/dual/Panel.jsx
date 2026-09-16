// Compact enterprise console panel. Dense, subtle border, minimal shadow,
// small-caps section header. Dark-mode aware.

import React from 'react';

export default function Panel({ title, hint, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.06)] ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="min-w-0">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 dark:text-slate-200">
              {title}
            </h2>
            {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{hint}</p>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </header>
      )}
      <div className={`px-4 py-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}

export function EmptyNote({ message }) {
  return (
    <p className="text-xs text-slate-400 dark:text-slate-500 font-medium py-6 text-center leading-relaxed">
      {message}
    </p>
  );
}

export function StatusDot({ tone, pulse = false }) {
  const colors = {
    green: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-rose-500',
    blue: 'bg-blue-500',
    slate: 'bg-slate-400',
  };
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {pulse && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${colors[tone] || colors.slate}`} />}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[tone] || colors.slate}`} />
    </span>
  );
}
