import React, { useState } from "react";
import {
  Activity,
  Check,
  Eye,
  EyeOff,
  Flame,
  Layers,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Users,
  Video,
} from "lucide-react";

const INTENSITY_OPTIONS = [
  { id: "low", label: "Low", stdDev: 1.6, scale: 0.75, opacity: 0.75 },
  { id: "medium", label: "Medium", stdDev: 2.3, scale: 1.0, opacity: 0.88 },
  { id: "high", label: "High", stdDev: 3.1, scale: 1.35, opacity: 0.98 },
];

export default function StoreHeatmapCanvas({
  zones = [],
  points = [],
  densityGrid = [],
  movementTrails = [],
  metric = "Traffic Density",
  metricKey = "traffic",
  connected = true,
  hasData = true,
  statusMessage = "",
  selectedZoneId = null,
  onSelectZone,
}) {
  const [zoom, setZoom] = useState(1);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showTrails, setShowTrails] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [intensity, setIntensity] = useState("medium");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  const activeIntensity = INTENSITY_OPTIONS.find((i) => i.id === intensity) || INTENSITY_OPTIONS[1];

  const getHeatFill = (intVal) => {
    switch (intVal) {
      case "peak":
        return "rgba(220, 38, 38, 0.72)";
      case "high":
        return "rgba(249, 115, 22, 0.55)";
      case "medium":
        return "rgba(245, 158, 11, 0.38)";
      case "low":
      default:
        return "rgba(16, 185, 129, 0.24)";
    }
  };

  const getStatusColor = (status, isSelected) => {
    if (isSelected) {
      return {
        fill: "rgba(59, 130, 246, 0.22)",
        stroke: "#3b82f6",
        strokeWidth: "1.2",
        text: "#60a5fa",
      };
    }
    switch (status) {
      case "High":
      case "High Heat":
      case "Crowded":
      case "Bottleneck":
        return {
          fill: "rgba(245, 158, 11, 0.12)",
          stroke: "#f59e0b",
          strokeWidth: "0.6",
          text: "#f59e0b",
        };
      case "Normal":
        return {
          fill: "rgba(16, 185, 129, 0.08)",
          stroke: "#10b981",
          strokeWidth: "0.5",
          text: "#10b981",
        };
      case "Low":
        return {
          fill: "rgba(59, 130, 246, 0.08)",
          stroke: "#3b82f6",
          strokeWidth: "0.5",
          text: "#3b82f6",
        };
      case "Empty":
      default:
        return {
          fill: "rgba(100, 116, 139, 0.05)",
          stroke: "#475569",
          strokeWidth: "0.4",
          text: "#94a3b8",
        };
    }
  };

  const getTrafficBadge = (share) => {
    const num = parseFloat(share) || 0;
    if (num >= 30) return { bg: "rgba(239, 68, 68, 0.2)", text: "#ef4444", label: "HIGH TRAFFIC" };
    if (num >= 15) return { bg: "rgba(245, 158, 11, 0.2)", text: "#f59e0b", label: "MEDIUM" };
    return { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", label: "NORMAL" };
  };

  const getPointColor = (pt) => {
    if (pt.track_id?.includes("G") || pt.track_id?.includes("GLOBAL")) return "#22c55e"; // Re-ID match
    if (pt.camera_id === "camera_02") return "#c084fc"; // C2 purple
    return "#38bdf8"; // C1 sky blue
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
      {/* Control Bar: Layer Toggles, Intensity, and Zoom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Store Spatial Coordinate Map
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            [100% × 70% Layout] · Mode: {metric}
          </span>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Heatmap Layer Toggle */}
          <button
            onClick={() => setShowHeatmap((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
              showHeatmap
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title="Toggle Heatmap Density Layer"
          >
            <Flame className="w-3 h-3" />
            Heatmap: {showHeatmap ? "ON" : "OFF"}
          </button>

          {/* Zone Overlay Toggle */}
          <button
            onClick={() => setShowZones((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
              showZones
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title="Toggle Zone Polygon Overlay"
          >
            <MapPin className="w-3 h-3" />
            Zones: {showZones ? "ON" : "OFF"}
          </button>

          {/* Customer Paths Toggle */}
          <button
            onClick={() => setShowTrails((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
              showTrails
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title="Toggle Customer Movement Vectors"
          >
            <Navigation className="w-3 h-3" />
            Paths ({movementTrails.length}): {showTrails ? "ON" : "OFF"}
          </button>

          {/* Customer Points Toggle */}
          <button
            onClick={() => setShowPoints((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all border ${
              showPoints
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            title="Toggle Raw Customer Footprint Positions"
          >
            <Users className="w-3 h-3" />
            Points ({points.length}): {showPoints ? "ON" : "OFF"}
          </button>

          {/* Heatmap Intensity Selector */}
          <div className="inline-flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 px-1.5 uppercase">
              Intensity:
            </span>
            {INTENSITY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setIntensity(opt.id)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  intensity === opt.id
                    ? "bg-slate-900 text-white dark:bg-blue-600 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Zone Labels Toggle */}
          <button
            onClick={() => setShowLabels((v) => !v)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all border ${
              showLabels
                ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 border-blue-500/40"
                : "bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
            title="Toggle Zone Labels"
          >
            <Tag className="w-3 h-3" />
            Labels: {showLabels ? "Show" : "Hide"}
          </button>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
            className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
            className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded border border-slate-200 dark:border-slate-700"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative overflow-hidden bg-slate-950 p-2 select-none min-h-[380px] flex items-center justify-center">
        <svg
          viewBox="0 0 100 70"
          className="w-full h-auto block max-h-[520px]"
          role="img"
          aria-label="Store Floor Heatmap and Zones"
        >
          <defs>
            <filter id="heatFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={activeIntensity.stdDev} />
            </filter>
            <marker
              id="trailArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="4"
              markerHeight="4"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#60a5fa" opacity="0.85" />
            </marker>
          </defs>

          <g transform={`translate(${50 - 50 / zoom} ${35 - 35 / zoom}) scale(${zoom})`}>
            {/* Store Floor Boundary */}
            <rect
              x="0.5"
              y="0.5"
              width="99"
              height="69"
              rx="1.5"
              fill="rgba(15, 23, 42, 0.96)"
              stroke="#334155"
              strokeWidth="0.5"
              strokeDasharray="2 1"
            />

            {/* Zone Polygons Layer */}
            {showZones &&
              zones.map((z) => {
                if (!Array.isArray(z.polygon) || z.polygon.length === 0) return null;
                const pts = z.polygon.map((p) => p.join(",")).join(" ");
                const cx = z.polygon.reduce((a, p) => a + p[0], 0) / z.polygon.length;
                const cy = z.polygon.reduce((a, p) => a + p[1], 0) / z.polygon.length;
                const isSelected = selectedZoneId === z.id;
                const isHovered = hoveredZone?.id === z.id;
                const colors = getStatusColor(z.status, isSelected || isHovered);
                const traffic = getTrafficBadge(z.trafficShare);

                return (
                  <g
                    key={z.id}
                    onClick={() => onSelectZone?.(z.id)}
                    onMouseEnter={() => setHoveredZone(z)}
                    onMouseLeave={() => setHoveredZone(null)}
                    className="cursor-pointer"
                  >
                    <polygon
                      points={pts}
                      fill={colors.fill}
                      stroke={colors.stroke}
                      strokeWidth={colors.strokeWidth}
                      strokeDasharray={z.kind === "entry" || z.kind === "exit" ? "1.5 1" : "none"}
                      className="transition-all duration-200"
                    />

                    {/* Zone Highlight Halo if selected */}
                    {isSelected && (
                      <polygon
                        points={pts}
                        fill="none"
                        stroke="#60a5fa"
                        strokeWidth="1.8"
                        strokeOpacity="0.8"
                        strokeDasharray="2 1"
                      />
                    )}

                    {showLabels && (
                      <>
                        <text
                          x={cx}
                          y={cy - 1.5}
                          textAnchor="middle"
                          fontSize="2.5"
                          fontWeight="800"
                          fill={isSelected ? "#93c5fd" : "#f1f5f9"}
                          className="uppercase tracking-wider pointer-events-none drop-shadow-sm"
                        >
                          {z.name}
                        </text>
                        <text
                          x={cx}
                          y={cy + 1.5}
                          textAnchor="middle"
                          fontSize="2.2"
                          fontWeight="800"
                          fill="#ffffff"
                          className="pointer-events-none drop-shadow-sm"
                        >
                          {z.people ?? z.count ?? 0} {z.people === 1 || z.count === 1 ? "PERSON" : "PEOPLE"}
                        </text>
                        <text
                          x={cx}
                          y={cy + 4.0}
                          textAnchor="middle"
                          fontSize="1.8"
                          fontWeight="700"
                          fill={traffic.text}
                          className="uppercase tracking-wider pointer-events-none"
                        >
                          {traffic.label}
                        </text>
                      </>
                    )}
                  </g>
                );
              })}

            {/* Checkout POS Tills Visual Hint */}
            <rect
              x="28"
              y="60"
              width="24"
              height="4"
              rx="0.8"
              fill="rgba(30, 41, 59, 0.85)"
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
              POS / CASH REGISTERS
            </text>

            {/* Heat Density Grid Layer */}
            {showHeatmap && densityGrid.length > 0 && (
              <g filter="url(#heatFilter)" opacity={activeIntensity.opacity}>
                {densityGrid.map((cell, idx) => (
                  <circle
                    key={idx}
                    cx={cell.cx}
                    cy={cell.cy}
                    r={Math.max(2.4, cell.density * 6.5 * activeIntensity.scale)}
                    fill={getHeatFill(cell.intensity)}
                  />
                ))}
              </g>
            )}

            {/* Customer Movement Vectors / Trail Lines */}
            {showTrails && movementTrails.length > 0 && (
              <g opacity="0.8">
                {movementTrails.map((tr, idx) => (
                  <line
                    key={idx}
                    x1={tr.from_x}
                    y1={tr.from_y}
                    x2={tr.to_x}
                    y2={tr.to_y}
                    stroke="#60a5fa"
                    strokeWidth="0.4"
                    strokeDasharray="1.5 0.8"
                    markerEnd="url(#trailArrow)"
                  />
                ))}
              </g>
            )}

            {/* Raw Customer Footprint Tracking Points */}
            {showPoints && points.length > 0 && (
              <g>
                {points.map((pt, idx) => {
                  const isHovered = hoveredPoint === pt;
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 1.6 : 0.8}
                      fill={getPointColor(pt)}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? "0.4" : "0.15"}
                      opacity={isHovered ? 1 : 0.85}
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className="cursor-pointer transition-all"
                    />
                  );
                })}
              </g>
            )}
          </g>
        </svg>

        {/* Hovered Zone Interactive Tooltip */}
        {hoveredZone && (
          <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700 text-white rounded-lg p-3 text-xs shadow-xl pointer-events-none backdrop-blur-md min-w-[200px] space-y-1.5">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-bold text-sky-400 uppercase tracking-wider">
                {hoveredZone.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 capitalize">
                ({hoveredZone.kind})
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">CURRENT PEOPLE</span>
                <span className="font-bold text-white font-mono">
                  {hoveredZone.people ?? hoveredZone.count ?? 0}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">TRAFFIC SHARE</span>
                <span className="font-bold text-amber-400 font-mono">
                  {hoveredZone.trafficShare || `${hoveredZone.shareNum || 0}%`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">AVG DWELL</span>
                <span className="font-bold text-purple-400 font-mono">
                  {hoveredZone.avgDwell || "0m 00s"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">STATUS</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {hoveredZone.status || "Normal"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Hovered Point Tooltip */}
        {hoveredPoint && !hoveredZone && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700 text-white rounded px-2.5 py-1.5 text-[11px] font-mono shadow-md pointer-events-none backdrop-blur-sm">
            <span className="font-bold text-sky-400">Track ID: {hoveredPoint.track_id}</span>
            <span className="text-slate-400 ml-2">Zone: {hoveredPoint.zone}</span>
            <div className="text-slate-300">
              Pos: ({hoveredPoint.x}%, {hoveredPoint.y}%) · Dwell: {hoveredPoint.dwell}s
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Source: {hoveredPoint.camera_id === "camera_02" ? "Camera 02" : "Camera 01"}
            </div>
          </div>
        )}

        {/* Empty State Overlay */}
        {(!connected || !hasData || points.length === 0) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6 space-y-2">
            <Video className="w-8 h-8 text-amber-400" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              WAITING FOR CCTV DATA
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              {statusMessage || "No valid tracking points are currently available from the camera feeds."}
            </p>
          </div>
        )}
      </div>

      {/* Heatmap Legend + Camera Marker Guide (Requirement 10) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-xs">
        {/* Heat Intensity Scale */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Heatmap Density Scale:
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 border border-emerald-400" />
              Low (0–25%)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 border border-amber-400" />
              Medium (25–50%)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500/90 border border-orange-400" />
              High (50–75%)
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-rose-500" />
              Peak (75–100%)
            </span>
          </div>
        </div>

        {/* Camera Footprint Markers Guide */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            Tracking Points:
          </span>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Cam 01
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> Cam 02
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Re-ID Matched
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}