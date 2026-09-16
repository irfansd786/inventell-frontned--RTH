import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let globalToastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'success', title, message, duration = 4000 }) => {
      const id = ++globalToastId;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (title, message, duration) =>
      addToast({ type: 'success', title, message, duration }),
    error: (title, message, duration) =>
      addToast({ type: 'error', title, message, duration }),
    info: (title, message, duration) =>
      addToast({ type: 'info', title, message, duration }),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}

      {/* Floating In-App Toast Container */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
        aria-live="polite"
        role="region"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl rounded-2xl p-4 flex items-start gap-3 transition-all duration-200 animate-in slide-in-from-bottom-5 fade-in"
          >
            {/* Status Accent Icon */}
            {t.type === 'success' && (
              <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            )}
            {t.type === 'error' && (
              <div className="w-7 h-7 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4" />
              </div>
            )}
            {t.type === 'info' && (
              <div className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Info className="w-4 h-4" />
              </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0 pr-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {t.title}
              </p>
              {t.message && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t.message}
                </p>
              )}
            </div>

            {/* Manual Dismiss */}
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toast: {
        success: (title, msg) => console.log('[Toast success]', title, msg),
        error: (title, msg) => console.error('[Toast error]', title, msg),
        info: (title, msg) => console.info('[Toast info]', title, msg),
      },
    };
  }
  return ctx;
}
