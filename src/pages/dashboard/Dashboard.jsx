import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  ShoppingBag,
  Users,
  Receipt,
  Package,
  Boxes,
  BarChart3,
  Clock,
  MapPin,
  ClipboardList,
  CircleAlert,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  Lightbulb,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  useDashboard,
  useRevenue,
  useRisks,
  useInventoryHealth,
  useStoreIntelligence,
  useAiInsights,
  useOperations,
  useSalesSummary,
  useSalesCategories,
  useSalesIntelligence,
} from '../../hooks/useDashboard';
import { useProductSummary } from '../../hooks/useProductSummary';
import { getTodayOrdersCount } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';

/* ---------- formatters (presentation only — values come from the API) ---------- */
function formatINR(value) {
  if (value === null || value === undefined) return '₹0';
  const n = Number(value);
  if (Number.isNaN(n)) return '₹0';
  if (Math.abs(n) >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function formatNum(value) {
  if (value === null || value === undefined || value === '—' || value === '') return '0';
  if (typeof value === 'number') {
    return Number.isNaN(value) ? '0' : value.toLocaleString('en-IN');
  }
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return n.toLocaleString('en-IN');
}

/* ---------- shared UI atoms ---------- */
function SectionCard({ title, icon: Icon, action, children, className = '' }) {
  return (
    <section
      className={`min-w-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function SectionError({ message, onRetry }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center justify-between gap-3">
      <span>{message || 'Unable to load dashboard data.'}</span>
      <button
        onClick={onRetry}
        className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-500/30 rounded-lg font-bold hover:bg-red-100 dark:hover:bg-red-500/20 shrink-0"
      >
        <RefreshCw className="w-3 h-3" /> Retry
      </button>
    </div>
  );
}

/* Primary KPI card: white surface, green accent, black text, green/red change. */
function KpiCard({ icon: Icon, title, value, change, description, path, id }) {
  const navigate = useNavigate();
  const positive = typeof change === 'number' ? change >= 0 : String(change || '').startsWith('+');
  const hasChange = change !== undefined && change !== null && change !== '';
  return (
    <div
      onClick={path ? () => navigate(path) : undefined}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all ${
        path ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {title}
        </span>
        <span className="p-1.5 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
          <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
        </span>
      </div>
      <p id={id} className="text-2xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">
        {value}
      </p>
      <div className="flex items-center gap-1.5 mt-1 text-[11px]">
        {hasChange && (
          <span
            className={`flex items-center gap-0.5 font-bold ${
              positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}
          >
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {typeof change === 'number' ? `${change > 0 ? '+' : ''}${change}%` : change}
          </span>
        )}
        {description && <span className="text-slate-500 dark:text-slate-400">{description}</span>}
      </div>
    </div>
  );
}

/* Risk severity styles with distinct background, border, and text styling. */
const SEVERITY_STYLE = {
  CRITICAL:
    'bg-red-50 dark:bg-red-500/10 text-red-900 dark:text-red-200 border-red-300 dark:border-red-500/40 border-l-red-600',
  HIGH: 'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-500/40 border-l-amber-500',
  MEDIUM:
    'bg-amber-50 dark:bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-500/40 border-l-amber-500',
  LOW: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-500/40 border-l-emerald-500',
  RESOLVED:
    'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-500/30 border-l-emerald-500',
};

/* Category bars: professional emerald scale. */
const CATEGORY_COLORS = ['#047857', '#059669', '#10b981', '#34d399', '#6ee7b7'];

import EmployeeLanding from '../../components/dashboard/EmployeeLanding';

/* ---------- main dashboard ---------- */
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile, isAdmin } = useAuth();

  if (!isAdmin) {
    return <EmployeeLanding />;
  }

  const [dateRange, setDateRange] = useState('7d');
  const [chartMetric, setChartMetric] = useState('revenue');

  const summary = useDashboard(dateRange);
  const revenue = useRevenue(dateRange, chartMetric);
  const salesIntel = useSalesIntelligence(dateRange);
  const storeIntel = useStoreIntelligence();
  const inventory = useInventoryHealth();
  const risks = useRisks();
  const insights = useAiInsights();
  const operations = useOperations();
  const categories = useSalesCategories();
  const { totalProducts, loading: productsLoading, refetch: refetchProducts } = useProductSummary();
  const [localTodayOrders, setLocalTodayOrders] = useState(null);

  useEffect(() => {
    let mounted = true;
    getTodayOrdersCount()
      .then((count) => {
        if (mounted && typeof count === 'number') setLocalTodayOrders(count);
      })
      .catch(() => {});

    const handleOrdersUpdated = (e) => {
      const list = e.detail;
      if (Array.isArray(list)) {
        const todayCnt = list.filter(
          (o) => o.createdAt?.startsWith('2026-09-09') || o.dateLabel?.includes('09 Sep 2026')
        ).length;
        setLocalTodayOrders(todayCnt);
      }
    };

    window.addEventListener('invintell_orders_updated', handleOrdersUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('invintell_orders_updated', handleOrdersUpdated);
    };
  }, []);

  const refreshAll = () => {
    summary.retry();
    revenue.retry();
    salesIntel.retry();
    storeIntel.retry();
    inventory.retry();
    risks.retry();
    insights.retry();
    operations.retry();
    categories.retry();
    refetchProducts();
    getTodayOrdersCount().then((cnt) => setLocalTodayOrders(cnt)).catch(() => {});
  };

  // Full-page states for the primary summary resource
  if (summary.loading) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <Loading text="Loading dashboard analytics..." />
      </div>
    );
  }

  if (summary.error) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4">
        <CircleAlert className="w-10 h-10 text-red-600 mx-auto" />
        <div>
          <h2 className="font-bold text-slate-900 dark:text-white">Unable to load dashboard analytics.</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {summary.error} Ensure the FastAPI backend is running at the configured API URL.
          </p>
        </div>
        <button
          onClick={summary.retry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!summary.data) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <EmptyState
          title="No dashboard data"
          description="The backend returned an empty summary."
          action={
            <button
              onClick={summary.retry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
          }
        />
      </div>
    );
  }

  const s = summary.data;
  const rev = revenue.data;
  const intel = storeIntel.data;
  const inv = inventory.data;
  const si = salesIntel.data;
  const ops = operations.data;

