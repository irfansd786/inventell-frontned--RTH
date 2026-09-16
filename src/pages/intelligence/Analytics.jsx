import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart2,
  TrendingUp,
  Users,
  ShoppingBag,
  Package,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ArrowRight,
  Clock,
  MapPin,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import { analyticsService } from '../../services/analyticsService';
import { useTheme } from '../../context/ThemeContext';

export default function Analytics() {
  const navigate = useNavigate();
  const { chartTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30 Days');
  const [kpis, setKpis] = useState(null);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [trafficData, setTrafficData] = useState([]);
  const [funnelData, setFunnelData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [inventoryHealth, setInventoryHealth] = useState([]);
  const [fulfillmentData, setFulfillmentData] = useState([]);
  const [customerBehavior, setCustomerBehavior] = useState(null);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [k, r, t, f, c, ih, fp, cb, ins] = await Promise.all([
          analyticsService.getKPIs(),
          analyticsService.getRevenueTrend(),
          analyticsService.getCustomerTraffic(),
          analyticsService.getConversionFunnel(),
          analyticsService.getCategoryPerformance(),
          analyticsService.getInventoryHealth(),
          analyticsService.getFulfillmentPerformance(),
          analyticsService.getCustomerBehavior(),
          analyticsService.getKeyInsights()
        ]);
        setKpis(k);
        setRevenueTrend(Array.isArray(r) ? r : []);
        setTrafficData(Array.isArray(t) ? t : []);
        setFunnelData(Array.isArray(f) ? f : []);
        setCategoryData(Array.isArray(c) ? c : []);
        setInventoryHealth(Array.isArray(ih) ? ih : []);
        setFulfillmentData(Array.isArray(fp) ? fp : []);
        setCustomerBehavior(cb && typeof cb === 'object' ? cb : null);
        setInsights(Array.isArray(ins) ? ins : []);
      } catch (err) {
        console.error('Failed to load analytics', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [timeFilter]);

  if (loading || !kpis) {
    return <LoadingState message="Loading retail intelligence analytics..." />;
  }

  const kpiList = [
    { label: 'Revenue', val: kpis.revenue.value, change: kpis.revenue.change, isUp: true, icon: ShoppingBag, color: 'emerald' },
    { label: 'Customers', val: kpis.customers.value, change: kpis.customers.change, isUp: true, icon: Users, color: 'emerald' },
    { label: 'Conversion Rate', val: kpis.conversionRate.value, change: kpis.conversionRate.change, isUp: false, icon: Zap, color: 'blue' },
    { label: 'Avg Order Value', val: kpis.avgOrderValue.value, change: kpis.avgOrderValue.change, isUp: true, icon: TrendingUp, color: 'emerald' },
    { label: 'Inventory Turnover', val: kpis.inventoryTurnover.value, change: kpis.inventoryTurnover.change, isUp: true, icon: Package, color: 'emerald' },
    { label: 'Fulfillment Rate', val: kpis.fulfillmentRate.value, change: kpis.fulfillmentRate.change, isUp: true, icon: CheckCircle2, color: 'emerald' },
    { label: 'Stockout Rate', val: kpis.stockoutRate.value, change: kpis.stockoutRate.change, isUp: true, icon: AlertTriangle, color: 'red' },
    { label: 'Operational Efficiency', val: kpis.operationalEfficiency.value, change: kpis.operationalEfficiency.change, isUp: true, icon: BarChart2, color: 'indigo' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <PageHeader
        title="Analytics"
        subtitle="Understand store performance, customer behavior, sales, inventory and operational efficiency."
        actions={
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1 shadow-2xs">
            {['Today', '7 Days', '30 Days', '90 Days'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeFilter(tf)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  timeFilter === tf
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        }
      />

      {/* Top 8 KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpiList.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{kpi.label}</span>
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{kpi.val}</span>
                <span className={`text-[10px] font-bold flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                  kpi.isUp ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                }`}>
                  {kpi.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">vs previous period</p>
            </div>
          );
        })}
      </div>

      {/* Charts Section A & B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* A. Revenue Trend */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Revenue & Orders Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily gross revenue vs total completed orders</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
              Target: ₹50,000/day
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="date" stroke={chartTheme.axisStroke} fontSize={11} />
                <YAxis yAxisId="left" stroke={chartTheme.emerald} fontSize={11} />
                <YAxis yAxisId="right" orientation="right" stroke={chartTheme.primary} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }}
                />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={chartTheme.emerald} strokeWidth={2.5} name="Revenue (₹)" />
                <Line yAxisId="right" type="monotone" dataKey="orders" stroke={chartTheme.primary} strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. Customer Traffic */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Customer Traffic & Transactions</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hourly store visitors vs POS transactions</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-md">
              Peak: 19:00 (640 visitors)
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="time" stroke={chartTheme.axisStroke} fontSize={11} />
                <YAxis stroke={chartTheme.axisStroke} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }}
                />
                <Bar dataKey="visitors" fill={chartTheme.primary} radius={[4, 4, 0, 0]} name="Visitors" />
                <Bar dataKey="transactions" fill={chartTheme.emerald} radius={[4, 4, 0, 0]} name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section C, D, E, F */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* C. Conversion Funnel */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Conversion Funnel</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Visitor retention to purchase completion</p>
          <div className="space-y-3">
            {funnelData.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>{item.stage}</span>
                  <span>{item.count} ({item.percent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* D. Category Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Category Revenue</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Sales contribution by merchandise category</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" stroke={chartTheme.axisStroke} fontSize={10} width={80} />
                <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }} />
                <Bar dataKey="sales" fill={chartTheme.emerald} radius={[0, 4, 4, 0]} name="Sales (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* E. Inventory Health */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Inventory Health Breakdown</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">512 total active store SKUs</p>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={inventoryHealth} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4}>
                  {inventoryHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800">
            {inventoryHealth.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 dark:text-slate-400 font-medium">{item.status}: <strong className="text-slate-900 dark:text-slate-100">{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* G. Customer Behavior & Dwell Time */}
      {customerBehavior && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Customer Behavior & Zone Telemetry</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">In-store dwell patterns and queue velocity</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Avg Dwell Time: <strong className="text-slate-900 dark:text-slate-100">{customerBehavior.avgDwellTimeMinutes ?? customerBehavior.avgDwellTime ?? '—'} mins</strong></span>
              <span className="text-slate-600 dark:text-slate-300">Avg Queue Wait: <strong className="text-amber-600 dark:text-amber-400">{customerBehavior.avgQueueWaitSeconds ?? '—'} secs</strong></span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {(customerBehavior.topVisitedZones || []).map((z, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">{z.zone}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-base font-bold text-slate-900 dark:text-slate-100">{z.visits} visits</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{z.share}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Insights Section */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Automated Key Insights</h3>
              <p className="text-xs text-slate-400">Correlated observations across Customer, Sales, and Inventory modules</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/ai-insights')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
          >
            View All AI Insights
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Array.isArray(insights) ? insights : []).map((item = {}, idx) => (
            <div key={item.id || idx} className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{item.metric || item.title || 'Insight'}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    String(item.severity || '').toLowerCase() === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {String(item.severity || 'info').toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-200 mt-2 leading-relaxed font-medium">{item.explanation || item.description || 'No details available.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-700/60 space-y-2">
                <p className="text-[11px] text-slate-400">
                  <strong className="text-emerald-400">Recommended:</strong> {item.recommendedAction || item.action || '—'}
                </p>
                <button
                  onClick={() => navigate(item.relatedPath || '/ai-insights')}
                  className="w-full py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  View Details
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
