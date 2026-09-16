import React, { useState, useMemo } from 'react';
import { History, Filter, Eye, AlertTriangle, CheckCircle2, Clock, Camera } from 'lucide-react';

export default function QueueAlertHistoryTable({
  alerts = [],
  onReviewAlert,
  selectedCamera = 'ALL',
}) {
  const [filterCamera, setFilterCamera] = useState('ALL');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filteredAlerts = useMemo(() => {
    return (alerts || []).filter((a) => {
      if (filterCamera !== 'ALL') {
        const camMatch = (a.camera_id === filterCamera) || (a.camera?.toLowerCase().includes(filterCamera.toLowerCase()));
        if (!camMatch) return false;
      }
      if (filterSeverity !== 'ALL') {
        if ((a.severity || '').toUpperCase() !== filterSeverity.toUpperCase()) return false;
      }
      if (filterStatus !== 'ALL') {
        if ((a.status || '').toUpperCase() !== filterStatus.toUpperCase()) return false;
      }
      return true;
    });
  }, [alerts, filterCamera, filterSeverity, filterStatus]);

  const getSeverityBadge = (sev) => {
    const s = (sev || 'HIGH').toUpperCase();
    if (s === 'CRITICAL' || s === 'HIGH') {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    }
    if (s === 'MODERATE' || s === 'MEDIUM') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
  };

  const getStatusBadge = (status) => {
    const st = (status || 'Active').toUpperCase();
    if (st === 'ACTIVE') {
      return 'bg-red-500 text-white font-bold animate-pulse';
    }
    if (st === 'ACTION DISPATCHED' || st === 'ACTION TAKEN') {
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-500/20';
    }
    if (st === 'RESOLVED') {
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20';
    }
    return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg p-3.5 shadow-sm space-y-3">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
              Recent Queue Alerts
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Historical threshold breaches, operational recommendations, and resolution timeline
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Camera Filter */}
          <select
            value={filterCamera}
            onChange={(e) => setFilterCamera(e.target.value)}
            className="h-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 px-2 cursor-pointer"
          >
            <option value="ALL">All Cameras</option>
            <option value="camera_01">Camera 01</option>
            <option value="camera_02">Camera 02</option>
          </select>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="h-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 px-2 cursor-pointer"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MODERATE">Moderate</option>
            <option value="NORMAL">Normal</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-7 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 px-2 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ACTION DISPATCHED">Action Dispatched</option>
            <option value="DISMISSED">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-slate-800">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-slate-800">
              <th className="py-2.5 px-3">Time</th>
              <th className="py-2.5 px-3">Camera</th>
              <th className="py-2.5 px-3">Queue Length</th>
              <th className="py-2.5 px-3">Threshold</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Severity</th>
              <th className="py-2.5 px-3">Recommendation</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {filteredAlerts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                  No queue alerts match the selected criteria.
                </td>
              </tr>
            ) : (
              filteredAlerts.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {row.time}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200 whitespace-nowrap">
                    {row.camera}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {row.queue_length} people
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {row.threshold} threshold
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {row.duration}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityBadge(
                        row.severity
                      )}`}
                    >
                      {row.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                    {row.recommendation}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span
                      className={`inline-block text-[10px] px-2 py-0.5 rounded font-medium ${getStatusBadge(
                        row.status
                      )}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onReviewAlert?.(row)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Review</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}