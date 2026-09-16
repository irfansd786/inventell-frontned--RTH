import React from "react";
import SectionCard from "./SectionCard";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

export default function OperationalAlertsCard({ alerts = [], className = "" }) {
  const getAlertStyle = (type) => {
    switch (type) {
      case "critical":
        return {
          icon: AlertCircle,
          badge: "bg-red-500 text-white",
          border: "border-red-500/30 bg-red-500/10 text-red-900 dark:text-red-200",
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
            <span>No active threshold violations detected.</span>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const style = getAlertStyle(alert.type);
            const Icon = style.icon;
            return (
              <div
                key={idx}
                className={`flex items-start gap-2.5 p-2.5 rounded border ${style.border} text-xs`}
              >
                <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <span className="font-bold">{alert.title}</span>
                  {alert.zone && (
                    <span className="text-slate-500 dark:text-slate-400"> · {alert.zone}</span>
                  )}
                  <p className="text-slate-600 dark:text-slate-300 mt-0.5">{alert.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </SectionCard>
  );
}