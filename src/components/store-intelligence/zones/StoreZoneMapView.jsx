import React, { useState } from "react";
import { Plus, Minus, RotateCcw, Tag, Users, Video } from "lucide-react";

export default function StoreZoneMapView({
  zones = [],
  people = [],
  selectedZoneId,
  onSelectZone,
  connected = true,
  hasData = true,
}) {
  const [zoom, setZoom] = useState(1);
  const [showPeople, setShowPeople] = useState(true);
  const [showLabels, setShowLabels] = useState(true);

  const getStatusColor = (status) => {
    switch (status) {
      case "Critical":
        return { fill: "rgba(220, 38, 38, 0.16)", stroke: "#dc2626", text: "#ef4444" };
      case "High":
        return { fill: "rgba(245, 158, 11, 0.14)", stroke: "#f59e0b", text: "#f59e0b" };
      case "Normal":
        return { fill: "rgba(16, 185, 129, 0.10)", stroke: "#10b981", text: "#10b981" };
      case "Low":
        return { fill: "rgba(59, 130, 246, 0.08)", stroke: "#3b82f6", text: "#3b82f6" };
      case "Empty":
      default:
        return { fill: "rgba(100, 116, 139, 0.05)", stroke: "#475569", text: "#94a3b8" };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden h-full">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Store Zone Layout Map
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            [100% × 70% Layout] · Click zone to inspect
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowPeople(!showPeople)}
            className={`p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 ${
              showPeople ? "text-blue-600 dark:text-blue-400" : ""
            }`}
            title="Toggle People Positions"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1 rounded text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 ${
              showLabels ? "text-blue-600 dark:text-blue-400" : ""
            }`}
            title="Toggle Zone Labels"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          <button
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative flex-1 bg-slate-950 p-2 overflow-hidden flex items-center justify-center min-h-[320px]">
        <svg
          viewBox="0 0 100 70"
          className="w-full h-auto block max-h-[460px]"
          role="img"
          aria-label="Store Zone Map"
        >
          <g transform={`translate(${50 - 50 / zoom} ${35 - 35 / zoom}) scale(${zoom})`}>
            {/* Store boundary */}
            <rect
              x="0.5"
              y="0.5"
              width="99"
              height="69"
              rx="1.5"
              fill="rgba(15, 23, 42, 0.95)"
              stroke="#334155"
              strokeWidth="0.5"
              strokeDasharray="2 1"
            />

            {/* Zone polygons */}
            {zones.map((z) => {
              if (!Array.isArray(z.polygon) || z.polygon.length === 0) return null;
              const pts = z.polygon.map((p) => p.join(",")).join(" ");
              const cx = z.polygon.reduce((a, p) => a + p[0], 0) / z.polygon.length;
              const cy = z.polygon.reduce((a, p) => a + p[1], 0) / z.polygon.length;
              const isSelected = selectedZoneId === z.id;
              const colors = getStatusColor(z.status);

              return (
                <g
                  key={z.id}
                  onClick={() => onSelectZone?.(z.id)}
                  className="cursor-pointer transition-opacity hover:opacity-90"
                >
                  <polygon
                    points={pts}
                    fill={isSelected ? "rgba(37, 99, 235, 0.22)" : colors.fill}
                    stroke={isSelected ? "#3b82f6" : colors.stroke}
                    strokeWidth={isSelected ? "0.8" : "0.4"}
                    strokeDasharray={z.kind === "entry" || z.kind === "exit" ? "1.5 1" : "none"}
                  />

                  {showLabels && (
                    <>
                      {/* Zone Name */}
                      <text
                        x={cx}
                        y={cy - 1.2}
                        textAnchor="middle"
                        fontSize="2.3"
                        fontWeight="700"
                        fill="#cbd5e1"
                        className="uppercase tracking-wider pointer-events-none"
                      >
                        {z.name}
                      </text>

                      {/* People Count */}
                      <text
                        x={cx}
                        y={cy + 1.6}
                        textAnchor="middle"
                        fontSize="2.1"
                        fontWeight="800"
                        fill="#ffffff"
                        className="pointer-events-none"
                      >
                        {z.count} {z.count === 1 ? "PERSON" : "PEOPLE"}
                      </text>

                      {/* Status Tag */}
                      <text
                        x={cx}
                        y={cy + 4.2}
                        textAnchor="middle"
                        fontSize="1.7"
                        fontWeight="800"
                        fill={colors.text}
                        className="uppercase tracking-wider pointer-events-none"
                      >
                        ● {z.status}
                      </text>
                    </>
                  )}
                </g>
              );
            })}

            {/* POS Checkout Counter Outline */}
            <rect
              x="28"
              y="60"
              width="24"
              height="4"
              rx="0.8"
              fill="rgba(30, 41, 59, 0.8)"
              stroke="#64748b"
              strokeWidth="0.35"
            />
            <text
              x="40"
              y="62.6"
              textAnchor="middle"
              fontSize="1.6"
              fontWeight="600"
              fill="#94a3b8"
            >
              POS CHECKOUT TILLS
            </text>

            {/* Real Tracked People Dots */}
            {showPeople &&
              people.map((p, idx) => (
                <g key={idx} transform={`translate(${p.x} ${p.y})`} className="pointer-events-none">
                  <circle
                    r="1.3"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="0.3"
                    className="animate-pulse"
                  />
                  <text
                    y="-1.8"
                    textAnchor="middle"
                    fontSize="1.6"
                    fontWeight="800"
                    fill="#ffffff"
                  >
                    {p.id}
                  </text>
                </g>
              ))}
          </g>
        </svg>

        {/* Empty state overlay */}
        {(!connected || !hasData) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Video className="w-8 h-8 text-amber-400" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              WAITING FOR CCTV DATA
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              No valid zone tracking coordinates are currently available. Connect cameras to stream telemetry.
            </p>
          </div>
        )}
      </div>

      {/* Footer status summary */}
      <div className="flex items-center justify-between px-3.5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-3">
          <span>● Normal</span>
          <span className="text-amber-500">● High</span>
          <span className="text-rose-500">● Critical</span>
          <span className="text-slate-400">● Empty</span>
        </div>
        <div className="font-mono">
          {people.length} active tracked {people.length === 1 ? "person" : "people"} on floor
        </div>
      </div>
    </div>
  );
}
