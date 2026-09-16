import React, { useState, useEffect, useCallback } from "react";
import PageContainer from "../../components/layout/PageContainer";
import ZonesHeader from "../../components/store-intelligence/zones/ZonesHeader";
import ZoneOverviewKpiGrid from "../../components/store-intelligence/zones/ZoneOverviewKpiGrid";
import StoreZoneMapView from "../../components/store-intelligence/zones/StoreZoneMapView";
import SelectedZoneDetailCard from "../../components/store-intelligence/zones/SelectedZoneDetailCard";
import ZonePerformanceChart from "../../components/store-intelligence/zones/ZonePerformanceChart";
import EnterpriseZoneTable from "../../components/store-intelligence/zones/EnterpriseZoneTable";
import ZoneTransitionsCard from "../../components/store-intelligence/zones/ZoneTransitionsCard";
import CustomerFlowCard from "../../components/store-intelligence/zones/CustomerFlowCard";
import ZoneDwellAnalysisCard from "../../components/store-intelligence/zones/ZoneDwellAnalysisCard";
import OperationalAlertsCard from "../../components/store-intelligence/zones/OperationalAlertsCard";
import Loading from "../../components/common/Loading";
import Button from "../../components/common/Button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { getZoneAnalyticsData, exportZonesReport } from "../../services/zoneService";

export default function Zones() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("today");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [appliedWindow, setAppliedWindow] = useState({ start: null, end: null });
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getZoneAnalyticsData({
        period,
        windowStart: period === "custom" && appliedWindow.start != null ? Number(appliedWindow.start) : null,
        windowEnd: period === "custom" && appliedWindow.end != null ? Number(appliedWindow.end) : null,
      });
      setData(result);
      if (result?.table?.length > 0 && !selectedZoneId) {
        setSelectedZoneId(result.table[0].id);
      }
    } catch (err) {
      setError(err?.message || "Zone telemetry unavailable.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, appliedWindow]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTick]);

  const handleExport = () => {
    if (!data) return;
    exportZonesReport(data, { period });
  };

  const applyCustomWindow = () => {
    setAppliedWindow({
      start: customStart === "" ? null : Number(customStart),
      end: customEnd === "" ? null : Number(customEnd),
    });
  };

  const meta = data?.meta;
  const cameras = meta?.cameras;
  const bothAnalyzing = meta?.both_analyzing === true || (cameras?.camera_01?.connected && cameras?.camera_02?.connected);
  const connected = data?.cctvConnected !== false;
  const hasData = meta?.has_data !== false && (data?.table?.length > 0 || data?.zoneMap?.people?.length > 0);

  // Selected zone record
  const selectedZone = data?.table?.find((z) => z.id === selectedZoneId) || data?.table?.[0] || null;

  if (loading && !data) {
    return (
      <PageContainer>
        <Loading text="Analyzing CCTV zone telemetry..." />
      </PageContainer>
    );
  }

  if (error && !data) {
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
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => setRefreshTick((n) => n + 1)}
              className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Retry
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Header */}
      <ZonesHeader
        cameras={cameras}
        bothAnalyzing={bothAnalyzing}
        period={period}
        onPeriodChange={setPeriod}
        onRefresh={() => setRefreshTick((n) => n + 1)}
        onExport={handleExport}
        canExport={!!data}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStart={setCustomStart}
        onCustomEnd={setCustomEnd}
        onApplyWindow={applyCustomWindow}
        reason={meta?.reason}
      />

      {/* Zone Overview KPIs */}
      <ZoneOverviewKpiGrid kpis={data?.overviewKpis} />

      {/* Store Zone Map (7 cols) + Selected Zone Detail (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-7 min-w-0 flex flex-col">
          <StoreZoneMapView
            zones={data?.zoneMap?.zones || []}
            people={data?.zoneMap?.people || []}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            connected={connected}
            hasData={hasData}
          />
        </div>
        <div className="lg:col-span-5 min-w-0 flex flex-col">
          <SelectedZoneDetailCard zone={selectedZone} className="h-full" />
        </div>
      </div>

      {/* Zone Performance Comparison Chart */}
      <div className="w-full min-w-0">
        <ZonePerformanceChart performance={data?.performance || []} />
      </div>

      {/* Enterprise Zone Table */}
      <div className="w-full min-w-0">
        <EnterpriseZoneTable
          zones={data?.table || []}
          selectedZoneId={selectedZoneId}
          onSelectZone={setSelectedZoneId}
        />
      </div>

      {/* Transitions (4 cols) + Customer Flow (4 cols) + Zone Dwell (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        <div className="lg:col-span-4 min-w-0 flex flex-col">
          <ZoneTransitionsCard transitions={data?.transitions || []} className="h-full" />
        </div>
        <div className="lg:col-span-4 min-w-0 flex flex-col">
          <CustomerFlowCard customerFlow={data?.customerFlow || []} className="h-full" />
        </div>
        <div className="lg:col-span-4 min-w-0 flex flex-col">
          <ZoneDwellAnalysisCard dwellAnalysis={data?.dwellAnalysis || []} className="h-full" />
        </div>
      </div>

      {/* Operational Alerts */}
      <div className="w-full min-w-0">
        <OperationalAlertsCard alerts={data?.operationalAlerts || []} />
      </div>

      {meta?.note && (
        <div className="rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-3.5 py-2.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-700 dark:text-slate-300">Telemetry Notice: </span>
          {meta.note}
        </div>
      )}
    </PageContainer>
  );
}
