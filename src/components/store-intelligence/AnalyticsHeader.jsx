import React from 'react';
import { Store, RefreshCw, Download } from 'lucide-react';
import Button from '../common/Button';
import { STORE_INFO } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';

export default function AnalyticsHeader({ title, subtitle, onRefresh, onExport }) {
  const { toast } = useToast();
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 uppercase tracking-wider">
            <Store className="w-3 h-3 text-emerald-600" /> {STORE_INFO.name} ({STORE_INFO.id})
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {onRefresh && (
          <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRefresh}>
            Refresh
          </Button>
        )}
        <Button
          variant="secondary"
          size="sm"
          icon={Download}
          onClick={() =>
            onExport
              ? onExport()
              : toast.info('Exporting Report', 'Generating and downloading intelligence report...')
          }
        >
          Export Report
        </Button>
      </div>
    </div>
  );
}
