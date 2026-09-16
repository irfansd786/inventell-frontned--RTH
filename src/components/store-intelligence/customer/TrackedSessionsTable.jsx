// Tracked Sessions — dense enterprise data table over real anonymous
// tracking records. Client-side search, status filter and sorting;
// every row comes from backend stable track IDs (Person 101… + camera).
// Compact mode shows 6 rows; "View All" expands the full list.

import React, { useMemo, useState } from 'react';
import { Users, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import SectionCard from './SectionCard';
import { EmptyState } from './states';

const STATUS_OPTIONS = ['All', 'Active', 'Exited'];
const COMPACT_ROWS = 8;

function sortValue(s, key) {
  if (key === 'dwell') return s.dwell_secs ?? 0;
  if (key === 'entry') return s.entry_time ?? '';
  return s.raw_id ?? 0;
}

function SortHeader({ label, k, sortKey, sortDir, onToggle }) {
  const active = sortKey === k;
  const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th className="py-1.5 pr-3 font-bold whitespace-nowrap">
      <button
        onClick={() => onToggle(k)}
        aria-label={`Sort by ${label}`}
        className={`inline-flex items-center gap-1 uppercase tracking-wider text-[10px] font-bold ${
          active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        {label} <Icon className="w-3 h-3" />
      </button>
    </th>
  );
}

export default function TrackedSessionsTable({ sessions, hasData }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [sortKey, setSortKey] = useState('person');
  const [sortDir, setSortDir] = useState('asc');
  const [showAll, setShowAll] = useState(false);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (sessions || []).filter((s) => {
      if (status !== 'All' && s.status !== status) return false;
      if (!q) return true;
      return [s.person_id, s.current_zone, s.journey, s.camera_label]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return String(a.camera_id || '').localeCompare(String(b.camera_id || ''));
    });
  }, [sessions, query, status, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const visible = showAll ? rows : rows.slice(0, COMPACT_ROWS);

  return (
    <SectionCard
      icon={Users}
      title="Tracked Sessions"
      subtitle="Live customer tracking sessions · anonymous IDs"
      source="CCTV Tracking · Camera 01 + Camera 02"
      action={
        rows.length > COMPACT_ROWS && (
          <button
            onClick={() => setShowAll((v) => !v)}
            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap"
          >
            {showAll ? 'Show less ↑' : `View All →`}
          </button>
        )
      }
    >
      {!hasData || (sessions || []).length === 0 ? (
        <EmptyState compact message="No tracked sessions for the selected period." />
      ) : (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="relative flex-1 min-w-0">
              <span className="sr-only">Search sessions</span>
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); }}
                placeholder="Search person, zone, journey or camera…"
                className="w-full text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-2.5 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </label>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg self-start" role="tablist" aria-label="Filter by status">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt} role="tab" aria-selected={status === opt}
                  onClick={() => setStatus(opt)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
                    status === opt
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium" role="status">
            Showing {visible.length} of {rows.length} sessions{(sessions || []).length !== rows.length ? ` (${sessions.length} total)` : ''}
          </p>

          {rows.length === 0 ? (
            <EmptyState compact message="No sessions match the current search or filter." />
          ) : (
            <div className="overflow-x-auto -mx-1 px-1">
              <table className="w-full text-xs min-w-[680px]">
                <thead>
                  <tr className="text-left border-b border-slate-100 dark:border-slate-800">
                    <SortHeader label="PERSON" k="person" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <SortHeader label="DURATION" k="entry" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <th className="py-1.5 pr-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap">CURRENT ZONE</th>
                    <SortHeader label="DWELL" k="dwell" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                    <th className="py-1.5 pr-3 font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">JOURNEY</th>
                    <th className="py-1.5 font-bold text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((s) => (
                    <tr key={`${s.camera_id}-${s.person_id}`} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200">
                      <td className="py-1.5 pr-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {s.person_id}
                        {s.camera_label && (
                          <span className="ml-1.5 px-1 py-px rounded text-[9px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {s.camera_label}
                          </span>
                        )}
                      </td>
                      <td className="py-1.5 pr-3 font-mono whitespace-nowrap">{s.entry_time}</td>
                      <td className="py-1.5 pr-3 whitespace-nowrap">{s.current_zone}</td>
                      <td className="py-1.5 pr-3 tabular-nums whitespace-nowrap">{s.dwell}</td>
                      <td className="py-1.5 pr-3 max-w-56 truncate" title={s.journey}>{s.journey}</td>
                      <td className="py-1.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold whitespace-nowrap ${
                          s.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
