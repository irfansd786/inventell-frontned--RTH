import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Lock, HelpCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MODULE_MAP } from '../../config/permissions';

export default function AccessDenied({ requiredPermission }) {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const moduleInfo = requiredPermission ? MODULE_MAP[requiredPermission] : null;

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center">
        {/* Warning Badge Icon */}
        <div className="w-14 h-14 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-5 text-amber-600 dark:text-amber-400 shadow-2xs">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-500/20">
          Authorization Guard
        </span>

        <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-3 tracking-tight">
          Access Restricted
        </h2>

        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
          You don't have permission to access this module.
        </p>

        {moduleInfo && (
          <div className="my-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-left text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Required Permission:</span>
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {moduleInfo.name} <span className="font-mono text-[10px] text-slate-400">({requiredPermission})</span>
            </p>
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
          Operational permissions are assigned by your system administrator. If your role requires access to this console, please contact management.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm inline-flex items-center justify-center gap-1.5"
          >
            Go to Assigned Work <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
