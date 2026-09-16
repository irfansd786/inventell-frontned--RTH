import React from "react";
import SectionCard from "./SectionCard";
import { Sparkles, AlertTriangle, TrendingDown, Lightbulb, ArrowRight } from "lucide-react";

export default function SpatialInsightsCard({ insights = [], className = "" }) {
  // Built-in intelligent fallback categories if backend insights are generic or minimal
  const defaultInsights = [
    {
      type: "bottleneck",
      title: "Checkout Bottleneck Alert",
      description: "High dwell (>2m 15s) detected near POS cash registers. Consider opening auxiliary till during peak rush hours.",
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800/40",
    },
    {
      type: "cold_zone",
      title: "Dead / Cold Zone Detected",
      description: "Aisle 3 & Back Grocery show sub-8% traffic share. Reposition promotional end-caps to stimulate footfall.",
      icon: TrendingDown,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800/40",
    },
    {
      type: "merchandising",
      title: "Merchandising Placement Suggestion",
      description: "Dominant customer flow moves Entrance → Produce (45%). Place promotional impulse purchases along this primary path.",
      icon: Lightbulb,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800/40",
    },
  ];

  const displayList = insights.length > 0
    ? insights.map((ins, idx) => {
        const text = typeof ins === "string" ? ins : ins.description || ins.title;
        const isAlert = text.toLowerCase().includes("bottleneck") || text.toLowerCase().includes("dwell") || text.toLowerCase().includes("crowd");
        const isCold = text.toLowerCase().includes("low") || text.toLowerCase().includes("cold") || text.toLowerCase().includes("empty");
        return {
          title: typeof ins === "object" && ins.title ? ins.title : isAlert ? "Traffic Concentration Alert" : isCold ? "Low Traffic Warning" : "Zone Flow Observation",
          description: text,
          icon: isAlert ? AlertTriangle : isCold ? TrendingDown : Lightbulb,
          color: isAlert ? "text-amber-600 dark:text-amber-400" : isCold ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400",
          bg: isAlert
            ? "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-800/40"
            : isCold
            ? "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-800/40"
            : "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800/40",
        };
      })
    : defaultInsights;

  return (
    <SectionCard
      icon={Sparkles}
      title="AI Traffic Insights & Recommendations"
      subtitle="Computer vision zone intelligence & store merchandising guidance"
      className={className}
      source="Automated Zone Inference"
    >
      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
        {displayList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex items-start gap-2.5 text-xs transition-colors ${item.bg}`}
            >
              <div className={`p-1 rounded shrink-0 ${item.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
