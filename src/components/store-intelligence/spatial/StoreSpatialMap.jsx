import React, { useState } from "react";
import {
  Flame,
  MapPin,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
  Users,
  Video,
} from "lucide-react";

const INTENSITIES = [
  { id: "low", label: "Low", stdDev: 1.6, scale: 0.8, opacity: 0.75 },
  { id: "medium", label: "Med", stdDev: 2.3, scale: 1.0, opacity: 0.88 },
  { id: "high", label: "High", stdDev: 3.1, scale: 1.35, opacity: 0.98 },
];

export default function StoreSpatialMap({
  zones = [],
  points = [],
  densityGrid = [],
  movementTrails = [],
  metric = "Traffic Density",
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
  const [intensity, setIntensity] = useState("medium");
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [hoveredZone, setHoveredZone] = useState(null);

  const activeIntensity =
    INTENSITIES.find((i) => i.id === intensity) || INTENSITIES[1];

  const getHeatColor = (intVal) => {
    switch (intVal) {
      case "peak":
        return "rgba(239, 68, 68, 0.75)";
      case "high":
        return "rgba(249, 115, 22, 0.58)";
      case "medium":
        return "rgba(245, 158, 11, 0.42)";
      case "low":
      default:
        return "rgba(16, 185, 129, 0.28)";
    }
  };

  const getPointColor = (pt) => {
    if (pt.track_id?.includes("G") || pt.track_id?.includes("GLOBAL")) {
      return "#10b981"; // Re-ID match emerald
    }
    if (pt.camera_id === "camera_02") {
      return "#a855f7"; // C2 purple
    }
    return "#38bdf8"; // C1 sky blue
  };

  const getZoneStyle = (zone, isSelected, isHovered) => {
    if (isSelected) {
      return {
        fill: "rgba(59, 130, 246, 0.25)",
        stroke: "#3b82f6",
        strokeWidth: 0.9,
      };
    }
    if (isHovered) {
      return {
        fill: "rgba(148, 163, 184, 0.2)",
        stroke: "#94a3b8",
        strokeWidth: 0.7,
      };
    }
    const status = (zone.status || "").toLowerCase();
    if (status.includes("high") || status.includes("crowd") || status.includes("bottle")) {
      return {
        fill: "rgba(245, 158, 11, 0.12)",
        stroke: "rgba(245, 158, 11, 0.6)",
        strokeWidth: 0.45,
      };
    }
    return {
      fill: "rgba(30, 41, 59, 0.4)",
      stroke: "#334155",
      strokeWidth: 0.4,
    };
  };

  const getTrafficLevel = (share) => {
    const num = parseFloat(share) || 0;
    if (num >= 30) return { label: "HIGH", color: "#f87171" };
    if (num >= 15) return { label: "MED", color: "#fbbf24" };
    return { label: "LOW", color: "#34d399" };
  };

  return (
    <div className="h-full min-h-[480px] lg:h-[540px] xl:h-[560px] bg-white dark:bg-slate-900 rounded-lg border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col overflow-hidden">
      {/* 1. Compact Header Bar with Title, LIVE status & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight">
            Store Spatial Map
          </h2>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE
          </span>
          <span className="text-[11px] text-slate-400 hidden xl:inline">
            · {metric}
          </span>
        </div>

        {/* Controls Toolbar: Layer Toggles & Zoom */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {/* Layer Toggles */}
          <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            <button
              onClick={() => setShowHeatmap((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                showHeatmap
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Toggle Heatmap Layer"
            >
              <Flame className="w-3 h-3" />
              Heatmap
            </button>

            <button
              onClick={() => setShowZones((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                showZones
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Toggle Zones Layer"
            >
              <MapPin className="w-3 h-3" />
              Zones
            </button>

            <button
              onClick={() => setShowTrails((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                showTrails
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Toggle Paths Layer"
            >
              <Navigation className="w-3 h-3" />
              Paths
            </button>

            <button
              onClick={() => setShowPoints((v) => !v)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 ${
                showPoints
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Toggle Customers Layer"
            >
              <Users className="w-3 h-3" />
              Customers
            </button>
          </div>

          {/* Intensity Selector */}
          <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5 hidden sm:inline-flex">
            {INTENSITIES.map((i) => (
              <button
                key={i.id}
                onClick={() => setIntensity(i.id)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                  intensity === i.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                {i.label}
              </button>
            ))}
          </div>

          <div className="h-3.5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

          {/* Zoom Controls */}
          <div className="inline-flex items-center rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
            <button
              onClick={() => setZoom((z) => Math.min(2.5, +(z + 0.25).toFixed(2)))}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Zoom In"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Zoom Out"
            >
              <Minus className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Visual Centerpiece — Map Canvas (Dominates Screen) */}
      <div className="relative flex-1 overflow-hidden bg-slate-950 p-2 select-none flex items-center justify-center min-h-0">
        <svg
          viewBox="0 0 100 70"
          className="w-full h-full max-h-[460px] block"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Store Spatial Heatmap"
        >
          <defs>
            <filter id="spatialHeatFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={activeIntensity.stdDev} />
            </filter>
            <marker
              id="flowArrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="3.5"
              markerHeight="3.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#60a5fa" opacity="0.9" />
            </marker>
            {/* Grid pattern for architectural retail plan */}
            <pattern id="storeGrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="#1e293b" strokeWidth="0.15" />
            </pattern>
          </defs>

          <g transform={`translate(${50 - 50 / zoom} ${35 - 35 / zoom}) scale(${zoom})`}>
            {/* Architectural Store Perimeter */}
            <rect
              x="0.5"
              y="0.5"
              width="99"
              height="69"
              rx="1.2"
              fill="url(#storeGrid)"
              stroke="#334155"
              strokeWidth="0.6"
            />

            {/* Camera FOV & Marker: Camera 01 (Entrance / Top Left) */}
            <g>
              <path
                d="M 14 3.5 L 2 28 L 38 28 Z"
                fill="rgba(56, 189, 248, 0.04)"
                stroke="#0284c7"
                strokeWidth="0.2"
                strokeDasharray="1 1"
              />
              <circle cx="14" cy="3.5" r="1.4" fill="#0284c7" />
              <text x="14" y="2" textAnchor="middle" fontSize="1.6" fontWeight="bold" fill="#38bdf8">
                CAM 01
              </text>
            </g>

            {/* Camera FOV & Marker: Camera 02 (Aisles & POS / Top Right) */}
            <g>
              <path
                d="M 86 3.5 L 62 30 L 98 30 Z"
                fill="rgba(168, 85, 247, 0.04)"
                stroke="#9333ea"
                strokeWidth="0.2"
                strokeDasharray="1 1"
              />
              <circle cx="86" cy="3.5" r="1.4" fill="#9333ea" />
              <text x="86" y="2" textAnchor="middle" fontSize="1.6" fontWeight="bold" fill="#c084fc">
                CAM 02
              </text>
            </g>

            {/* Zone Polygons */}
            {showZones &&
              zones.map((z) => {
                if (!Array.isArray(z.polygon) || z.polygon.length === 0) return null;
                const pts = z.polygon.map((p) => p.join(",")).join(" ");
                const cx = z.polygon.reduce((a, p) => a + p[0], 0) / z.polygon.length;
                const cy = z.polygon.reduce((a, p) => a + p[1], 0) / z.polygon.length;
                const isSelected = selectedZoneId === z.id;
                const isHovered = hoveredZone?.id === z.id;
                const style = getZoneStyle(z, isSelected, isHovered);
                const traffic = getTrafficLevel(z.trafficShare);
                const visitorCount = z.people ?? z.count ?? 0;

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
                      fill={style.fill}
                      stroke={style.stroke}
                      strokeWidth={style.strokeWidth}
                    />

                    {/* Integrated clean zone label */}
                    <text
                      x={cx}
                      y={cy - 1.5}
                      textAnchor="middle"
                      fontSize="2.4"
                      fontWeight="800"
                      fill={isSelected ? "#93c5fd" : "#f8fafc"}
                      className="uppercase tracking-wider pointer-events-none drop-shadow-md"
                    >
                      {z.name}
                    </text>
                    <text
                      x={cx}
                      y={cy + 1.6}
                      textAnchor="middle"
                      fontSize="2.1"
                      fontWeight="700"
                      fill="#ffffff"
                      className="pointer-events-none drop-shadow-md"
                    >
                      {visitorCount} {visitorCount === 1 ? "visitor" : "visitors"}
                    </text>
                    <text
                      x={cx}
                      y={cy + 4.2}
                      textAnchor="middle"
                      fontSize="1.7"
                      fontWeight="800"
                      fill={traffic.color}
                      className="uppercase tracking-widest pointer-events-none"
                    >
                      {traffic.label}
                    </text>
                  </g>
                );
              })}

            {/* POS Checkout Counters Architecture Hint */}
            <rect
              x="28"
              y="60"
              width="24"
              height="3.5"
              rx="0.5"
              fill="rgba(30, 41, 59, 0.7)"
              stroke="#475569"
              strokeWidth="0.3"
            />
            <text
              x="40"
              y="62.4"
              textAnchor="middle"
              fontSize="1.6"
              fontWeight="700"
              fill="#94a3b8"
            >
              POS / BILLING REGISTERS
            </text>

            {/* Heatmap Density Grid */}
            {showHeatmap && densityGrid.length > 0 && (
              <g filter="url(#spatialHeatFilter)" opacity={activeIntensity.opacity}>
                {densityGrid.map((cell, idx) => (
                  <circle
                    key={idx}
                    cx={cell.cx}
                    cy={cell.cy}
                    r={Math.max(2.2, cell.density * 6.5 * activeIntensity.scale)}
                    fill={getHeatColor(cell.intensity)}
                  />
                ))}
              </g>
            )}

            {/* Movement Vectors / Trail Paths */}
            {showTrails && movementTrails.length > 0 && (
              <g opacity="0.85">
                {movementTrails.map((tr, idx) => (
                  <line
                    key={idx}
                    x1={tr.from_x}
                    y1={tr.from_y}
                    x2={tr.to_x}
                    y2={tr.to_y}
                    stroke="#60a5fa"
                    strokeWidth="0.45"
                    strokeDasharray="1.6 0.8"
                    markerEnd="url(#flowArrow)"
                  />
                ))}
              </g>
            )}

            {/* Customer Footprint Points */}
            {showPoints && points.length > 0 && (
              <g>
                {points.map((pt, idx) => {
                  const isHovered = hoveredPoint === pt;
                  return (
                    <circle
                      key={idx}
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 1.6 : 0.85}
                      fill={getPointColor(pt)}
                      stroke="#ffffff"
                      strokeWidth={isHovered ? 0.4 : 0.15}
                      opacity={isHovered ? 1 : 0.9}
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

        {/* Floating Zone Tooltip on Hover */}
        {hoveredZone && (
          <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700/80 text-white rounded-lg p-3 text-xs shadow-2xl pointer-events-none backdrop-blur-md min-w-[210px] space-y-2 z-20">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
              <span className="font-bold text-sky-400 uppercase tracking-wider">
                {hoveredZone.name}
              </span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">
                {hoveredZone.kind}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">VISITORS</span>
                <span className="font-bold text-white text-xs">
                  {hoveredZone.people ?? hoveredZone.count ?? 0}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">TRAFFIC SHARE</span>
                <span className="font-bold text-amber-400 text-xs">
                  {hoveredZone.trafficShare || `${hoveredZone.shareNum || 0}%`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">AVG DWELL</span>
                <span className="font-bold text-purple-400 text-xs">
                  {hoveredZone.avgDwell || "0m 00s"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">STATUS</span>
                <span className="font-bold text-emerald-400 text-xs">
                  {hoveredZone.status || "Normal"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Floating Point Tooltip on Hover */}
        {hoveredPoint && !hoveredZone && (
          <div className="absolute bottom-3 left-3 bg-slate-900/95 border border-slate-700/80 text-white rounded-md px-3 py-2 text-xs font-mono shadow-xl pointer-events-none backdrop-blur-md z-20">
            <span className="font-bold text-sky-400">ID: {hoveredPoint.track_id}</span>
            <span className="text-slate-400 ml-2">({hoveredPoint.zone})</span>
            <div className="text-slate-300 text-[11px] mt-0.5">
              Pos: ({hoveredPoint.x}%, {hoveredPoint.y}%) · Dwell: {hoveredPoint.dwell}s
            </div>
            <div className="text-[10px] text-slate-400">
              Source: {hoveredPoint.camera_id === "camera_02" ? "Camera 02" : "Camera 01"}
            </div>
          </div>
        )}

        {/* Empty / Connecting Overlay */}
        {(!connected || !hasData || points.length === 0) && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center text-center p-6 space-y-2 z-10">
            <Video className="w-8 h-8 text-amber-400" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">
              CONNECTING TO CCTV STREAM
            </p>
            <p className="text-xs text-slate-400 max-w-sm">
              {statusMessage || "Aggregating coordinate telemetry from Camera 01 and Camera 02."}
            </p>
          </div>
        )}
      </div>

      {/* 3. Compact Bottom Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] shrink-0">
        {/* Heatmap Legend: Low, Medium, High, Peak */}
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
            Density:
          </span>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Medium
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
              Peak
            </span>
          </div>
        </div>

        {/* Tracking & Cameras Status */}
        <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 font-mono text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Cam 01
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            Cam 02
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Re-ID Active
          </span>
        </div>
      </div>
    </div>
  );
}
