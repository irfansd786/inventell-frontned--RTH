import React from 'react';

export default function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  padding = true,
  noBorder = false,
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-lg ${
        noBorder ? '' : 'border border-slate-200/90 dark:border-slate-800 shadow-xs'
      } transition-all duration-200 ${className}`}
    >
      {(title || action || subtitle) && (
        <div
          className={`flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 ${headerClassName}`}
        >
          <div>
            {title && <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`${padding ? 'p-4' : ''} ${bodyClassName}`}>{children}</div>
    </div>
  );
}
