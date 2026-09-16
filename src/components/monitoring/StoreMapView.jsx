import React, { useMemo, useState } from 'react';
import { Plus, Minus, RotateCcw, Tag, Users } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ZONE_DEFS, zoneStatusColor } from '../../utils/store3d';

/**
 * 2D top-down store map (SVG, viewBox 0 0 100 70 — percent coordinates).
 * Provides a clear upside (overhead) architectural view of the entire store floor,
 * including shelf aisles, checkout lanes, entry/exit gates, and real-time customer tracks.
 */
export default function StoreMapView({ zones = [], people = [], selectedId, onSelectPerson, connected }) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [zoom, setZoom] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [showIds, setShowIds] = useState(true);

  const personsOnly = useMemo(
    () =>
      (people || []).filter(
        (p) =>
          (p.class_id === undefined || p.class_id === 0) &&
          (p.class_name === undefined || p.class_name === null || String(p.class_name).toLowerCase() === 'person')
      ),
    [people]
  );

  // Merge live zone counts with fixed ZONE_DEFS geometry so every zone is always visible
  const mergedZones = useMemo(() => {
    const liveMap = new Map((zones || []).map((z) => [z.id, z]));
    return ZONE_DEFS.map((def) => {
      const live = liveMap.get(def.id);
      const [x0, y0, x1, y1] = def.rect;
      const count = live?.count ?? 0;
      const status = live?.status ?? (count > 0 ? 'normal' : 'empty');
      return {
        ...def,
        x: x0,
        y: y0,
        w: x1 - x0,
        h: y1 - y0,
        cx: (x0 + x1) / 2,
        cy: (y0 + y1) / 2,
        count,
        status,
      };
    });
  }, [zones]);

  return (
    <div className="relative w-full h-full min-h-[560px] flex items-center justify-center select-none overflow-hidden bg-slate-50 dark:bg-[#070f22]">
      {/* Floating 2D Controls Toolbar (Upside) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200 dark:border-slate-800 shadow-lg">
        <button
          onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Zoom in"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Zoom out"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setZoom(1)}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
          title="Reset zoom"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
        <button
          onClick={() => setShowLabels(!showLabels)}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
            showLabels
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Toggle zone labels"
        >
          <Tag className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => setShowIds(!showIds)}
          className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
            showIds
              ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Toggle person IDs"
        >
          <Users className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Canvas (viewBox -1 -1 102 72) */}
      <svg
        viewBox="-1 -1 102 72"
        className="w-full h-full block p-2"
        style={{ touchAction: 'none' }}
        role="img"
        aria-label="2D store floor map upside view"
      >
        <defs>
          <pattern id="storeGrid2d" width="4" height="4" patternUnits="userSpaceOnUse">
            <path
              d="M 4 0 L 0 0 0 4"
              fill="none"
              stroke={dark ? 'rgba(51, 65, 85, 0.25)' : 'rgba(203, 213, 225, 0.45)'}
              strokeWidth="0.15"
            />
          </pattern>
        </defs>

        <g transform={`translate(${50 - 50 / zoom} ${35 - 35 / zoom}) scale(${zoom})`}>
          {/* Store Floor Background with blueprint grid */}
          <rect
            x="0.5"
            y="0.5"
            width="99"
            height="69"
            rx="2"
            fill={dark ? '#0c162d' : '#f8fafc'}
            stroke={dark ? '#334155' : '#cbd5e1'}
            strokeWidth="0.7"
          />
          <rect x="0.5" y="0.5" width="99" height="69" fill="url(#storeGrid2d)" rx="2" />

          {/* Zones */}
          {mergedZones.map((z) => {
            const isEntry = z.id === 'entry';
            const isExit = z.id === 'exit';
            const isCheckout = z.id === 'checkout';
            const color = zoneStatusColor(z.status, dark);

            return (
              <g key={z.id}>
                {/* Zone Area Fill & Outline */}
                <rect
                  x={z.x}
                  y={z.y}
                  width={z.w}
                  height={z.h}
                  rx="1.2"
                  fill={
                    isEntry
                      ? dark ? 'rgba(5, 150, 105, 0.18)' : 'rgba(16, 185, 129, 0.14)'
                      : isExit
                      ? dark ? 'rgba(220, 38, 38, 0.18)' : 'rgba(239, 68, 68, 0.14)'
                      : dark ? `${color}20` : `${color}18`
                  }
                  stroke={isEntry ? '#059669' : isExit ? '#dc2626' : color}
                  strokeWidth="0.5"
                  strokeDasharray={isEntry || isExit ? '1.5 0.8' : 'none'}
                />

                {/* Shelf aisles inside shelf zones */}
                {!isEntry && !isExit && !isCheckout && (
                  <g opacity="0.7">
                    {/* Row 1 */}
                    <rect
                      x={z.x + z.w * 0.08}
                      y={z.y + z.h * 0.18}
                      width={z.w * 0.84}
                      height={z.h * 0.22}
                      rx="0.6"
                      fill={dark ? '#1e293b' : '#e2e8f0'}
                      stroke={dark ? '#475569' : '#94a3b8'}
                      strokeWidth="0.3"
                    />
                    {/* Row 2 */}
                    <rect
                      x={z.x + z.w * 0.08}
                      y={z.y + z.h * 0.60}
                      width={z.w * 0.84}
                      height={z.h * 0.22}
                      rx="0.6"
                      fill={dark ? '#1e293b' : '#e2e8f0'}
                      stroke={dark ? '#475569' : '#94a3b8'}
                      strokeWidth="0.3"
                    />
                  </g>
                )}

                {/* Checkout counters inside checkout zone */}
                {isCheckout && (
                  <g opacity="0.8">
                    {[0.12, 0.42, 0.72].map((off, i) => (
                      <g key={i} transform={`translate(${z.x + z.w * off} ${z.y + 0.4})`}>
                        <rect
                          x="0"
                          y="0"
                          width={z.w * 0.2}
                          height={z.h - 0.8}
                          rx="0.6"
                          fill={dark ? '#1e293b' : '#cbd5e1'}
                          stroke={dark ? '#475569' : '#94a3b8'}
                          strokeWidth="0.3"
                        />
                        <rect
                          x={z.w * 0.14}
                          y="0.2"
                          width={z.w * 0.05}
                          height={z.h - 1.2}
                          rx="0.2"
                          fill="#10b981"
                        />
                      </g>
                    ))}
                  </g>
                )}

                {/* Entry / Exit Arrows & Badges */}
                {isEntry && (
                  <text
                    x={z.cx}
                    y={z.cy + 1}
                    textAnchor="middle"
                    fontSize="2.4"
                    fontWeight="900"
                    fill="#059669"
                    letterSpacing="0.4"
                  >
                    ENTRY ↓
                  </text>
                )}
                {isExit && (
                  <text
                    x={z.cx}
                    y={z.cy + 1}
                    textAnchor="middle"
                    fontSize="2.4"
                    fontWeight="900"
                    fill="#dc2626"
                    letterSpacing="0.4"
                  >
                    EXIT ↑
                  </text>
                )}

                {/* Zone Labels for shelf & checkout areas */}
                {showLabels && !isEntry && !isExit && (
                  <g>
                    <rect
                      x={z.cx - (z.name.length * 0.85 + 2)}
                      y={z.cy - 1.8}
                      width={z.name.length * 1.7 + 4}
                      height="3.6"
                      rx="0.8"
                      fill={dark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)'}
                      stroke={color}
                      strokeWidth="0.3"
                    />
                    <text
                      x={z.cx}
                      y={z.cy + 0.5}
                      textAnchor="middle"
                      fontSize="1.8"
                      fontWeight="800"
                      letterSpacing="0.2"
                      fill={dark ? '#f1f5f9' : '#0f172a'}
                    >
                      {z.name}
                    </text>
                    <text
                      x={z.cx}
                      y={z.cy + (isCheckout ? -2.6 : 3.8)}
                      textAnchor="middle"
                      fontSize="1.5"
                      fontWeight="700"
                      fill={color}
                    >
                      {z.count} {z.count === 1 ? 'person' : 'people'}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Customer / Person dots — real tracked person data only */}
          {personsOnly.map((p) => {
            const isSel = String(selectedId) === String(p.id);
            const conf = p.confidence ? `${Math.round(Number(p.confidence) * 100)}%` : null;

            return (
              <g
                key={`${p.cam || 'c1'}:${p.id}`}
                transform={`translate(${p.x} ${p.y})`}
                onClick={() => onSelectPerson?.(p.id)}
                className="cursor-pointer"
              >
                {/* Outer radar pulse circle */}
                <circle
                  r={isSel ? 3.4 : 2.4}
                  fill="none"
                  stroke={isSel ? '#f59e0b' : p.is_merged ? '#c084fc' : '#10b981'}
                  strokeWidth="0.45"
                  opacity="0.6"
                />

                {/* Core position dot */}
                <circle
                  r={isSel ? 1.8 : 1.3}
                  fill={isSel ? '#f59e0b' : p.is_merged ? '#a855f7' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth="0.4"
                />

                {/* Floating ID badge on map */}
                {showIds && (
                  <g transform="translate(0, -2.8)">
                    <rect
                      x="-4.5"
                      y="-1.8"
                      width="9"
                      height="2.8"
                      rx="0.7"
                      fill={dark ? 'rgba(2, 6, 23, 0.92)' : 'rgba(255, 255, 255, 0.95)'}
                      stroke={isSel ? '#f59e0b' : p.is_merged ? '#a855f7' : '#10b981'}
                      strokeWidth="0.3"
                    />
                    <text
                      x="0"
                      y="0.2"
                      textAnchor="middle"
                      fontSize="1.5"
                      fontWeight="800"
                      fill={dark ? '#ffffff' : '#0f172a'}
                    >
                      {p.global_code || (p.global_id ? `G${String(p.global_id).padStart(2, '0')}` : `P${p.id}`)}
                    </text>
                  </g>
                )}

                <title>{`${p.global_label || `Person ${p.id}`}${p.is_merged ? ' [Linked C1+C2]' : ''} · ${p.zone || p.zone_name || 'In Store'}${conf ? ` · ${conf}` : ''}`}</title>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Disconnected overlay */}
      {!connected && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px] pointer-events-none z-20">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2">
            Detection engine not connected — start processing to see live tracks
          </p>
        </div>
      )}
    </div>
  );
}
