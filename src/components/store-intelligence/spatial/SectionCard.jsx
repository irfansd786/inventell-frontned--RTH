import React from "react";

export default function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  source,
  children,
  className = "",
  bodyClassName = "",
  pad = true,
}) {
  return (
    <section
      className={`bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-sm min-w-0 flex flex-col ${className}`}
    >
      {(title || action) && (
        <header className="flex items-center justify-between gap-2 px-3.5 pt-3 pb-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" aria-hidden="true" />}
            <div className="min-w-0">
              {title && (
                <h2 className="text-[13px] font-bold text-slate-900 dark:text-white tracking-tight leading-tight truncate">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </header>
      )}
      <div className={`flex-1 min-h-0 ${pad ? "px-3.5 py-3" : ""} ${bodyClassName}`}>{children}</div>
      {source && (
        <p className="px-3.5 pb-2.5 pt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 border-t border-slate-50 dark:border-slate-800/40">
          Source: {source}
        </p>
      )}
    </section>
  );
}