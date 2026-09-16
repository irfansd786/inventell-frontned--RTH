import React from 'react';
import { Camera, CheckCircle2, AlertTriangle, ShieldCheck, Video, ArrowRight } from 'lucide-react';

export default function CameraQueueStatusCards({
  camerasSummary = {},
  selectedCamera = 'camera_01',
  onSelectCamera,
}) {
  const cam1 = camerasSummary.camera_01 || {
    camera_id: 'camera_01',
    name: 'Camera 01 — POS Checkout FOV',
    coverage: 'Primary POS & Checkout Zone',
    queue_length: 0,
    status: 'NORMAL',
    has_video: true,
    status_label: 'VIDEO ANALYSIS',
  };

  const cam2 = camerasSummary.camera_02 || {
    camera_id: 'camera_02',
    name: 'Camera 02 — Main Entrance & Aisles',
    coverage: 'Entrance, Shelf Aisles & Queue Inflow',
    queue_length: 0,
    status: 'NORMAL',
    has_video: true,
    status_label: 'VIDEO ANALYSIS',
  };

  const getStatusBadge = (status) => {
    const s = (status || 'NORMAL').toUpperCase();
    if (s === 'CRITICAL' || s === 'HIGH') {
      return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
    }
    if (s === 'MODERATE' || s === 'BUSY') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Camera Queue Status
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Independent CCTV coverage zones and cross-camera Re-ID verification
            </p>
          </div>
        </div>

        {camerasSummary.reid_active && (
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Cross-Camera Re-ID Deduplication Active</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Camera 01 Card */}
        <div
          onClick={() => onSelectCamera?.('camera_01')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCamera === 'camera_01'
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500/60 shadow-sm ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Camera 01
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  {cam1.status_label || 'VIDEO ANALYSIS'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                  cam1.status
                )}`}
              >
                {cam1.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              {cam1.coverage}
            </p>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {cam1.queue_length}{' '}
                  <span className="text-xs font-semibold text-slate-400">waiting</span>
                </span>
                <span className="block text-[10px] text-slate-400">Checkout Queue</span>
              </div>

              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>{selectedCamera === 'camera_01' ? 'Active Feed' : 'Select'}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Camera 02 Card */}
        <div
          onClick={() => onSelectCamera?.('camera_02')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCamera === 'camera_02'
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500/60 shadow-sm ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Camera 02
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  {cam2.status_label || 'VIDEO ANALYSIS'}
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(
                  cam2.status
                )}`}
              >
                {cam2.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              {cam2.coverage}
            </p>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {cam2.queue_length}{' '}
                  <span className="text-xs font-semibold text-slate-400">waiting</span>
                </span>
                <span className="block text-[10px] text-slate-400">Inflow / Queue</span>
              </div>

              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>{selectedCamera === 'camera_02' ? 'Active Feed' : 'Select'}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>

        {/* Unified Dual-Camera Store View */}
        <div
          onClick={() => onSelectCamera?.('all')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
            selectedCamera === 'all'
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 dark:border-blue-500/60 shadow-sm ring-1 ring-blue-500/20'
              : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Store Summary (Dual Cam)
                </h4>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/20 uppercase">
                Re-ID Synced
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Combined store-level observation • Zero cross-camera double counting
            </p>

            <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {Math.max(cam1.queue_length, cam2.queue_length) + (cam1.queue_length > 0 && cam2.queue_length > 0 ? 0 : 0)}{' '}
                  <span className="text-xs font-semibold text-slate-400">deduplicated</span>
                </span>
                <span className="block text-[10px] text-slate-400">Store Queue</span>
              </div>

              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>{selectedCamera === 'all' ? 'Active Feed' : 'Select'}</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}