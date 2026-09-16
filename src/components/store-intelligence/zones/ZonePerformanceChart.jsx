import React, { useState } from "react";
import SectionCard from "../customer/SectionCard";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useChartTheme } from "../customer/chartTheme";
import { BarChart3 } from "lucide-react";

const MODES = [
  { id: "traffic", label: "Traffic", dataKey: "traffic", unit: "visits", color: "#2563eb" },
  { id: "dwell", label: "Dwell", dataKey: "dwell", unit: "seconds", color: "#8b5cf6" },
  { id: "occupancy", label: "Occupancy", dataKey: "occupancy", unit: "people", color: "#f59e0b" },
];

export default function ZonePerformanceChart({ performance = [], className = "" }) {
  const [metric, setMetric] = useState("traffic");
  const theme = useChartTheme();

  const currentMode = MODES.find((m) => m.id === metric) || MODES[0];

  return (
    <SectionCard
      icon={BarChart3}
      title="Zone Performance Comparison"
      subtitle={`Cross-zone benchmark: ${currentMode.label} (${currentMode.unit})`}
      className={className}
      source="Comparative Zone Telemetry"
      action={
        <div className="inline-flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                metric === m.id
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-64 sm:h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
            <XAxis
              dataKey="zone"
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: theme.tick, fontSize: 11 }}
            />
            <Tooltip
              contentStyle={theme.tooltip}
              formatter={(val, name, item) => {
                if (metric === "dwell") {
                  return [item.payload.dwellFormatted || `${val}s`, "Avg Dwell"];
                }
                if (metric === "occupancy") {
                  return [`${val} people (Peak: ${item.payload.peakOccupancy || val})`, "Occupancy"];
                }
                return [`${val} visits (${item.payload.trafficShare}% share)`, "Traffic"];
              }}
            />
            <Bar
              dataKey={currentMode.dataKey}
              fill={currentMode.color}
              radius={[4, 4, 0, 0]}
              maxBarSize={45}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}
