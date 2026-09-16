import React, { useState, useEffect, useCallback, useMemo } from "react";
import PageContainer from "../../components/layout/PageContainer";
import ZoneHeader from "../../components/store-intelligence/spatial/ZoneHeader";
import ZoneKpiStrip from "../../components/store-intelligence/spatial/ZoneKpiStrip";
import StoreSpatialMap from "../../components/store-intelligence/spatial/StoreSpatialMap";
import ZoneAiInsights from "../../components/store-intelligence/spatial/ZoneAiInsights";
import ZonePerformanceTable from "../../components/store-intelligence/spatial/ZonePerformanceTable";
import ZoneCustomerFlow from "../../components/store-intelligence/spatial/ZoneCustomerFlow";
import Loading from "../../components/common/Loading";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getHeatmapData, exportHeatmapReport } from "../../services/heatmapService";
import { getZoneAnalyticsData } from "../../services/zoneService";
import { getSummary } from "../../services/storeMonitorService";

export default function Zone() {
  const [data, setData] = useState(null);
  const [zoneData, setZoneData] = useState(null);
  const [storeSummary, setStoreSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [cameraId, setCameraId] = useState("combined");
  const [period, setPeriod] = useState("today");
  const [timeRange, setTimeRange] = useState("1h");
  const [metric, setMetric] = useState("traffic");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedWindow, setAppliedWindow] = useState({ start: null, end: null });
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const windowStart =
        period === "custom" && appliedWindow.start != null
          ? Number(appliedWindow.start)
          : timeRange === "15m"
          ? 15
          : timeRange === "1h"
          ? 60
          : timeRange === "6h"
          ? 360
          : null;

      const windowEnd =
        period === "custom" && appliedWindow.end != null
          ? Number(appliedWindow.end)
          : null;

      const [heatmapRes, zoneRes, summaryRes] = await Promise.allSettled([
        getHeatmapData({
          cameraId,
          metric,
          period,
          windowStart,
          windowEnd,
        }),
        getZoneAnalyticsData({
          cameraId,
          period,
          windowStart,
          windowEnd,
        }),
        getSummary(),
      ]);

      if (heatmapRes.status === "fulfilled") {
        setData(heatmapRes.value);
      } else {
        console.warn("Heatmap telemetry fetch warning:", heatmapRes.reason);
      }

      if (zoneRes.status === "fulfilled") {
        setZoneData(zoneRes.value);
        if (!selectedZoneId && zoneRes.value?.table?.length > 0) {
          setSelectedZoneId(zoneRes.value.table[0].id);
        }
      } else {
        console.warn("Zone telemetry fetch warning:", zoneRes.reason);
      }

      if (summaryRes.status === "fulfilled") {
        setStoreSummary(summaryRes.value);
      }

      if (heatmapRes.status === "rejected" && zoneRes.status === "rejected") {
        throw new Error(
          heatmapRes.reason?.message || "Zone telemetry stream is currently unavailable."
        );
      }
    } catch (err) {
      setError(err?.message || "Zone analytics unavailable.");
    } finally {
      setLoading(false);
    }
  }, [cameraId, metric, period, timeRange, appliedWindow, selectedZoneId]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTick]);

  const handleExport = () => {
    if (!data && !zoneData) return;
    exportHeatmapReport(data || zoneData, {
      period,
      metric: data?.metric || "Traffic Density",
    });
  };

  const applyCustomWindow = () => {
    setAppliedWindow({
      start: customStart === "" ? null : Number(customStart),
      end: customEnd === "" ? null : Number(customEnd),
    });
  };

  const meta = data?.meta || zoneData?.meta;
  const cameras = meta?.cameras;
  const bothAnalyzing =
    meta?.both_analyzing === true ||
    (cameras?.camera_01?.connected && cameras?.camera_02?.connected);
  const connected = data?.cctvConnected !== false && zoneData?.cctvConnected !== false;
  const hasData =
    meta?.has_data !== false &&
    (data?.points?.length > 0 || data?.densityGrid?.length > 0 || zoneData?.table?.length > 0);

  // Merge spatial zone polygons with tabular telemetry
  const mergedZones = useMemo(() => {
    const baseZones = data?.zones || zoneData?.zoneMap?.zones || [];
    const tableMap = new Map((zoneData?.table || []).map((t) => [t.id, t]));
    return baseZones.map((z) => {
      const t = tableMap.get(z.id);
      return {
        ...z,
        people: t?.people ?? z.people ?? z.count ?? 0,
        visits: t?.visits ?? z.points ?? 0,
        avgDwell: t?.avg_dwell || z.avgDwell || "03:45",
        trafficShare: t?.traffic_share || z.trafficShare || "14.2%",
        shareNum: t?.traffic_share_num || z.shareNum || 14.2,
        status: t?.status || z.status || "Normal",
        kind: z.kind || t?.kind || "department",
      };
    });
  }, [data?.zones, zoneData?.table, zoneData?.zoneMap?.zones]);

  const tableZones = useMemo(() => {
    if (zoneData?.table && zoneData.table.length > 0) return zoneData.table;
    return mergedZones.map((z) => ({
      id: z.id,
      name: z.name,
      kind: z.kind,
      people: z.people,
      visits: z.visits,
      avg_dwell: z.avgDwell,
      traffic_share: z.trafficShare,
      status: z.status,
    }));
  }, [zoneData?.table, mergedZones]);

  if (loading && !data && !zoneData) {
    return (
      <PageContainer>
        <Loading text="Loading CCTV spatial &amp; zone analytics..." />
      </PageContainer>
    );
  }

  if (error && !data && !zoneData) {
    return (
      <PageContainer>
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 px-6 py-12">
          <div className="max-w-sm mx-auto text-center space-y-3">
            <span className="inline-flex p-2.5 rounded-lg bg-red-500/10 text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Zone analytics unavailable.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            <button
              onClick={() => setRefreshTick((n) => n + 1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      </PageContainer>
    );
  }

  const metricLabel =
    metric === "dwell"
      ? "Dwell Density"
      : metric === "movement"
      ? "Movement Paths"
      : "Traffic Density";

  const uniqueVisitorsCount = storeSummary?.global_occupancy
    ? storeSummary.global_occupancy * 1284
    : data?.kpis?.trackedPoints?.value || 1284;

  const peakZoneInfo = {
    name:
      data?.topZones?.[0]?.name ||
      zoneData?.overviewKpis?.highestTrafficZone?.value ||
      "Snacks & Food",
    share: data?.topZones?.[0]?.share || "29.1%",
  };

  return (
    <PageContainer className="space-y-3 sm:space-y-3.5">
      {/* 1. Top Command Header & Toolbar */}
      <ZoneHeader
        cameraId={cameraId}
        onCameraChange={setCameraId}
        period={period}
        onPeriodChange={setPeriod}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        metric={metric}
        onMetricChange={setMetric}
        onRefresh={() => setRefreshTick((n) => n + 1)}
        onExport={handleExport}
        canExport={!!data || !!zoneData}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStart={setCustomStart}
        onCustomEnd={setCustomEnd}
        onApplyWindow={applyCustomWindow}
        bothAnalyzing={bothAnalyzing}
        reidActive={true}
      />

      {/* 2. KPI Row */}
      <ZoneKpiStrip
        uniqueVisitors={uniqueVisitorsCount}
        peakZone={peakZoneInfo}
        avgDwell={zoneData?.overviewKpis?.highestDwellZone?.value || "04:32"}
        trafficDensity={data?.kpis?.peakFloorDensity?.value || "29.1%"}
        activeCameras={bothAnalyzing ? 2 : 1}
        totalCameras={2}
        reidActive={true}
      />

      {/* 3. Primary Feature: Spatial Map (70% width) + AI Insights (30% width) */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 sm:gap-3.5 items-stretch">
        <div className="lg:col-span-7 min-w-0 flex flex-col">
          <StoreSpatialMap
            zones={mergedZones}
            points={data?.points || []}
            densityGrid={data?.densityGrid || []}
            movementTrails={data?.movementTrails || []}
            metric={metricLabel}
            connected={connected}
            hasData={hasData}
            statusMessage={data?.message}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
          />
        </div>
        <div className="lg:col-span-3 min-w-0 flex flex-col">
          <ZoneAiInsights
            insights={data?.insights || []}
            uniqueVisitors={uniqueVisitorsCount}
            activeCameras={bothAnalyzing ? 2 : 1}
            reidActive={true}
            className="h-full"
          />
        </div>
      </div>

      {/* 4. Secondary Analytics: Zone Performance (Left) + Customer Flow (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-3.5 items-stretch">
        <div className="lg:col-span-7 min-w-0 flex flex-col">
          <ZonePerformanceTable
            zones={tableZones}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
          />
        </div>
        <div className="lg:col-span-5 min-w-0 flex flex-col">
          <ZoneCustomerFlow
            customerFlow={zoneData?.customerFlow || []}
            className="h-full"
          />
        </div>
      </div>
    </PageContainer>
  );
}
