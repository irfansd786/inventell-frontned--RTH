import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, danger, text
  size = 'md', // sm, md, lg
  className = '',
  disabled = false,
  icon: Icon,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-xs active:bg-emerald-800',
    secondary: 'bg-slate-800 hover:bg-slate-900 text-slate-100 dark:bg-slate-700 dark:hover:bg-slate-600 focus:ring-slate-500 active:bg-slate-950',
    outline: 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-emerald-500 active:bg-slate-100',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-xs active:bg-red-800',
    info: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-xs active:bg-blue-800',
    ai: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 shadow-xs active:bg-indigo-800',
    text: 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-slate-400',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {Icon && <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />}
      {children}
    </button>
  );
}
