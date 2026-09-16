import React from "react";
import SectionCard from "../customer/SectionCard";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function OperationalAlertsCard({ alerts = [], className = "" }) {
  const getAlertStyle = (type) => {
    switch (type) {
      case "critical":
        return {
          icon: AlertCircle,
          badge: "bg-rose-500 text-white",
          border: "border-rose-500/30 bg-rose-500/10 text-rose-900 dark:text-rose-200",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          badge: "bg-amber-500 text-white",
          border: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200",
        };
      case "info":
        return {
          icon: Info,
          badge: "bg-blue-500 text-white",
          border: "border-blue-500/30 bg-blue-500/10 text-blue-900 dark:text-blue-200",
        };
      default:
        return {
          icon: Info,
          badge: "bg-slate-500 text-white",
          border: "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300",
        };
    }
  };

  return (
    <SectionCard
      icon={AlertTriangle}
      title="Operational Zone Alerts"
      subtitle="Automated threshold violations & store condition triggers"
      className={className}
      source="Live Threshold Rules"
    >
      <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
        {alerts.length === 0 ? (
          <div className="flex items-center gap-2 p-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>All store zones operating within normal occupancy and dwell thresholds.</span>
          </div>
        ) : (
          alerts.map((al) => {
            const style = getAlertStyle(al.type);
            const Icon = style.icon;
            return (
              <div
                key={al.id}
                className={`p-2.5 rounded border ${style.border} flex items-start gap-2.5 text-xs`}
              >
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className="font-bold tracking-tight uppercase text-[10px]">
                      {al.title}: {al.zone}
                    </span>
                    <span className="text-[10px] opacity-75 font-mono">{al.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-95">{al.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}