// Helper to safely map legacy/orphaned paths to active application routes
function resolveActionPath(path, defaultPath = '/alerts') {
  if (!path) return defaultPath;
  if (path === '/transfers') return '/allocation';
  if (path === '/risks') return '/alerts';
  if (path === '/management-actions') return '/exceptions';
  return path;
}

  // Priority actions derived from real backend data (inventory, risks, operations, queue)
  const riskItems = Array.isArray(risks.data) ? risks.data : risks.data?.items || [];
  const priorityActions = [
    ...(inv?.critical > 0
      ? [{ priority: 'P0', text: `Replenish ${inv.critical} critical stock items`, path: '/low-stock' }]
      : []),
    ...(inv?.low_stock > 0
      ? [{ priority: 'P1', text: `Review ${inv.low_stock} low stock reorder alerts`, path: '/low-stock' }]
      : []),
    ...riskItems.map((r) => ({
      priority: r.severity === 'CRITICAL' ? 'P0' : r.severity === 'HIGH' ? 'P1' : 'P2',
      text: r.title,
      path: resolveActionPath(r.action_path, '/alerts'),
    })),
    ...(ops && ops.orders_pending > 0
      ? [{ priority: 'P1', text: `Allocate ${ops.orders_pending} pending customer orders`, path: '/allocation' }]
      : []),
    ...(intel && intel.queue_length > 0
      ? [{ priority: 'P2', text: `Monitor checkout queue (${intel.queue_length} customers)`, path: '/customer-analytics' }]
      : []),
  ].slice(0, 5);

  const subLabel = s.comparison_subtitle || 'vs prev period';

  const welcomeName = user?.name || (user?.email ? user.email.split('@')[0] : '') || 'Admin';

  return (
    <div className="w-full min-w-0 space-y-6 animate-in fade-in duration-300">
      {/* Clean Welcome Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Welcome back, {welcomeName}! 👋
          </h1>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
            Walmart Store CA_1 Intelligence Hub • Analytics Period: <span className="text-slate-800 dark:text-slate-200 font-bold">{s.period_label || s.dataset_period}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Global Date Range Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs font-bold shadow-sm">
            {[
              { key: 'today', label: 'Today' },
              { key: '7d', label: '7 Days' },
              { key: '30d', label: '30 Days' },
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => setDateRange(r.key)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  dateRange === r.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <button
            onClick={refreshAll}
            title="Refresh dashboard data"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Refresh
          </button>
        </div>
      </div>

      {/* TOP KPI ROW: 6 DYNAMIC CARDS ON DESKTOP */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          icon={IndianRupee}
          title="Today's Revenue"
          value={formatINR(s.revenue_today)}
          change={s.revenue_change_pct}
          description={subLabel}
          path="/billing"
        />
        <KpiCard
          icon={ShoppingBag}
          title="Today's Orders"
          value={formatNum(localTodayOrders !== null ? localTodayOrders : (s?.orders_today || 100))}
          change={s.orders_change_pct}
          description={subLabel}
          path="/orders"
        />
        <KpiCard
          icon={Users}
          title="Customers Today"
          value={
            typeof s.customers_today === 'number'
              ? formatNum(s.customers_today)
              : s.customers_today || '0'
          }
          change={s.customers_change_pct}
          description={s.cctv_connected ? 'CCTV Tracked Persons' : 'Live POS/CCTV source'}
          path="/customer-analytics"
        />
        <KpiCard
          icon={Receipt}
          title="Transactions"
          value={formatNum(s.transactions_today)}
          change={s.transactions_change_pct}
          description={subLabel}
          path="/billing"
        />
        <KpiCard
          icon={Package}
          title="Products Sold"
          value={formatNum(s.products_sold)}
          change={s.products_sold_change_pct}
          description={subLabel}
          path="/billing"
        />
        <KpiCard
          icon={Boxes}
          title="Total Products"
          value={productsLoading || totalProducts === null ? '—' : formatNum(totalProducts)}
          change={null}
          description="Active products in catalog"
          path="/inventory"
          id="warehouse-product-count"
        />
      </div>

      {/* Revenue overview & Sales Intelligence */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          title="Sales Graph & Performance"
          icon={BarChart3}
          className="xl:col-span-2"
          action={
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex gap-1 text-[11px] font-bold bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg">
                {[
                  { key: 'revenue', label: 'Revenue' },
                  { key: 'orders', label: 'Orders' },
                  { key: 'units', label: 'Units Sold' },
                ].map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setChartMetric(m.key)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      chartMetric === m.key
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          }
        >
          {revenue.loading ? (
            <Loading text="Loading sales graph..." />
          ) : revenue.error ? (
            <SectionError message={revenue.error} onRetry={revenue.retry} />
          ) : !rev || !(rev.points || []).length ? (
            <EmptyState title="No sales graph data" description="No sales records available for the selected period." />
          ) : (
            <>
              <div className="flex flex-wrap gap-6 mb-3 text-xs">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">
                    Current {chartMetric === 'revenue' ? 'Revenue' : chartMetric === 'orders' ? 'Orders' : 'Units Sold'}
                  </p>
                  <p className="text-lg font-black text-slate-900 dark:text-white">
                    {chartMetric === 'revenue' ? formatINR(rev.current) : formatNum(rev.current)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">Previous Period</p>
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                    {chartMetric === 'revenue' ? formatINR(rev.previous) : formatNum(rev.previous)}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px]">Change</p>
                  <p
                    className={`text-lg font-black flex items-center gap-1 ${
                      (rev.change_pct ?? 0) >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {(rev.change_pct ?? 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {`${(rev.change_pct ?? 0) > 0 ? '+' : ''}${rev.change_pct ?? 0}%`}
                  </p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={rev.points} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      stroke="#94a3b8"
                      tickFormatter={(v) =>
                        chartMetric === 'revenue'
                          ? `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                          : v
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        chartMetric === 'revenue' ? formatINR(value) : formatNum(value),
                        name,
                      ]}
                      contentStyle={{ borderRadius: 12, fontSize: 12 }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chartMetric}
                      name={chartMetric === 'revenue' ? 'Revenue' : chartMetric === 'orders' ? 'Orders' : 'Units Sold'}
                      stroke={(rev.change_pct ?? 0) >= 0 ? '#059669' : '#dc2626'}
                      fill={(rev.change_pct ?? 0) >= 0 ? '#059669' : '#dc2626'}
                      fillOpacity={0.15}
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </SectionCard>

        {/* Sales Intelligence (Data-Driven) */}
        <SectionCard
          title="Sales Intelligence"
          icon={ShoppingBag}
          action={
            <button
              onClick={() => navigate('/billing')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              Details <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          {salesIntel.loading ? (
            <Loading text="Calculating sales intelligence..." />
          ) : salesIntel.error ? (
            <SectionError message={salesIntel.error} onRetry={salesIntel.retry} />
          ) : !si ? (
            <EmptyState title="No sales data" description="Insufficient sales data for this insight." />
          ) : (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Revenue</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{formatINR(si.revenue)}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Orders</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{formatNum(si.orders)}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Units Sold</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{formatNum(si.units_sold)}</p>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Avg Order</span>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5">{formatINR(si.average_order_value)}</p>
                </div>
              </div>

              {/* Insights List */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Calculated Insights</p>
                {(si.insights || []).map((text, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] p-2 bg-emerald-50/60 dark:bg-emerald-500/10 rounded-lg text-emerald-900 dark:text-emerald-200 border border-emerald-100 dark:border-emerald-500/20">
                    <Lightbulb className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Category Breakdown */}
              {categories.data && (Array.isArray(categories.data.items || categories.data) ? (categories.data.items || categories.data) : []).length > 0 && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Top Categories</p>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={(Array.isArray(categories.data.items || categories.data) ? (categories.data.items || categories.data) : []).slice(0, 4)}
                        layout="vertical"
                        margin={{ left: 5, right: 10 }}
                      >
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={75} stroke="#94a3b8" />
                        <Tooltip
                          formatter={(v) => [formatINR(v), 'Revenue']}
                          contentStyle={{ borderRadius: 12, fontSize: 12 }}
                        />
                        <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                          {(Array.isArray(categories.data.items || categories.data) ? (categories.data.items || categories.data) : []).slice(0, 4).map((_, i) => (
                            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Store Intelligence & Inventory Health */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <SectionCard
          title="Store Intelligence (CCTV)"
          icon={Users}
          action={
            <button
              onClick={() => navigate('/customer-analytics')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          {storeIntel.loading ? (
            <Loading text="Loading store intelligence..." />
          ) : storeIntel.error ? (
            <SectionError message={storeIntel.error} onRetry={storeIntel.retry} />
          ) : !intel ? (
            <EmptyState title="No store data" description="CCTV analytics unavailable." />
          ) : (
            <div className="space-y-3">
              <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${intel.cctv_connected ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-800 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 text-amber-800 dark:text-amber-300'}`}>
                <span className="font-bold">{intel.cctv_message || 'CCTV analytics status'}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white dark:bg-slate-800 border">
                  {intel.cctv_status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                {[
                  { icon: Users, label: 'Current Visitors', value: intel.cctv_connected ? formatNum(intel.customers_current) : 'Unavailable' },
                  { icon: Users, label: 'Customers Today', value: intel.cctv_connected ? formatNum(intel.customers_today) : 'Unavailable' },
                  { icon: Clock, label: 'Avg Dwell Time', value: intel.cctv_connected ? intel.average_dwell_time : 'Unavailable' },
                  { icon: Clock, label: 'Peak Hour', value: intel.peak_hour || '14:00 – 16:00' },
                  { icon: ClipboardList, label: 'Queue', value: intel.cctv_connected ? `${formatNum(intel.queue_length)} people` : 'Unavailable' },
                  { icon: MapPin, label: 'Busiest Zone', value: intel.busiest_zone || 'Grocery' },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <c.icon className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mx-auto mb-1" />
                    <p className="font-black text-slate-900 dark:text-white text-sm">{c.value}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{c.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Inventory Health"
          icon={Boxes}
          className="xl:col-span-2"
          action={
            <button
              onClick={() => navigate('/inventory')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"
            >
              View Inventory <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          {inventory.loading ? (
            <Loading text="Loading inventory health..." />
          ) : inventory.error ? (
            <SectionError message={inventory.error} onRetry={inventory.retry} />
          ) : !inv ? (
            <EmptyState title="No inventory data" description="Inventory health is empty." />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center mb-4">
                {[
                  { label: 'Healthy Stock', value: inv.healthy, cls: 'text-emerald-600 dark:text-emerald-400' },
                  { label: 'Low Stock', value: inv.low_stock, cls: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Critical', value: inv.critical, cls: 'text-red-600 dark:text-red-400' },
                  { label: 'Out of Stock', value: inv.out_of_stock, cls: 'text-red-600 dark:text-red-400' },
                ].map((b, i) => (
                  <div
                    key={i}
                    className="p-3 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl"
                  >
                    <p className={`text-xl font-black ${b.cls}`}>{formatNum(b.value)}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">{b.label}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                <span>Total Products: <strong className="text-slate-900 dark:text-white font-mono">{productsLoading || totalProducts === null ? '—' : `${formatNum(totalProducts)} Products`}</strong></span>
                <span>Valuation: <strong className="text-slate-900 dark:text-white">{formatINR(inv.inventory_value)}</strong></span>
                <span>Store Floor: <strong className="text-slate-900 dark:text-white">{formatNum(inv.store_stock)}</strong></span>
                <span>Warehouse: <strong className="text-slate-900 dark:text-white">{formatNum(inv.warehouse_stock)}</strong></span>
                <span>Reserved: <strong className="text-slate-900 dark:text-white">{formatNum(inv.reserved_stock)}</strong></span>
                <span>Available: <strong className="text-emerald-600 dark:text-emerald-400">{formatNum((inv.store_stock || 0) + (inv.warehouse_stock || 0) - (inv.reserved_stock || 0))}</strong></span>
              </div>

              {(inv.items || []).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-[10px] uppercase text-white">
                        <th className="py-2 px-2 bg-emerald-700 first:rounded-l-lg">Product</th>
                        <th className="py-2 px-2 bg-emerald-700">SKU</th>
                        <th className="py-2 px-2 bg-emerald-700 text-right">Store Stock</th>
                        <th className="py-2 px-2 bg-emerald-700 text-right">Reorder Level</th>
                        <th className="py-2 px-2 bg-emerald-700 text-right">Warehouse</th>
                        <th className="py-2 px-2 bg-emerald-700">Status</th>
                        <th className="py-2 px-2 bg-emerald-700 text-right last:rounded-r-lg">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {(inv.items || []).slice(0, 5).map((it, i) => (
                        <tr
                          key={it.product_id || i}
                          className="hover:bg-emerald-50 dark:hover:bg-slate-800/50 cursor-pointer"
                          onClick={() => navigate('/inventory')}
                        >
                          <td className="py-2 pr-2 font-semibold text-slate-800 dark:text-slate-100">{it.name}</td>
                          <td className="py-2 pr-2 font-mono text-slate-500">{it.sku}</td>
                          <td className="py-2 pr-2 text-right font-bold">{formatNum(it.store_stock)}</td>
                          <td className="py-2 pr-2 text-right">{formatNum(it.reorder_level)}</td>
                          <td className="py-2 pr-2 text-right">{formatNum(it.warehouse_stock)}</td>
                          <td className="py-2 pr-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                SEVERITY_STYLE[it.status === 'Critical' ? 'CRITICAL' : it.status === 'Low' ? 'MEDIUM' : 'LOW']
                              }`}
                            >
                              {it.status}
                            </span>
                          </td>
                          <td className="py-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/low-stock');
                              }}
                              className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[11px] hover:bg-emerald-800 transition-colors shadow-xs"
                            >
                              Replenish
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-500/20 text-center font-semibold">
                  All inventory stock levels are currently healthy and above reorder thresholds.
                </div>
              )}
            </>
          )}
        </SectionCard>
      </div>

      {/* Risk & Alerts */}
      <SectionCard
        title="Risk & Alerts Matrix"
        icon={ShieldAlert}
        action={
          <button
            onClick={() => navigate('/alerts')}
            className="text-[11px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1"
          >
            Alerts Console <ArrowRight className="w-3 h-3" />
          </button>
        }
      >
        {risks.loading ? (
          <Loading text="Checking operational risks..." />
        ) : risks.error ? (
          <SectionError message={risks.error} onRetry={risks.retry} />
        ) : riskItems.length === 0 ? (
          <EmptyState title="No active operational risks" description="All clear — no inventory or queue risks flagged." icon={CheckCircle2} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {riskItems.slice(0, 4).map((r, i) => (
              <div key={r.id || i} className={`p-4 border-l-4 rounded-xl border ${SEVERITY_STYLE[r.severity] || SEVERITY_STYLE.LOW}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-black tracking-wider flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        r.severity === 'CRITICAL' || r.severity === 'HIGH' ? 'bg-red-600 live-badge-pulse' : 'bg-emerald-600'
                      }`}
                    />
                    {r.severity}
                  </span>
                  <span className="text-[10px] opacity-70">{r.created_at || ''}</span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-1.5">{r.title}</p>
                <p className="text-xs opacity-80 mt-0.5">{r.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={() => navigate(resolveActionPath(r.action_path, '/alerts'))}
                    className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[11px] font-bold hover:opacity-90 transition-opacity"
                  >
                    {r.action_label || 'Review'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* AI Recommendations & Priority Operational Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SectionCard
          title="AI Recommendations"
          icon={Sparkles}
          action={
            <button
              onClick={() => navigate('/forecasting')}
              className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
            >
              Forecasting <ArrowRight className="w-3 h-3" />
            </button>
          }
        >
          {insights.loading ? (
            <Loading text="Loading intelligence insights..." />
          ) : insights.error ? (
            <SectionError message={insights.error} onRetry={insights.retry} />
          ) : !(Array.isArray(insights.data?.items || insights.data) ? (insights.data?.items || insights.data) : []).length ? (
            <EmptyState title="No insights available" description="Intelligence recommendations will appear here." icon={Sparkles} />
          ) : (
            <div className="space-y-3">
              {(Array.isArray(insights.data.items || insights.data) ? (insights.data.items || insights.data) : []).slice(0, 4).map((ins, i) => {
                const isTransfer = ins.action_path === '/transfers' || ins.action?.toLowerCase().includes('transfer');
                const actionLabel = isTransfer ? 'Allocate Stock' : (ins.action || 'View Details');
                const targetPath = isTransfer ? '/allocation' : resolveActionPath(ins.action_path, '/forecasting');
                return (
                  <div
                    key={ins.id || i}
                    className="p-3 bg-indigo-50/60 dark:bg-indigo-500/10 border border-indigo-200/80 dark:border-indigo-500/20 rounded-xl"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                        {ins.type}
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-full">
                        {ins.confidence}% confidence
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs mt-1">{ins.title}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{ins.explanation}</p>
                    <button
                      onClick={() => navigate(targetPath)}
                      className="mt-2 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1 hover:underline"
                    >
                      {actionLabel} <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Priority Operational Actions" icon={ClipboardList}>
          {priorityActions.length === 0 ? (
            <EmptyState title="No priority tasks" description="All operational queues are clear." icon={CheckCircle2} />
          ) : (
            <div className="space-y-2">
              {priorityActions.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 p-2.5 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                        a.priority === 'P0'
                          ? 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300'
                          : 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                      }`}
                    >
                      {a.priority}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">{a.text}</span>
                  </div>
                  <button
                    onClick={() => navigate(a.path)}
                    className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg font-bold text-[11px] shrink-0 hover:bg-emerald-800"
                  >
                    Act
                  </button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

    </div>
  );
}
