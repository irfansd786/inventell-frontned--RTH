import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AnalyticsHeader from '../../components/store-intelligence/AnalyticsHeader';
import ForecastDetailModal from '../../components/inventory/ForecastDetailModal';
import ReplenishmentModal from '../../components/inventory/ReplenishmentModal';
import Loading from '../../components/common/Loading';
import { getForecastData } from '../../services/forecastService';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

import {
  TrendingUp,
  Target,
  Calendar,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowRight,
  Package,
  Layers,
  ShieldCheck,
  Tag,
  Compass,
  Video,
  Box,
} from 'lucide-react';

export default function Forecasting() {
  const { toast } = useToast();
  const { chartTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [replenishProduct, setReplenishProduct] = useState(null);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    event: 'All', // 'All' or festival id (e.g. 'vinayaka-chaturthi', 'dussehra')
    category: 'All', // 'All' or category name
    periodDays: 14, // 7 | 14 | 30
    opportunity: 'All', // 'All' | 'High' | 'Medium' | 'Low'
    risk: 'All', // 'All' | 'Replenishment Required' | 'Stock Sufficient' | 'Excess Stock' | 'Insufficient Data'
    sort: 'opp_desc', // 'opp_desc' | 'demand_desc' | 'demand_asc' | 'increase_desc' | 'stock_asc' | 'stock_desc'
  });

  // Top Forecasted Display Count
  const [topLimit, setTopLimit] = useState(5);

  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getForecastData({
        category: filters.category !== 'All' ? filters.category : null,
        event_id: filters.event !== 'All' ? filters.event : null,
        period_days: filters.periodDays,
      });
      setData(result);
    } catch (err) {
      console.error('Failed to load demand forecasting dataset', err);
      toast.error('Network Error', 'Unable to fetch demand forecasting data.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters.category, filters.event, filters.periodDays, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter changes & reset pagination
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      event: 'All',
      category: 'All',
      periodDays: 14,
      opportunity: 'All',
      risk: 'All',
      sort: 'opp_desc',
    });
    setCurrentPage(1);
  };

  // Distinct Categories
  const categoryOptions = useMemo(() => {
    if (!data?.products) return [];
    const cats = Array.from(new Set(data.products.map((p) => p.category).filter(Boolean))).sort();
    return cats;
  }, [data]);

  // Single Source of Truth: Filtered Products
  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];

    return data.products
      .filter((item) => {
        // 1. Search across Name, SKU, ID, Category, Department
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const nameMatch = (item.name || '').toLowerCase().includes(q);
          const skuMatch = (item.sku || '').toLowerCase().includes(q);
          const idMatch = String(item.id || '').toLowerCase().includes(q);
          const catMatch = (item.category || '').toLowerCase().includes(q);
          const deptMatch = (item.department || '').toLowerCase().includes(q);
          if (!nameMatch && !skuMatch && !idMatch && !catMatch && !deptMatch) {
            return false;
          }
        }

        // 2. Category
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }

        // 3. Opportunity Tier
        if (filters.opportunity !== 'All' && item.opportunityTier !== filters.opportunity) {
          return false;
        }

        // 4. Risk Level
        if (filters.risk !== 'All' && item.risk !== filters.risk) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case 'demand_desc':
            return (b.forecastDemand || 0) - (a.forecastDemand || 0);
          case 'demand_asc':
            return (a.forecastDemand || 0) - (b.forecastDemand || 0);
          case 'increase_desc':
            return (b.expectedIncreasePct || 0) - (a.expectedIncreasePct || 0);
          case 'stock_asc':
            return (a.storeStock || 0) - (b.storeStock || 0);
          case 'stock_desc':
            return (b.storeStock || 0) - (a.storeStock || 0);
          case 'opp_desc':
          default:
            return (b.opportunityScore || 0) - (a.opportunityScore || 0);
        }
      });
  }, [data, filters]);

  // Derived Filter-Dependent KPIs
  const kpis = useMemo(() => {
    const totalProducts = filteredProducts.length;
    const oppCount = filteredProducts.filter((p) => (p.expectedIncreasePct || 0) > 0).length;
    const replenishCount = filteredProducts.filter((p) => p.risk === 'Replenishment Required').length;
    const totalRiskVal = filteredProducts
      .filter((p) => p.risk === 'Replenishment Required')
      .reduce((sum, p) => sum + (p.deficit || 0) * (p.price || 0), 0);

    return {
      productsForecasted: totalProducts,
      demandOpportunities: oppCount,
      replenishmentRequired: replenishCount,
      inventoryRisk: totalRiskVal,
      upcomingEvents: data?.events?.length || 9,
      modelAccuracy: data?.kpis?.accuracy || '91.4%',
      demandIncrease: data?.kpis?.demandIncrease || '+65%',
      modelName: data?.kpis?.model_name || 'Ridge Regression Baseline',
    };
  }, [filteredProducts, data]);

  // Top Forecasted Products
  const topForecastedProducts = useMemo(() => {
    return [...filteredProducts]
      .filter((p) => (p.forecastDemand || 0) > 0)
      .sort((a, b) => (b.forecastDemand || 0) - (a.forecastDemand || 0))
      .slice(0, topLimit);
  }, [filteredProducts, topLimit]);

  // Category Demand Forecast Aggregation
  const categoryDemandData = useMemo(() => {
    const catMap = {};
    filteredProducts.forEach((p) => {
      const c = p.category || 'General';
      if (!catMap[c]) {
        catMap[c] = {
          category: c,
          baselineDemand: 0,
          forecastDemand: 0,
          productCount: 0,
          replenishCount: 0,
        };
      }
      catMap[c].baselineDemand += p.baselineDemand || 0;
      catMap[c].forecastDemand += p.forecastDemand || 0;
      catMap[c].productCount += 1;
      if (p.risk === 'Replenishment Required') {
        catMap[c].replenishCount += 1;
      }
    });

    return Object.values(catMap)
      .map((row) => ({
        ...row,
        baselineDemand: Math.round(row.baselineDemand),
        forecastDemand: Math.round(row.forecastDemand),
        growthPct:
          row.baselineDemand > 0
            ? Math.round(((row.forecastDemand - row.baselineDemand) / row.baselineDemand) * 100)
            : 0,
      }))
      .sort((a, b) => b.forecastDemand - a.forecastDemand);
  }, [filteredProducts]);

  // Event Inventory Preparation Segments
  const inventoryPreparation = useMemo(() => {
    return {
      replenish: filteredProducts.filter((p) => p.risk === 'Replenishment Required'),
      sufficient: filteredProducts.filter((p) => p.risk === 'Stock Sufficient' && (p.expectedIncreasePct || 0) > 0),
      excess: filteredProducts.filter((p) => p.risk === 'Excess Stock'),
    };
  }, [filteredProducts]);

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.event !== 'All' ||
    filters.category !== 'All' ||
    filters.periodDays !== 14 ||
    filters.opportunity !== 'All' ||
    filters.risk !== 'All' ||
    filters.sort !== 'opp_desc';

  // Dynamic Today Label formatted as 'DD MMM'
  const todayLabel = useMemo(() => {
    const rawDate = data?.system_date;
    if (!rawDate) {
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(now.getDate()).padStart(2, '0')} ${months[now.getMonth()]}`;
    }
    const parts = rawDate.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const dt = new Date(year, month, day);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(dt.getDate()).padStart(2, '0')} ${months[dt.getMonth()]}`;
    }
    return null;
  }, [data?.system_date]);

  if (loading && !data) {
    return <Loading text="Loading Demand Forecasting & Inventory Planning System..." />;
  }

  const activeEvent = data?.active_event || data?.events?.[0];

  return (
    <PageContainer>
      {/* ================= PAGE HEADER ================= */}
      <AnalyticsHeader
        title="FORECASTING"
        subtitle="Predict future demand and prepare inventory for upcoming events."
        onRefresh={loadData}
      />

      <div className="space-y-6">
        {/* ================= FILTER BAR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Forecast & Demand Planning Controls</span>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
            {/* 1. Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search Product, SKU, Item ID, Category..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400"
              />
            </div>

            {/* 2. Event */}
            <div>
              <select
                value={filters.event}
                onChange={(e) => handleFilterChange('event', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-medium cursor-pointer"
              >
                <option value="All">All Upcoming Events</option>
                {(data?.events || []).map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name} ({ev.days_label})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Category */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-medium cursor-pointer"
              >
                <option value="All">All Categories</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Forecast Period Window */}
            <div>
              <select
                value={filters.periodDays}
                onChange={(e) => handleFilterChange('periodDays', Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-semibold cursor-pointer"
              >
                <option value={7}>7-Day Forecast Window</option>
                <option value={14}>14-Day Preparation Window</option>
                <option value={30}>30-Day Forward Trajectory</option>
              </select>
            </div>

            {/* 5. Risk / Status */}
            <div>
              <select
                value={filters.risk}
                onChange={(e) => handleFilterChange('risk', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-400 focus:border-slate-400 font-medium cursor-pointer"
              >
                <option value="All">All Risk Profiles</option>
                <option value="Replenishment Required">Replenishment Required</option>
                <option value="Stock Sufficient">Stock Sufficient</option>
                <option value="Excess Stock">Excess Stock</option>
                <option value="Insufficient Data">Insufficient Data</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Opportunity Tier:</span>
              {['All', 'High', 'Medium', 'Low'].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleFilterChange('opportunity', tier)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    filters.opportunity === tier
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none font-semibold cursor-pointer"
              >
                <option value="opp_desc">Opportunity Score (High → Low)</option>
                <option value="increase_desc">Expected Surge % (High → Low)</option>
                <option value="demand_desc">Forecast Demand (High → Low)</option>
                <option value="demand_asc">Forecast Demand (Low → High)</option>
                <option value="stock_asc">Current Stock (Low → High)</option>
                <option value="stock_desc">Current Stock (High → Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= FORECASTING KPI ROW ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Forecast Products */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Forecast Products
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {kpis.productsForecasted}
              </p>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Active catalog SKUs</span>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>

          {/* Card 2: Demand Opportunities */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Demand Opportunities
              </span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
                {kpis.demandOpportunities}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5 block">
                {kpis.demandIncrease} festive surge
              </span>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          {/* Card 3: Replenishment Required */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Replenish Required
              </span>
              <p className="text-2xl font-black text-red-700 dark:text-red-400 mt-1 font-mono">
                {kpis.replenishmentRequired}
              </p>
              <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold mt-0.5 block">
                Stockout risk before event
              </span>
            </div>
            <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          {/* Card 4: Inventory Risk Capital */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Inventory Deficit
              </span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 font-mono">
                {formatINR(kpis.inventoryRisk, 0)}
              </p>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold mt-0.5 block">
                Estimated stockout gap
              </span>
            </div>
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-100 dark:border-amber-900/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Card 5: Upcoming Events */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Upcoming Events
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                {kpis.upcomingEvents}
              </p>
              <span className="text-[10px] text-slate-500 font-medium mt-0.5 block truncate">
                Next: {activeEvent?.name || 'Vinayaka Chaturthi'}
              </span>
            </div>
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ================= UPCOMING EVENTS & DEMAND OPPORTUNITIES ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>Upcoming Events & Demand Opportunities</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Dynamic Calendar
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proximity-based festival schedule calculating preparation windows and category demand surges
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 hidden sm:inline">
              System Reference Date: {data?.system_date || '2026-09-09'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {(data?.events || []).slice(0, 4).map((ev) => {
              const isSelected = filters.event === ev.id || (filters.event === 'All' && ev.id === activeEvent?.id);
              return (
                <div
                  key={ev.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-400 dark:border-slate-600 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span className="text-slate-500">▣</span>
                        <span>{ev.name}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          ev.days_away <= 7
                            ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                            : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {ev.days_label}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {ev.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Opportunities</span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                          {ev.opportunities_count || 8} products
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Prep Window</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                          {ev.prep_days} days before
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleFilterChange('event', ev.id)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>View Forecast</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* ================= OPERATIONAL DEMAND SUMMARY & CCTV TELEMETRY ================= */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Demand Forecast & Event Preparedness Summary
                </h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  ▣ {activeEvent?.name}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {data?.ai_summary?.replace(/AI-powered |AI /g, '') ||
                  `${activeEvent?.name} is approaching. Based on historical sales patterns, ${kpis.demandOpportunities} products show elevated demand potential. ${kpis.replenishmentRequired} products require warehouse replenishment before the event.`}
              </p>
            </div>

            {/* CCTV Telemetry Signal */}
            <div className="flex items-center gap-3 shrink-0 p-2.5 rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
              <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                <Video className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">CCTV Footfall Telemetry</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                  {data?.cctv_correlation?.footfall_today || 742} Store Visitors Today
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Peak: {data?.cctv_correlation?.peak_hour || '18:00 – 19:00'} • {data?.cctv_correlation?.busiest_zone || 'Foods & Groceries'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= COMPACT PRODUCT DEMAND FORECAST TABLE ================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>RETAIL DEMAND FORECAST TABLE</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  LightGBM Predictor
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Item-level 7-day and 30-day predicted unit demand, stock coverage, and automated inventory recommendations
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold font-mono">
                Showing {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}–
                {Math.min(currentPage * pageSize, filteredProducts.length)} of {filteredProducts.length} items
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 px-3">Product & SKU</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Store Stock</th>
                    <th className="py-2.5 px-3 text-right">7-Day Forecast</th>
                    <th className="py-2.5 px-3 text-right">30-Day Forecast</th>
                    <th className="py-2.5 px-3 text-center">Trend / Lift</th>
                    <th className="py-2.5 px-3">Stock Coverage</th>
                    <th className="py-2.5 px-3">Risk Level</th>
                    <th className="py-2.5 px-3">Recommendation</th>
                    <th className="py-2.5 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {paginatedProducts.length > 0 ? (
                    paginatedProducts.map((item) => {
                      const isReplenish = item.risk === 'Replenishment Required';
                      const fore7 = Math.round(item.forecastDemand || 0);
                      const fore30 = Math.round((item.forecastDemand || 0) * 4.2);
                      const surgePct = item.expectedIncreasePct || 0;

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <td className="py-2.5 px-3">
                            <div
                              onClick={() => setSelectedProduct(item)}
                              className="font-bold text-slate-900 dark:text-white hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer line-clamp-1"
                              title={item.name}
                            >
                              {item.name}
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {item.sku} • {formatINR(item.price, 2)}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {item.category || 'General'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                            {item.storeStock || 0} pcs
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                            {fore7} pcs
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                            {fore30} pcs
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                surgePct > 0
                                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              {surgePct > 0 ? `↑ +${surgePct}%` : '→ Flat'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-600 dark:text-slate-300">
                            {item.daysOfStock || 0} days
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border ${
                                isReplenish
                                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800'
                                  : item.risk === 'Excess Stock'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {item.risk}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs text-slate-600 dark:text-slate-400 text-[11px] truncate" title={item.reason}>
                            <strong className="text-slate-800 dark:text-slate-200 font-semibold">{item.action}:</strong> {item.reason}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedProduct(item)}
                              className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={10} className="py-8 text-center text-slate-400">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                        No product demand forecasts match your filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
                <span className="text-slate-500 font-medium">
                  Page <strong className="text-slate-800 dark:text-slate-200">{currentPage}</strong> of {totalPages}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= MAIN FORECAST CHART + STATISTICAL ACCURACY ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>Actual Sales vs Projected Demand</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Autoregressive Demand Model
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Historical sales sequence + forward demand trajectory with annotated festival event markers
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                Actual Sales
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                Forecast Demand
              </span>
              <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Festival Marker
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.chart || []} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="actualSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64748b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="forecastDemandGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={{ stroke: chartTheme.gridStroke }}
                  tickLine={false}
                  tick={{ fill: chartTheme.axisStroke, fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: chartTheme.axisStroke, fontSize: 10 }}
                  unit=" pcs"
                />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: chartTheme.tooltipBg,
                    borderColor: chartTheme.tooltipBorder,
                    borderRadius: '6px',
                    color: chartTheme.tooltipText,
                    fontSize: '11px',
                  }}
                  formatter={(val, name) => [`${val} units`, name === 'actualSales' ? 'Actual Sales' : 'Forecast Demand']}
                  labelFormatter={(label, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.eventMarker ? `${label} — ▣ ${item.eventMarker}` : label;
                  }}
                />

                {/* Dynamic Today / Current Date Boundary Line */}
                {todayLabel && (
                  <ReferenceLine
                    x={todayLabel}
                    stroke="#059669"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label={{
                      value: `★ Today (${todayLabel})`,
                      fill: '#059669',
                      fontSize: 10,
                      fontWeight: 'bold',
                      position: 'top',
                    }}
                  />
                )}

                {/* Dynamic Event Marker Reference Lines */}
                {(data?.chart || [])
                  .filter((pt) => pt.isEvent && pt.eventMarker)
                  .map((pt, idx) => (
                    <ReferenceLine
                      key={`event-ref-${idx}`}
                      x={pt.day}
                      stroke="#64748b"
                      strokeDasharray="3 3"
                      label={{
                        value: `▣ ${pt.eventMarker} (${pt.day})`,
                        fill: '#475569',
                        fontSize: 10,
                        fontWeight: 'bold',
                        position: 'top',
                      }}
                    />
                  ))}

                <Area
                  type="monotone"
                  dataKey="actualSales"
                  stroke="#64748b"
                  strokeWidth={2}
                  fill="url(#actualSalesGrad)"
                  name="actualSales"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="forecastDemand"
                  stroke="#059669"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="url(#forecastDemandGrad)"
                  name="forecastDemand"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* LightGBM Model Accuracy & Evaluation Performance Banner */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg p-3">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model Architecture</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                LightGBM Regressor (v1.0.0)
              </p>
              <span className="text-[9px] text-slate-400 block mt-0.5">Historical Dataset (M5)</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mean Absolute Error (MAE)</span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {data?.metrics?.mae ?? 0.9539} units
              </p>
              <span className="text-[9px] text-slate-400 block mt-0.5">Empirical metric</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RMSE</span>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                {data?.metrics?.rmse ?? 2.0995}
              </p>
              <span className="text-[9px] text-slate-400 block mt-0.5">Root Mean Squared Error</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WMAPE Error Metric</span>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                {data?.metrics?.wmape_pct || data?.metrics?.wmape ? `${data?.metrics?.wmape_pct || data?.metrics?.wmape}%` : '73.48%'}
              </p>
              <span className="text-[9px] text-slate-400 block mt-0.5">Weighted Abs % Error</span>
            </div>
          </div>
        </div>

        {/* ================= CHARTS: TOP FORECASTED PRODUCTS + CATEGORY DEMAND FORECAST ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Top Forecasted Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  TOP FORECASTED PRODUCTS
                </span>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTopLimit(num)}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        topLimit === num
                          ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      Top {num}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Products with highest expected sales volume across the {filters.periodDays}-day window
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topForecastedProducts}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 40, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} horizontal={false} />
                    <XAxis type="number" tick={{ fill: chartTheme.axisStroke, fontSize: 10 }} unit=" pcs" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: chartTheme.axisStroke, fontSize: 9 }}
                      width={110}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderRadius: '6px',
                        color: chartTheme.tooltipText,
                        fontSize: '11px',
                      }}
                      formatter={(val) => [`${val} units`, 'Projected Demand']}
                    />
                    <Bar dataKey="forecastDemand" fill={chartTheme.primary} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 2: Category Demand Forecast */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  CATEGORY DEMAND FORECAST
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                  {categoryDemandData.length} Categories
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Baseline vs event-adjusted demand volume breakdown by product category
              </p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryDemandData}
                    margin={{ top: 10, right: 15, left: -20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                    <XAxis
                      dataKey="category"
                      tick={{ fill: chartTheme.axisStroke, fontSize: 9 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis tick={{ fill: chartTheme.axisStroke, fontSize: 10 }} unit=" pcs" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderRadius: '6px',
                        color: chartTheme.tooltipText,
                        fontSize: '11px',
                      }}
                      formatter={(val, name) => [
                        `${val} pcs`,
                        name === 'baselineDemand' ? 'Baseline Demand' : 'Event Forecast',
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="baselineDemand" name="Baseline" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="forecastDemand" name="Event Forecast" fill="#059669" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>



        {/* ================= EVENT INVENTORY PREPARATION ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Box className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                <span>EVENT INVENTORY PREPARATION</span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  Action Center
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Connecting predictive demand surges directly with warehouse replenishment and stock clearance decisions
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Segment 1: Replenishment Required */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    REPLENISHMENT REQUIRED
                  </span>
                  <span className="font-mono text-xs font-bold text-red-700 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900">
                    {inventoryPreparation.replenish.length} SKUs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Products expected to stock out prior to or during the event. Warehouse transfers required.
                </p>

                <div className="space-y-2">
                  {inventoryPreparation.replenish.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProduct(item)}
                      className="p-2.5 rounded-lg bg-red-50/60 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-xs flex items-center justify-between cursor-pointer hover:border-red-300 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Stock: {item.storeStock} • Forecast: {item.forecastDemand} pcs
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-red-700 shrink-0">
                        {item.daysOfStock}d left
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Segment 2: Stock Sufficient */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    STOCK SUFFICIENT
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900">
                    {inventoryPreparation.sufficient.length} SKUs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Inventory runway covers projected festive surge. Maintain shelf displays and monitor checkout rate.
                </p>

                <div className="space-y-2">
                  {inventoryPreparation.sufficient.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProduct(item)}
                      className="p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-xs flex items-center justify-between cursor-pointer hover:border-emerald-300 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Stock: {item.storeStock} • Surge: +{item.expectedIncreasePct}%
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-emerald-700 shrink-0">
                        {item.daysOfStock}d cover
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Segment 3: Excess Inventory */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    EXCESS INVENTORY
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-700 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900">
                    {inventoryPreparation.excess.length} SKUs
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Heavy stock holdings with flat festival demand. Recommend bundle deals or clearance promotions.
                </p>

                <div className="space-y-2">
                  {inventoryPreparation.excess.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedProduct(item)}
                      className="p-2.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
                    >
                      <div className="truncate pr-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Stock: {item.storeStock} • Flat Demand
                        </span>
                      </div>
                      <span className="font-mono font-bold text-[10px] text-amber-700 shrink-0">
                        Bundle Action
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= SEASONAL DEMAND INSIGHTS ================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Compass className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>SEASONAL DEMAND PATTERNS</span>
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Historical Trends
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {(data?.seasonal_insights || []).map((ins, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {ins.category}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                    {ins.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    {ins.insight}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= MODALS ================= */}
      {selectedProduct && (
        <ForecastDetailModal
          isOpen={Boolean(selectedProduct)}
          product={selectedProduct}
          periodDays={filters.periodDays}
          activeEvent={activeEvent}
          onClose={() => setSelectedProduct(null)}
          onOpenReplenish={(prod) => {
            setReplenishProduct(prod);
          }}
        />
      )}

      {replenishProduct && (
        <ReplenishmentModal
          product={replenishProduct}
          onClose={() => setReplenishProduct(null)}
          onSuccess={() => {
            setReplenishProduct(null);
            loadData();
          }}
        />
      )}
    </PageContainer>
  );
}
