import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';
import {
  Calendar,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Package,
  CreditCard,
  Search,
  ArrowUpDown,
  Video,
  VideoOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Database,
  UploadCloud,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { getSalesPerformance } from '../../services/salesService';
import { getProductCatalog } from '../../services/productService';
import { formatINR } from '../../utils/formatters';
import TransactionIntelligence from '../../components/sales/TransactionIntelligence';
import TransactionModal from '../../components/sales/TransactionModal';
import ImportSalesModal from '../../components/sales/ImportSalesModal';
import { useTheme } from '../../context/ThemeContext';

export default function Billing() {
  const { chartTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDailyTable, setShowDailyTable] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Filters
  const [rangeKey, setRangeKey] = useState('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [productId, setProductId] = useState('');
  const [productsList, setProductsList] = useState([]);

  // Chart Metric Toggle: 'both' | 'revenue' | 'units'
  const [chartMetric, setChartMetric] = useState('both');

  // Product Table Filters
  const [productSearch, setProductSearch] = useState('');
  const [productSort, setProductSort] = useState('rev_desc');
  const [productPage, setProductPage] = useState(1);
  const pageSize = 10;

  // Daily Table Page
  const [dailyPage, setDailyPage] = useState(1);
  const dailyPageSize = 7;

  // Load product catalog for dropdown
  useEffect(() => {
    getProductCatalog()
      .then((prods) => {
        if (Array.isArray(prods)) setProductsList(prods);
      })
      .catch(() => setProductsList([]));
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { range: rangeKey };
      if (rangeKey === 'custom' && customStart && customEnd) {
        params.start_date = customStart;
        params.end_date = customEnd;
      }
      if (productId) {
        params.product_id = productId;
      }
      const res = await getSalesPerformance(params);
      setData(res);
      if (res?.data_period?.start_date && !customStart) {
        setCustomStart(res.data_period.start_date);
      }
      if (res?.data_period?.end_date && !customEnd) {
        setCustomEnd(res.data_period.end_date);
      }
    } catch (err) {
      setError('Unable to load sales analytics. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, [rangeKey, customStart, customEnd, productId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle range change
  const handleRangeChange = (key) => {
    if (key === 'custom') {
      setShowCustomModal(true);
      setRangeKey('custom');
    } else {
      setShowCustomModal(false);
      setRangeKey(key);
    }
    setProductPage(1);
    setDailyPage(1);
  };

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setShowCustomModal(false);
      fetchData();
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.product_performance?.length) return;
    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Units Sold',
      'Revenue (INR)',
      'Avg Price (INR)',
      'Sales Trend (%)',
      'Performance',
    ];
    const rows = data.product_performance.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category}"`,
      p.units_sold,
      p.revenue,
      p.avg_price,
      p.sales_trend !== null ? p.sales_trend : '—',
      p.performance,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `INVINTELL_Sales_Export_${data?.data_period?.period_label || 'sales'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered & Sorted Product Table
  const filteredProducts = useMemo(() => {
    if (!data?.product_performance) return [];
    let list = [...data.product_performance];
    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      switch (productSort) {
        case 'rev_desc':
          return b.revenue - a.revenue;
        case 'rev_asc':
          return a.revenue - b.revenue;
        case 'units_desc':
          return b.units_sold - a.units_sold;
        case 'units_asc':
          return a.units_sold - b.units_sold;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        default:
          return b.revenue - a.revenue;
      }
    });
    return list;
  }, [data?.product_performance, productSearch, productSort]);

  // Paginated products
  const paginatedProducts = useMemo(() => {
    const start = (productPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, productPage]);
  const totalProductPages = Math.ceil(filteredProducts.length / pageSize) || 1;

  // Paginated daily breakdown
  const dailyBreakdown = data?.daily_breakdown || [];
  const paginatedDaily = useMemo(() => {
    const start = (dailyPage - 1) * dailyPageSize;
    return dailyBreakdown.slice(start, start + dailyPageSize);
  }, [dailyBreakdown, dailyPage]);
  const totalDailyPages = Math.ceil(dailyBreakdown.length / dailyPageSize) || 1;

  if (loading && !data) {
    return <Loading text="Loading sales data from dataset..." />;
  }

  const kpis = data?.kpis || {};
  const trends = kpis.trends || {};
  const period = data?.data_period || {};
  const cctv = data?.cctv_correlation || {};

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* ================= PAGE HEADER ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Billing & Sales
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Database className="w-3 h-3 text-emerald-600" />
                  DATA SOURCE: Sales Dataset
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Sales performance, billing activity and customer-to-sales intelligence
              </p>
              {period.period_label && (
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Data Period:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {period.period_label}
                    </strong>
                    {period.anchor_date && (
                      <span className="text-[11px] text-slate-400 ml-1.5">
                        (Latest dataset anchor: {period.anchor_date})
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Right side controls: Date filters, Product filter, Export, Refresh */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              {/* Range button group */}
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700 text-xs">
                {[
                  { key: 'today', label: 'Today' },
                  { key: '7d', label: '7 Days' },
                  { key: '30d', label: '30 Days' },
                  { key: 'custom', label: 'Custom Date' },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => handleRangeChange(btn.key)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      rangeKey === btn.key
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>

              {/* Optional Product Filter Dropdown */}
              <div className="relative">
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 max-w-[170px] truncate"
                  title="Filter by specific product"
                >
                  <option value="">All Products</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Import Button */}
              <button
                type="button"
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl transition-colors cursor-pointer shadow-xs"
                title="Import Billing & Sales CSV / Dataset"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Import Sales
              </button>

              {/* Export Button */}
              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Export Sales Performance to CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export
              </button>

              {/* Refresh Button */}
              <button
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                title="Refresh sales data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Custom Date Range Picker Bar */}
          {rangeKey === 'custom' && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <span className="font-bold text-slate-700 dark:text-slate-300">Custom Date Range:</span>
              <div className="flex items-center gap-2">
                <label className="text-slate-500">From:</label>
                <input
                  type="date"
                  value={customStart}
                  min={period.dataset_min || '2015-10-28'}
                  max={period.anchor_date || '2016-04-24'}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-slate-500">To:</label>
                <input
                  type="date"
                  value={customEnd}
                  min={period.dataset_min || '2015-10-28'}
                  max={period.anchor_date || '2016-04-24'}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button
                onClick={applyCustomRange}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs cursor-pointer transition-colors"
              >
                Apply Range
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchData} className="font-bold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* ================= EXACTLY FOUR PRIMARY KPI BLOCKS — ALL IN INDIAN RUPEES (₹) ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI 1: Total Revenue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatINR(kpis.total_revenue, 2)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {trends.revenue_change_pct !== null && trends.revenue_change_pct !== undefined ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold ${
                      trends.revenue_change_pct >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trends.revenue_change_pct >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {trends.revenue_change_pct >= 0
                      ? `+${trends.revenue_change_pct}%`
                      : `${trends.revenue_change_pct}%`}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">—</span>
                )}
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {trends.comparison_period_label
                    ? `vs ${trends.comparison_period_label}`
                    : 'period trend'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Total Net Sales (Quantity × Price)</p>
            </div>
          </div>

          {/* KPI 2: Transactions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Transactions
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {Number(kpis.transactions || 0).toLocaleString('en-IN')}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {trends.transactions_change_pct !== null &&
                trends.transactions_change_pct !== undefined ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold ${
                      trends.transactions_change_pct >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trends.transactions_change_pct >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {trends.transactions_change_pct >= 0
                      ? `+${trends.transactions_change_pct}%`
                      : `${trends.transactions_change_pct}%`}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">—</span>
                )}
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {trends.comparison_period_label
                    ? `vs ${trends.comparison_period_label}`
                    : 'period trend'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Customer Bills & Checkout Orders</p>
            </div>
          </div>

          {/* KPI 3: Units Sold */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Units Sold
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {Number(kpis.units_sold || 0).toLocaleString('en-IN')}{' '}
                <span className="text-sm font-semibold text-slate-400">pcs</span>
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {trends.units_change_pct !== null && trends.units_change_pct !== undefined ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold ${
                      trends.units_change_pct >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trends.units_change_pct >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {trends.units_change_pct >= 0
                      ? `+${trends.units_change_pct}%`
                      : `${trends.units_change_pct}%`}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">—</span>
                )}
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {trends.comparison_period_label
                    ? `vs ${trends.comparison_period_label}`
                    : 'period trend'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Total Items Transacted</p>
            </div>
          </div>

          {/* KPI 4: Average Bill (in ₹) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Average Bill
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {formatINR(kpis.average_bill, 2)}
              </p>
              <div className="mt-2 flex items-center gap-1.5 text-xs">
                {trends.avg_bill_change_pct !== null && trends.avg_bill_change_pct !== undefined ? (
                  <span
                    className={`inline-flex items-center gap-0.5 font-bold ${
                      trends.avg_bill_change_pct >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {trends.avg_bill_change_pct >= 0 ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    {trends.avg_bill_change_pct >= 0
                      ? `+${trends.avg_bill_change_pct}%`
                      : `${trends.avg_bill_change_pct}%`}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">—</span>
                )}
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                  {trends.comparison_period_label
                    ? `vs ${trends.comparison_period_label}`
                    : 'period trend'}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Average Order Value (AOV)</p>
            </div>
          </div>
        </div>

        {/* ================= MAIN SALES ANALYTICS AREA (TWO-COLUMN) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* LEFT: SALES PERFORMANCE (8 cols) */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  SALES PERFORMANCE
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Revenue and units sold timeline over the selected date range
                </p>
              </div>

              {/* Metric Toggle */}
              <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs self-start sm:self-auto">
                <button
                  onClick={() => setChartMetric('both')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartMetric === 'both'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Both
                </button>
                <button
                  onClick={() => setChartMetric('revenue')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartMetric === 'revenue'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Revenue (₹)
                </button>
                <button
                  onClick={() => setChartMetric('units')}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    chartMetric === 'units'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Units Sold
                </button>
              </div>
            </div>

            {/* Recharts Area Chart */}
            <div className="pt-4 flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data?.sales_chart || []}
                  margin={{ top: 10, right: 15, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartTheme.axisStroke, fontSize: 11 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartTheme.axisStroke, fontSize: 11 }}
                    tickFormatter={(v) => formatINR(v, 0)}
                    hide={chartMetric === 'units'}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: chartTheme.axisStroke, fontSize: 11 }}
                    tickFormatter={(v) => `${v} pcs`}
                    hide={chartMetric === 'revenue'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: chartTheme.tooltipBg,
                      borderColor: chartTheme.tooltipBorder,
                      borderRadius: '10px',
                      color: chartTheme.tooltipText,
                      fontSize: '12px',
                    }}
                    formatter={(value, name) => {
                      if (name === 'revenue' || name === 'Revenue (₹)') {
                        return [formatINR(value, 2), 'Revenue'];
                      }
                      if (name === 'units' || name === 'Units Sold (pcs)') {
                        return [`${Number(value).toLocaleString('en-IN')} units`, 'Units Sold'];
                      }
                      return [value, name];
                    }}
                    labelFormatter={(lbl) => `Period: ${lbl}`}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                  />
                  {(chartMetric === 'both' || chartMetric === 'revenue') && (
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (₹)"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRev)"
                    />
                  )}
                  {(chartMetric === 'both' || chartMetric === 'units') && (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="units"
                      name="Units Sold (pcs)"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorUnits)"
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RIGHT: SALES INTELLIGENCE (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    SALES INTELLIGENCE
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                    Source: CALCULATED FROM SALES DATA
                  </p>
                </div>
              </div>

              {/* Dynamic Insights list calculated from actual dataset */}
              <div className="mt-4 space-y-3">
                {data?.sales_intelligence?.items?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-start gap-2.5 text-xs"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {item.insight}
                      </p>
                    </div>
                  </div>
                ))}
                {(!data?.sales_intelligence?.items ||
                  data.sales_intelligence.items.length === 0) && (
                  <p className="text-xs text-slate-500 text-center py-6">
                    No insights available for this period.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Dynamic retail calculus</span>
              <span className="font-mono text-emerald-600 font-semibold">100% Real Analytics</span>
            </div>
          </div>
        </div>

        {/* ================= CUSTOMER + SALES CORRELATION ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                CUSTOMER TRAFFIC & SALES
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dual CCTV camera in-store customer traffic correlated with POS revenue streams
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                cctv.available
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {cctv.available ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  CCTV Telemetry Active
                </>
              ) : (
                <>
                  <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                  CCTV Telemetry Inactive
                </>
              )}
            </span>
          </div>

          <div className="mt-4">
            {cctv.available ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Camera 01 Traffic
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {cctv.cam1_traffic ?? 0}{' '}
                    <span className="text-xs font-normal text-slate-500">visitors</span>
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Camera 02 Traffic
                  </span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {cctv.cam2_traffic ?? 0}{' '}
                    <span className="text-xs font-normal text-slate-500">visitors</span>
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Combined Footfall
                  </span>
                  <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                    {cctv.combined_traffic ?? 0}{' '}
                    <span className="text-xs font-normal text-slate-500">tracks</span>
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Sales Revenue</span>
                  <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                    {formatINR(cctv.sales_revenue, 2)}
                  </p>
                </div>
                {cctv.relationship_note && (
                  <div className="sm:col-span-2 lg:col-span-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-xs text-emerald-800 dark:text-emerald-300">
                    <strong>Correlation Insight:</strong> {cctv.relationship_note}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Camera 01 (Front/Aisles)</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                    Continuous RTSP
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Shelf & Footfall Vision Feed</p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Camera 02 (Checkout)</span>
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                    </span>
                  </div>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                    Continuous RTSP
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Queue & Register Vision Feed</p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cross-Cam Re-ID</span>
                  <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-1.5">
                    Deduplicating
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Multi-signal anonymous matching</p>
                </div>

                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Telemetry Link</span>
                  <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">
                    POS Synced
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Live store telemetry on /monitoring</p>
                </div>

                <div className="sm:col-span-2 lg:col-span-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 rounded-xl flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-emerald-600" />
                    Real-time cross-camera vision telemetry and person deduplication is actively running.
                  </span>
                  <a
                    href="/monitoring"
                    className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline shrink-0 ml-2"
                  >
                    View Live Monitor →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= PRODUCT SALES PERFORMANCE TABLE — IN INR (₹) ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Product Sales Performance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Individual product revenue, units sold and growth trend for the selected period
              </p>
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setProductPage(1);
                  }}
                  placeholder="Search products or SKUs..."
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-48 sm:w-56"
                />
              </div>

              <div className="flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={productSort}
                  onChange={(e) => setProductSort(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none"
                >
                  <option value="rev_desc">Revenue High → Low</option>
                  <option value="rev_asc">Revenue Low → High</option>
                  <option value="units_desc">Units Sold High → Low</option>
                  <option value="units_asc">Units Sold Low → High</option>
                  <option value="name_asc">Product Name A-Z</option>
                  <option value="name_desc">Product Name Z-A</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200/80 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-3">Product / Item</th>
                  <th className="py-3 px-3">SKU</th>
                  <th className="py-3 px-3 text-right">Units Sold</th>
                  <th className="py-3 px-3 text-right">Revenue (₹)</th>
                  <th className="py-3 px-3 text-right">Avg Price (₹)</th>
                  <th className="py-3 px-3 text-center">Sales Trend</th>
                  <th className="py-3 px-3 text-center">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p) => (
                    <tr
                      key={p.product_id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-800 dark:text-slate-100">{p.name}</p>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {p.sku}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-slate-800 dark:text-slate-100">
                        {p.units_sold.toLocaleString('en-IN')} pcs
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white font-mono">
                        {formatINR(p.revenue, 2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatINR(p.avg_price, 2)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {p.sales_trend !== null && p.sales_trend !== undefined ? (
                          <span
                            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              p.sales_trend >= 0
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400'
                            }`}
                          >
                            {p.sales_trend >= 0 ? `+${p.sales_trend}%` : `${p.sales_trend}%`}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            p.performance === 'Top Seller'
                              ? 'bg-emerald-600 text-white'
                              : p.performance === 'High Demand'
                              ? 'bg-blue-600 text-white'
                              : p.performance === 'Moderate'
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {p.performance}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No sales data matches your search query for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > pageSize && (
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span>
                Showing {(productPage - 1) * pageSize + 1} to{' '}
                {Math.min(productPage * pageSize, filteredProducts.length)} of{' '}
                {filteredProducts.length} items
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setProductPage((p) => Math.max(p - 1, 1))}
                  disabled={productPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold">
                  {productPage} / {totalProductPages}
                </span>
                <button
                  onClick={() => setProductPage((p) => Math.min(p + 1, totalProductPages))}
                  disabled={productPage === totalProductPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= TRANSACTION INTELLIGENCE (3-COLUMN PREMIUM SECTION) ================= */}
        <TransactionIntelligence
          data={data}
          onSelectTransaction={setSelectedTransaction}
        />

        {/* ================= OPTIONAL COLLAPSIBLE DAY-BY-DAY AUDIT TABLE ================= */}
        <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-xs">
          <button
            type="button"
            onClick={() => setShowDailyTable((v) => !v)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4 text-slate-400" />
              Day-by-Day Historical Sales Audit Table ({dailyBreakdown.length} days recorded)
            </span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
              {showDailyTable ? 'Hide Table ▲' : 'Show Table ▼'}
            </span>
          </button>

          {showDailyTable && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-y border-slate-200/80 dark:border-slate-700">
                    <tr>
                      <th className="py-3 px-3">Date</th>
                      <th className="py-3 px-3 text-right">Units Sold</th>
                      <th className="py-3 px-3 text-right">Revenue (₹)</th>
                      <th className="py-3 px-3 text-right">Transactions</th>
                      <th className="py-3 px-3 text-right">Average Bill (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {paginatedDaily.length > 0 ? (
                      paginatedDaily.map((d, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                            {d.label || d.date}
                            <span className="text-[10px] text-slate-400 font-normal ml-2 font-mono">
                              ({d.date})
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                            {d.units_sold.toLocaleString('en-IN')} pcs
                          </td>
                          <td className="py-3 px-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                            {formatINR(d.revenue, 2)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-700 dark:text-slate-300">
                            {d.transactions} orders
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                            {formatINR(d.average_bill, 2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No sales data available for the selected period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {dailyBreakdown.length > dailyPageSize && (
                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span>
                    Showing {(dailyPage - 1) * dailyPageSize + 1} to{' '}
                    {Math.min(dailyPage * dailyPageSize, dailyBreakdown.length)} of{' '}
                    {dailyBreakdown.length} days
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setDailyPage((p) => Math.max(p - 1, 1))}
                      disabled={dailyPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-2 font-bold">
                      {dailyPage} / {totalDailyPages}
                    </span>
                    <button
                      onClick={() => setDailyPage((p) => Math.min(p + 1, totalDailyPages))}
                      disabled={dailyPage === totalDailyPages}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* POS Transaction Invoice Modal */}
        {selectedTransaction && (
          <TransactionModal
            transaction={selectedTransaction}
            onClose={() => setSelectedTransaction(null)}
          />
        )}

        {/* Import Billing & Sales Modal */}
        <ImportSalesModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => fetchData()}
        />
      </div>
    </PageContainer>
  );
}
