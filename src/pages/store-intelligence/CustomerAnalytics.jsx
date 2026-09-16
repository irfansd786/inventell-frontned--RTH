import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import PageContainer from '../../components/layout/PageContainer';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import CustomerAnalyticsHeader from '../../components/store-intelligence/customer/CustomerAnalyticsHeader';
import CustomerKpiGrid from '../../components/store-intelligence/customer/CustomerKpiGrid';
import TrafficTrend from '../../components/store-intelligence/customer/TrafficTrend';
import CustomerJourneyCard from '../../components/store-intelligence/customer/CustomerJourneyCard';
import ZoneTransitionTable from '../../components/store-intelligence/customer/ZoneTransitionTable';
import ZonePerformanceTable from '../../components/store-intelligence/customer/ZonePerformanceTable';
import DwellTimeAnalysis from '../../components/store-intelligence/customer/DwellTimeAnalysis';
import PeakCustomerPeriods from '../../components/store-intelligence/customer/PeakCustomerPeriods';
import CustomerSalesCorrelation from '../../components/store-intelligence/customer/CustomerSalesCorrelation';
import CustomerBehaviorInsights from '../../components/store-intelligence/customer/CustomerBehaviorInsights';
import AIBusinessInsights from '../../components/store-intelligence/customer/AIBusinessInsights';

import { KpiSkeleton, SectionSkeleton } from '../../components/store-intelligence/customer/states';
import {
  getCustomerAnalyticsData,
  exportCustomerAnalytics,
} from '../../services/customerService';

export default function CustomerAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Analytical Filter State
  const [period, setPeriod] = useState('today');
  const [granularity, setGranularity] = useState('hourly');
  const [camera, setCamera] = useState('all');
  const [zone, setZone] = useState('all');
  const [compare, setCompare] = useState(false);

  // Custom Session Window State
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [appliedWindow, setAppliedWindow] = useState({ start: null, end: null });

  // Selected Zone Highlight State
  const [selectedZone, setSelectedZone] = useState(null);
  const [refreshTick, setRefreshTick] = useState(0);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await getCustomerAnalyticsData({
        period,
        granularity,
        camera,
        zone,
        compare,
        windowStart: period === 'custom' && appliedWindow.start != null ? Number(appliedWindow.start) : null,
        windowEnd: period === 'custom' && appliedWindow.end != null ? Number(appliedWindow.end) : null,
      });
      setData(payload);
    } catch (err) {
      console.error('Failed to load customer analytics payload', err);
      setError(err?.message || 'Unable to load customer analytics data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [period, granularity, camera, zone, compare, appliedWindow]);

  useEffect(() => {
    loadData();
  }, [loadData, refreshTick]);

  const summary = data?.summary;
  const meta = data?.meta;
  const zonesList = data?.zones || [];

  const handleExport = () => {
    if (!data) return;
    exportCustomerAnalytics(data, { period });
  };

  const applyCustomWindow = () => {
    setAppliedWindow({
      start: customStart === '' ? null : Number(customStart),
      end: customEnd === '' ? null : Number(customEnd),
    });
  };

  if (loading && !data) {
    return (
      <PageContainer>
        <KpiSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4">
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <SectionSkeleton rows={6} />
          </div>
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <SectionSkeleton rows={6} />
          </div>
        </div>
        <Loading text="Loading Customer Behavior Intelligence..." />
      </PageContainer>
    );
  }

  if (error && !data) {
    return (
      <PageContainer>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-6 py-12 text-center">
          <div className="max-w-sm mx-auto space-y-3">
            <span className="inline-flex p-3 rounded-xl bg-red-500/10 text-red-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </span>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              Unable to load customer analytics.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{error}</p>
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={() => setRefreshTick((n) => n + 1)}
              className="dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200"
            >
              Retry Loading
            </Button>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* 1. ENTERPRISE HEADER */}
        <CustomerAnalyticsHeader
          period={period}
          onPeriodChange={setPeriod}
          camera={camera}
          onCameraChange={setCamera}
          zone={zone}
          onZoneChange={setZone}
          compare={compare}
          onCompareToggle={() => setCompare((c) => !c)}
          zonesList={zonesList}
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

        {/* 2. TOP KPI ROW (4 ANALYTICAL CARDS) */}
        <CustomerKpiGrid summary={summary} compare={compare} period={period} />

        {/* 3. CUSTOMER TRAFFIC TREND CHART */}
        <TrafficTrend
          traffic={data?.traffic}
          peakPeriod={data?.peak_period}
          granularity={granularity}
          onGranularity={setGranularity}
          compare={compare}
        />

        {/* 4. CUSTOMER JOURNEY & ZONE BEHAVIOR */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 min-w-0 flex flex-col">
            <CustomerJourneyCard journeys={data?.journeys} hasData={meta?.has_data !== false} />
          </div>
          <div className="lg:col-span-5 min-w-0 flex flex-col">
            <ZoneTransitionTable transitions={data?.transitions} hasData={meta?.has_data !== false} />
          </div>
        </div>

        {/* 5. ZONE PERFORMANCE ENTERPRISE TABLE */}
        <ZonePerformanceTable
          zones={zonesList}
          selectedZone={selectedZone || (zone !== 'all' ? zone : null)}
          onSelectZone={(zId) => {
            setSelectedZone(zId);
            if (zId) setZone(zId);
          }}
        />

        {/* 6. DWELL TIME ANALYSIS & 7. PEAK CUSTOMER PERIODS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-7 min-w-0 flex flex-col">
            <DwellTimeAnalysis zones={zonesList} summary={summary} />
          </div>
          <div className="lg:col-span-5 min-w-0 flex flex-col">
            <PeakCustomerPeriods traffic={data?.traffic || []} peakPeriod={data?.peak_period} />
          </div>
        </div>

        {/* 8. CUSTOMER → SALES CORRELATION */}
        <CustomerSalesCorrelation correlation={data?.sales_correlation} traffic={data?.traffic} />

        {/* 9. CUSTOMER BEHAVIOR INSIGHTS & 10. AI BUSINESS INSIGHTS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          <div className="lg:col-span-6 min-w-0 flex flex-col">
            <CustomerBehaviorInsights insights={data?.insights} />
          </div>
          <div className="lg:col-span-6 min-w-0 flex flex-col">
            <AIBusinessInsights recommendations={data?.recommendations} />
          </div>
        </div>

        {/* Datasets Provenance Footer */}
        {meta?.note && (
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
            <strong className="text-slate-700 dark:text-slate-300">Data Provenance: </strong>
            {meta.note}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
