import React from "react";
import SectionCard from "../customer/SectionCard";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Eye,
  Flame,
  Layers,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";

export default function SelectedZoneDetailCard({ zone, className = "" }) {
  if (!zone) {
    return (
      <SectionCard
        icon={MapPin}
        title="Zone Intelligence Detail"
        subtitle="Select any zone on the map or table to inspect telemetry"
        className={className}
      >
        <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 dark:text-slate-500 text-xs space-y-1">
          <Layers className="w-8 h-8 opacity-40 mb-1" />
          <p className="font-semibold text-slate-600 dark:text-slate-400">No Zone Selected</p>
          <p className="text-[11px]">Click any zone on the store map or table to view detailed observations.</p>
        </div>
      </SectionCard>
    );
  }

  const recent = zone.recent_activity || [];

  return (
    <SectionCard
      icon={MapPin}
      title={`Zone Focus: ${zone.name}`}
      subtitle={`Type: ${zone.kind || "Department"} · Status: ${zone.status}`}
      className={className}
      source="Live Camera Tracking"
      action={
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
            zone.status === "High" || zone.status === "Critical"
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
              : zone.status === "Normal"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/30"
          }`}
        >
          ● {zone.status}
        </span>
      }
    >
      <div className="space-y-3">
        {/* Metric tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              LIVE OCCUPANCY
            </span>
            <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
              {zone.people} {zone.people === 1 ? "Person" : "People"}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              Cap: {zone.threshold || 10} max
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              TOTAL VISITS
            </span>
            <p className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5">
              {zone.visits || 0}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              {zone.traffic_share || "0%"} share
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              AVERAGE DWELL
            </span>
            <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
              {zone.avg_dwell || "0m 00s"}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              Med: {zone.median_dwell || "0m 00s"}
            </span>
          </div>

          <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              PEAK OCCUPANCY
            </span>
            <p className="text-lg font-black text-red-600 dark:text-red-400 mt-0.5">
              {zone.peak_occupancy || zone.people || 0}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              Max simultaneous
            </span>
          </div>
        </div>

        {/* In / Out transition summary */}
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-2 rounded bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Entry Events:
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {zone.entries || 0}
            </span>
          </div>

          <div className="flex items-center justify-between p-2 rounded bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/50 text-xs">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Exit Events:
            </span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {zone.exits || 0}
            </span>
          </div>
        </div>

        {/* Recent Activity List */}
        <div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1.5">
            RECENT TRACKED ACTIVITY IN ZONE
          </span>
          <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
            {recent.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                No recent activity logged for this zone.
              </p>
            ) : (
              recent.map((ev, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 px-2 rounded bg-slate-50/70 dark:bg-slate-800/30 text-[11px] font-mono border border-slate-100 dark:border-slate-800"
                >
                  <span className="font-bold text-slate-700 dark:text-slate-200">{ev.person_id}</span>
                  <span className="text-slate-400">{ev.time}</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{ev.dwell}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
