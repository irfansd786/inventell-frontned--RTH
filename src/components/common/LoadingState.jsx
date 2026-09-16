import React from 'react';
import { RefreshCw } from 'lucide-react';

export default function LoadingState({ message = 'Loading intelligence telemetry...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-3 bg-white border border-slate-200 rounded-2xl shadow-2xs">
      <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin" />
      <p className="text-xs font-semibold text-slate-700">{message}</p>
    </div>
  );
}
