// Data provenance badge — honest labeling of the three data worlds:
// Historical Dataset (M5/Retail sales), Current Video Session (CCTV),
// Demo Dataset (local constants used only when no source exists).
import React from 'react';

const STYLES = {
  historical: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
  session: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
  demo: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
};

export default function ProvenanceBadge({ kind = 'historical', text, title }) {
  return (
    <span
      title={title || text}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${STYLES[kind] || STYLES.historical}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {text}
    </span>
  );
}
