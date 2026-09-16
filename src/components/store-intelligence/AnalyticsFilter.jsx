import React from 'react';
import { Calendar, Clock, Filter, Layers } from 'lucide-react';

export default function AnalyticsFilter({
  dateRange,
  setDateRange,
  timeRange,
  setTimeRange,
  selectedMetric,
  setSelectedMetric,
  metricsList = [],
}) {
  return (
    <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      {/* Date Range Selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-slate-400" /> Range:
        </span>
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
          {['Today', '7 Days', '30 Days'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange && setDateRange(range)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                dateRange === range
                  ? 'bg-white text-slate-900 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range Selector */}
      {timeRange !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Time:
          </span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange && setTimeRange(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Operating Hours</option>
            <option value="Morning">Morning (8 AM - 12 PM)</option>
            <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
            <option value="Evening">Evening Peak (4 PM - 8 PM)</option>
          </select>
        </div>
      )}

      {/* Metric Selector (if applicable) */}
      {metricsList.length > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Metric:
          </span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
            {metricsList.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric && setSelectedMetric(m)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedMetric === m
                    ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
