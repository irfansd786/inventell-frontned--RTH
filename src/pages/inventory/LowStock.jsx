import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AnalyticsHeader from '../../components/store-intelligence/AnalyticsHeader';
import ReplenishmentModal from '../../components/inventory/ReplenishmentModal';
import ProductDetailsModal from '../../components/inventory/ProductDetailsModal';
import CreatePromotionModal from '../../components/inventory/CreatePromotionModal';
import BarcodeVisual from '../../components/common/BarcodeVisual';
import Loading from '../../components/common/Loading';
import { getLowStock } from '../../services/inventoryService';
import {
  getRecommendations,
  approveRecommendation,
  launchRecommendation,
  rejectRecommendation,
} from '../../services/recommendationService';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import {
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Clock,
  Eye,
  Sparkles,
  CheckCircle2,
  Package,
  Boxes,
  Tag,
  TrendingDown,
  TrendingUp,
  Copy,
  Layers,
  ArrowRight,
  Percent,
  ShieldCheck,
  Zap,
  IndianRupee,
} from 'lucide-react';

export default function LowStock() {
  const { toast } = useToast();
  const { chartTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [rawItems, setRawItems] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);

  // Modals state
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [replenishProduct, setReplenishProduct] = useState(null);
  const [promotionProduct, setPromotionProduct] = useState(null);

  // Central Unified Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    riskType: 'All', // 'All' | 'Low Stock' | 'Critical' | 'Out of Stock' | 'Slow Moving' | 'Dead Stock'
    demandRisk: 'All', // 'All' | 'High Demand' | 'Medium Demand' | 'Low Demand' | 'No Recent Demand'
    location: 'All', // 'All' | 'Store' | 'Warehouse'
    periodDays: 30, // 30 | 60 | 90 | 180
    sort: 'urgency', // 'urgency' | 'risk_type' | 'days_asc' | 'velocity_desc' | 'stock_asc' | 'value_desc' | 'name_asc'
  });

  // Central Pagination & Decision Matrix Filter
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDensity, setViewDensity] = useState('comfortable'); // 'comfortable' | 'compact'
  const [decisionFilter, setDecisionFilter] = useState('pending'); // 'pending' | 'all'
  const pageSize = 10;

  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [items, recsRaw] = await Promise.all([
        getLowStock({ period_days: filters.periodDays }),
        getRecommendations().catch(() => []),
      ]);

      const recs = Array.isArray(recsRaw) ? recsRaw : [];
      const recMap = {};
      recs.forEach((r) => {
        if (r.product_id) recMap[r.product_id] = r;
      });

      const merged = (items || []).map((item) => {
        const r = recMap[item.id] || recMap[item.productId];
        return {
          ...item,
          recId: r?.id || null,
          recStatus: r?.status || 'PENDING',
          recType: r?.recommendation_type || (item.storeStock < 15 ? 'REPLENISHMENT' : 'PROMOTION'),
        };
      });

      setRawItems(merged);

      const cats = Array.from(
        new Set((merged || []).map((p) => p.category).filter(Boolean))
      ).sort();
      setCategoriesList(cats);
    } catch (err) {
      console.error('Failed to load low stock inventory risk data', err);
      toast.error('Network Error', 'Unable to fetch inventory risk matrix.');
      setRawItems([]);
    } finally {
      setLoading(false);
    }
  }, [filters.periodDays, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApproveRecommendation = async (item) => {
    if (!item.recId) return;
    setActionLoadingId(item.id);
    try {
      await approveRecommendation(item.recId);
      toast.success('Recommendation Approved', `Approved recommendation for ${item.name}.`, 3500);
      await loadData();
    } catch (err) {
      toast.error('Approval Failed', err?.message || 'Unable to approve recommendation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLaunchRecommendation = async (item) => {
    if (!item.recId) return;
    setActionLoadingId(item.id);
    try {
      await launchRecommendation(item.recId);
      toast.success('Campaign Launched', `Launched ${item.recType} campaign for ${item.name}.`, 4000);
      await loadData();
    } catch (err) {
      toast.error('Launch Failed', err?.message || 'Unable to launch campaign.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRecommendation = async (item) => {
    if (!item.recId) return;
    setActionLoadingId(item.id);
    try {
      await rejectRecommendation(item.recId);
      toast.info('Recommendation Rejected', `Rejected recommendation for ${item.name}.`, 3500);
      await loadData();
    } catch (err) {
      toast.error('Rejection Failed', err?.message || 'Unable to reject recommendation.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle filter changes & reset pagination
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      riskType: 'All',
      demandRisk: 'All',
      location: 'All',
      periodDays: 30,
      sort: 'urgency',
    });
    setCurrentPage(1);
  };

  // Single Source of Truth: Filtered Inventory Risks
  const filteredItems = useMemo(() => {
    return rawItems
      .filter((item) => {
        // 1. Search: works across Product Name, SKU, Item ID, Barcode, Category
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const nameMatch = (item.name || '').toLowerCase().includes(q);
          const skuMatch = (item.sku || '').toLowerCase().includes(q);
          const idMatch = String(item.id || '').toLowerCase().includes(q);
          const barcodeMatch = (item.barcode || '').toLowerCase().includes(q);
          const catMatch = (item.category || '').toLowerCase().includes(q);
          if (!nameMatch && !skuMatch && !idMatch && !barcodeMatch && !catMatch) {
            return false;
          }
        }

        // 2. Category
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }

        // 3. Risk Type
        if (filters.riskType !== 'All') {
          if (filters.riskType === 'Low Stock') {
            if (item.riskType !== 'Low Stock' && item.status !== 'Low Stock' && item.status !== 'Low') return false;
          } else if (filters.riskType === 'Critical') {
            if (item.riskType !== 'Critical' && item.status !== 'Critical') return false;
          } else if (filters.riskType === 'Out of Stock') {
            if (item.riskType !== 'Out of Stock' && item.status !== 'Out of Stock' && (item.storeStock || 0) > 0) return false;
          } else if (filters.riskType === 'Slow Moving') {
            if (item.riskType !== 'Slow Moving') return false;
          } else if (filters.riskType === 'Dead Stock') {
            if (item.riskType !== 'Dead Stock') return false;
          }
        }

        // 4. Demand Risk / Level
        if (filters.demandRisk !== 'All') {
          if (filters.demandRisk === 'High Demand' && item.demandLevel !== 'High Demand' && item.demandRisk !== 'High') return false;
          if (filters.demandRisk === 'Medium Demand' && item.demandLevel !== 'Medium Demand' && item.demandRisk !== 'Medium') return false;
          if (filters.demandRisk === 'Low Demand' && item.demandLevel !== 'Low Demand' && item.demandRisk !== 'Low') return false;
          if (filters.demandRisk === 'No Recent Demand' && item.demandLevel !== 'No Recent Demand' && item.hasDemandData) return false;
        }

        // 5. Location
        if (filters.location === 'Store' && (item.storeStock || 0) <= 0) return false;
        if (filters.location === 'Warehouse' && (item.warehouseStock || 0) <= 0) return false;

        // 6. Decision Matrix Status Filter (Pending Decisions disappear upon approval/launch/reject)
        if (decisionFilter === 'pending' && item.recStatus !== 'PENDING') {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sort) {
          case 'days_asc': {
            const da = a.daysOfStock !== null && a.daysOfStock !== undefined ? a.daysOfStock : 999;
            const db = b.daysOfStock !== null && b.daysOfStock !== undefined ? b.daysOfStock : 999;
            return da - db;
          }
          case 'days_desc': {
            const da = a.daysOfStock !== null && a.daysOfStock !== undefined ? a.daysOfStock : -1;
            const db = b.daysOfStock !== null && b.daysOfStock !== undefined ? b.daysOfStock : -1;
            return db - da;
          }
          case 'velocity_desc':
            return (b.salesVelocity || 0) - (a.salesVelocity || 0);
          case 'velocity_asc':
            return (a.salesVelocity || 0) - (b.salesVelocity || 0);
          case 'stock_asc':
            return (a.storeStock || 0) - (b.storeStock || 0);
          case 'stock_desc':
            return (b.storeStock || 0) - (a.storeStock || 0);
          case 'value_desc':
            return (b.storeValue || 0) - (a.storeValue || 0);
          case 'name_asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'risk_type':
            return (a.riskType || '').localeCompare(b.riskType || '');
          case 'urgency':
          default: {
            const scoreMap = {
              'Out of Stock': 0,
              Critical: 1,
              'Low Stock': 2,
              'Dead Stock': 3,
              'Slow Moving': 4,
            };
            const sa = scoreMap[a.riskType] !== undefined ? scoreMap[a.riskType] : 5;
            const sb = scoreMap[b.riskType] !== undefined ? scoreMap[b.riskType] : 5;
            if (sa !== sb) return sa - sb;
            return (b.storeValue || 0) - (a.storeValue || 0);
          }
        }
      });
  }, [rawItems, filters]);

  // Derived Filter-Dependent KPIs
  const kpis = useMemo(() => {
    let lowStockCount = 0;
    let criticalCount = 0;
    let outOfStockCount = 0;
    let slowMovingCount = 0;
    let deadStockCount = 0;

    let deadStockValue = 0;
    let slowMovingValue = 0;
    let replenishmentDeficitValue = 0;

    filteredItems.forEach((item) => {
      const r = item.riskType;
      const sVal = item.storeValue || ((item.storeStock || 0) * (item.price || 0));

      if (r === 'Out of Stock') {
        outOfStockCount++;
        replenishmentDeficitValue += (item.reorderLevel || 20) * (item.price || 0);
      } else if (r === 'Critical') {
        criticalCount++;
        const deficit = Math.max(0, (item.reorderLevel || 20) - (item.storeStock || 0));
        replenishmentDeficitValue += deficit * (item.price || 0);
      } else if (r === 'Low Stock') {
        lowStockCount++;
        const deficit = Math.max(0, (item.reorderLevel || 20) - (item.storeStock || 0));
        replenishmentDeficitValue += deficit * (item.price || 0);
      } else if (r === 'Dead Stock') {
        deadStockCount++;
        deadStockValue += sVal;
      } else if (r === 'Slow Moving') {
        slowMovingCount++;
        slowMovingValue += sVal;
      }
    });

    return {
      lowStockCount,
      criticalCount,
      outOfStockCount,
      slowMovingCount,
      deadStockCount,
      deadStockValue,
      slowMovingValue,
      replenishmentDeficitValue,
      totalAtRisk: filteredItems.length,
    };
  }, [filteredItems]);

  // Top AI Clearance Candidates (Dead Stock and Slow Moving with highest tied up capital)
  const clearanceCandidates = useMemo(() => {
    return filteredItems
      .filter((i) => i.riskType === 'Dead Stock' || i.riskType === 'Slow Moving')
      .sort((a, b) => (b.storeValue || 0) - (a.storeValue || 0))
      .slice(0, 6);
  }, [filteredItems]);

  // Visual Chart 1: Risk Distribution
  const riskDistributionData = useMemo(() => {
    return [
      { name: 'Out of Stock', value: kpis.outOfStockCount, color: '#64748B' },
      { name: 'Critical', value: kpis.criticalCount, color: '#EF4444' },
      { name: 'Low Stock', value: kpis.lowStockCount, color: '#F59E0B' },
      { name: 'Slow Moving', value: kpis.slowMovingCount, color: '#F97316' },
      { name: 'Dead Stock', value: kpis.deadStockCount, color: '#8B5CF6' },
    ];
  }, [kpis]);

  // Visual Chart 2: Stock vs Demand Scatter Data
  const stockVsDemandData = useMemo(() => {
    return filteredItems.map((item) => ({
      name: item.name,
      stock: item.storeStock || 0,
      days: item.daysOfCoverage !== null && item.daysOfCoverage !== undefined ? item.daysOfCoverage : Math.round((item.storeStock || 0) / Math.max(1, item.salesVelocity || 1)),
      velocity: item.salesVelocity !== null && item.salesVelocity !== undefined ? item.salesVelocity : 0,
      risk: item.riskType,
      value: item.storeValue || 0,
    }));
  }, [filteredItems]);

  const totalCapitalAtRisk = useMemo(() => {
    return (kpis?.deadStockValue || 0) + (kpis?.slowMovingValue || 0) + (kpis?.replenishmentDeficitValue || 0);
  }, [kpis]);

  // Visual Chart 3: Capital at Risk Breakdown
  const capitalAtRiskData = useMemo(() => {
    return [
      {
        category: 'Dead Stock',
        value: kpis.deadStockValue,
        color: '#8B5CF6',
      },
      {
        category: 'Slow Moving',
        value: kpis.slowMovingValue,
        color: '#F97316',
      },
      {
        category: 'Stockout Deficit',
        value: kpis.replenishmentDeficitValue,
        color: '#EF4444',
      },
    ];
  }, [kpis]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'All' ||
    filters.riskType !== 'All' ||
    filters.demandRisk !== 'All' ||
    filters.location !== 'All' ||
    filters.periodDays !== 30 ||
    filters.sort !== 'urgency';

  const getRiskBadge = (type) => {
    switch (type) {
      case 'Out of Stock':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      case 'Critical':
        return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/60';
      case 'Low Stock':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60';
      case 'Slow Moving':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60';
      case 'Dead Stock':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200/60';
      default:
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60';
    }
  };

  if (loading && rawItems.length === 0) {
    return <Loading text="Evaluating Inventory Risks, Demand Velocity & AI Recommendations..." />;
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* ================= HEADER ================= */}
        <AnalyticsHeader
          title="Low Stock & Inventory Risks"
          subtitle="Identify stockout risks, slow-moving products and AI-recommended actions across retail catalog and warehouse inventory."
          onRefresh={loadData}
        />

        {/* ================= FILTER BAR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Risk & Clearance Filters
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({filteredItems.length} of {rawItems.length} products match)
              </span>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5 text-xs">
            {/* 1. Search */}
            <div className="relative sm:col-span-2 lg:col-span-2">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search product, SKU, barcode..."
                className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              {filters.search && (
                <button
                  type="button"
                  onClick={() => handleFilterChange('search', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* 2. Category */}
            <div>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Risk Type */}
            <div>
              <select
                value={filters.riskType}
                onChange={(e) => handleFilterChange('riskType', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Risk Types</option>
                <option value="Low Stock">Low Stock (≤ Reorder)</option>
                <option value="Critical">Critical (≤ 50% Buffer)</option>
                <option value="Out of Stock">Out of Stock (0 Pcs)</option>
                <option value="Slow Moving">Slow Moving (Low Burn)</option>
                <option value="Dead Stock">Dead Stock (0 Sales)</option>
              </select>
            </div>

            {/* 4. Demand Risk */}
            <div>
              <select
                value={filters.demandRisk}
                onChange={(e) => handleFilterChange('demandRisk', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="All">All Demand Levels</option>
                <option value="High Demand">High Demand (≥ 2/day)</option>
                <option value="Medium Demand">Medium Demand (1-2/day)</option>
                <option value="Low Demand">Low Demand (&lt; 1/day)</option>
                <option value="No Recent Demand">No Recent Demand (0)</option>
              </select>
            </div>

            {/* 5. Sort */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
              >
                <option value="urgency">Urgency (Critical First)</option>
                <option value="risk_type">Group by Risk Type</option>
                <option value="days_asc">Days of Stock (Lowest First)</option>
                <option value="days_desc">Days of Stock (Highest First)</option>
                <option value="velocity_desc">Sales Velocity (Highest First)</option>
                <option value="velocity_asc">Sales Velocity (Lowest First)</option>
                <option value="stock_asc">Stock (Lowest First)</option>
                <option value="stock_desc">Stock (Highest First)</option>
                <option value="value_desc">Inventory Value (Highest First)</option>
                <option value="name_asc">Product (A → Z)</option>
              </select>
            </div>
          </div>

          {/* Analysis Period & Location quick toggles */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Sales Window:</span>
              {[
                { label: '30 Days', val: 30 },
                { label: '60 Days', val: 60 },
                { label: '90 Days', val: 90 },
                { label: '180 Days (All-Time)', val: 180 },
              ].map((p) => (
                <button
                  key={p.val}
                  type="button"
                  onClick={() => handleFilterChange('periodDays', p.val)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filters.periodDays === p.val
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-bold uppercase text-[10px]">Location:</span>
              {['All', 'Store', 'Warehouse'].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleFilterChange('location', loc)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                    filters.location === loc
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {loc === 'All' ? 'All Locations' : `${loc} Stock`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ================= TOP KPI ROW ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* KPI 1: LOW STOCK */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Low Stock
            </span>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-300 mt-1 font-mono">
              {kpis.lowStockCount} {kpis.lowStockCount === 1 ? 'Product' : 'Products'}
            </p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block">
              ≤ Reorder threshold
            </span>
          </div>

          {/* KPI 2: CRITICAL */}
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              Critical
            </span>
            <p className="text-2xl font-black text-red-900 dark:text-red-300 mt-1 font-mono">
              {kpis.criticalCount} {kpis.criticalCount === 1 ? 'Product' : 'Products'}
            </p>
            <span className="text-[10px] text-red-700 dark:text-red-400 mt-0.5 block">
              ≤ 50% safety buffer
            </span>
          </div>

          {/* KPI 3: OUT OF STOCK */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
              Out of Stock
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 font-mono">
              {kpis.outOfStockCount} {kpis.outOfStockCount === 1 ? 'Product' : 'Products'}
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
              0 store units remaining
            </span>
          </div>

          {/* KPI 4: SLOW MOVING */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-amber-600" />
              Slow Moving
            </span>
            <p className="text-2xl font-black text-amber-900 dark:text-amber-300 mt-1 font-mono">
              {kpis.slowMovingCount} {kpis.slowMovingCount === 1 ? 'Product' : 'Products'}
            </p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block font-mono">
              {formatINR(kpis.slowMovingValue, 0)} tied up
            </span>
          </div>

          {/* KPI 5: DEAD STOCK */}
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Dead Stock
            </span>
            <p className="text-2xl font-black text-indigo-900 dark:text-indigo-300 mt-1 font-mono">
              {kpis.deadStockCount} {kpis.deadStockCount === 1 ? 'Product' : 'Products'}
            </p>
            <span className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5 block font-mono">
              {formatINR(kpis.deadStockValue, 0)} locked capital
            </span>
          </div>
        </div>

        {/* ================= AI INVENTORY EXECUTIVE SUMMARY ================= */}
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  AI Inventory Risk & Decision Summary
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Real Dataset Facts
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                <strong>{kpis.criticalCount + kpis.lowStockCount + kpis.outOfStockCount} products</strong> require warehouse replenishment to maintain shelf availability.{' '}
                <strong>{kpis.slowMovingCount} products</strong> have slow stock turnover and should not be overstocked.{' '}
                <strong>{kpis.deadStockCount} products</strong> qualify as dead stock with zero customer purchases in the last {filters.periodDays} days.{' '}
                <strong className="text-indigo-700 dark:text-indigo-300">{formatINR(kpis.deadStockValue, 0)}</strong> of working capital is locked in dead inventory.{' '}
                Clearance markdowns and cross-selling bundles are recommended for <strong>{clearanceCandidates.length} priority items</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="text-right pr-3 border-r border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Capital at Risk</span>
                <span className="text-base font-black text-red-600 dark:text-red-400 font-mono">
                  {formatINR(kpis.deadStockValue + kpis.slowMovingValue, 0)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Stockout Deficit</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                  {formatINR(kpis.replenishmentDeficitValue, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= CHARTS: RISK DISTRIBUTION + STOCK VS DEMAND + CAPITAL AT RISK ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Chart 1: Risk Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-indigo-600" />
                  Inventory Risk Distribution
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {filteredItems.length} SKUs
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Breakdown by stockout urgency vs stagnant capital
              </p>

              <div className="relative h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={66}
                      paddingAngle={3}
                      dataKey="value"
                      isAnimationActive={false}
                    >
                      {riskDistributionData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                      formatter={(val, name) => [`${val} products`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                    {filteredItems.length}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                    At-Risk SKUs
                  </span>
                </div>
              </div>
            </div>

            {/* Legend Badges */}
            <div className="grid grid-cols-2 gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              {riskDistributionData.map((b, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                  <span className="text-slate-600 dark:text-slate-400 font-medium truncate">{b.name}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{b.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart B: Urgency Scatter Matrix */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  REPLENISHMENT URGENCY MATRIX
                </span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">
                  Stock vs Velocity
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Products sorted by remaining days of stock coverage vs daily sales velocity
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                    <XAxis
                      type="number"
                      dataKey="days"
                      name="Days Stock"
                      unit="d"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartTheme.axisStroke, fontSize: 10 }}
                    />
                    <YAxis
                      type="number"
                      dataKey="velocity"
                      name="Velocity"
                      unit=" /d"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartTheme.axisStroke, fontSize: 10 }}
                    />
                    <ZAxis range={[35, 60]} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderRadius: '8px',
                        color: chartTheme.tooltipText,
                        fontSize: '11px',
                      }}
                      formatter={(val, name) => [name === 'Store Stock' ? `${val} pcs` : `${val} pcs/day`, name]}
                      labelFormatter={(_, arr) => arr?.[0]?.payload?.name || ''}
                    />
                    <Scatter data={stockVsDemandData} fill="#ef4444" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>← High Urgency (Left Top)</span>
              <span>Sufficient Stock (Right) →</span>
            </div>
          </div>

          {/* Chart C: Capital at Risk */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4.5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <IndianRupee className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  CAPITAL AT RISK BY CATEGORY
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatINR(totalCapitalAtRisk, 0)}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Tied-up inventory value in slow/dead stock or missing revenue from out-of-stock items
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={capitalAtRiskData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
                    <XAxis
                      dataKey="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartTheme.axisStroke, fontSize: 9 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: chartTheme.axisStroke, fontSize: 9 }}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: chartTheme.tooltipBg,
                        borderColor: chartTheme.tooltipBorder,
                        borderRadius: '8px',
                        color: chartTheme.tooltipText,
                        fontSize: '11px',
                      }}
                      formatter={(v) => [formatINR(v, 0), 'Capital at Risk']}
                    />
                    <Bar dataKey="value" name="Value (₹)" radius={[4, 4, 0, 0]}>
                      {capitalAtRiskData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Total Risk Capital:</span>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono">
                {formatINR(kpis.deadStockValue + kpis.slowMovingValue + kpis.replenishmentDeficitValue, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* ================= PRODUCT RISK TABLE ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <span>Product Risk & Clearance Registry</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Decision Matrix
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Evaluated by stock levels, M5 historical demand velocity, and AI-recommended actions
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Decision Filter Switcher (Pending vs All) */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setDecisionFilter('pending');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    decisionFilter === 'pending'
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="Show items requiring action. Items disappear when approved or rejected."
                >
                  Pending Action ({rawItems.filter((i) => i.recStatus === 'PENDING').length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDecisionFilter('all');
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    decisionFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                  title="View all products regardless of action status"
                >
                  All Matrix Items
                </button>
              </div>

              {/* Table Density Switcher */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewDensity('compact')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    viewDensity === 'compact'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setViewDensity('comfortable')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    viewDensity === 'comfortable'
                      ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 shadow-2xs font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Comfortable
                </button>
              </div>

              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-3">
                {filteredItems.length} {filteredItems.length === 1 ? 'product' : 'products'} in matrix
              </span>
            </div>
          </div>

          <div className="overflow-x-auto relative">
            <table className="min-w-[1950px] w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  {/* Sticky Left Column: PRODUCT */}
                  <th className={`w-[240px] min-w-[240px] max-w-[240px] sticky left-0 z-20 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Product
                  </th>
                  {/* Column 2: SKU */}
                  <th className={`min-w-[120px] ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    SKU
                  </th>
                  {/* Column 3: Barcode */}
                  <th className={`min-w-[150px] ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Barcode
                  </th>
                  {/* Column 4: Category */}
                  <th className={`min-w-[120px] ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Category
                  </th>
                  {/* Column 5: Current Stock */}
                  <th className={`min-w-[130px] text-right ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Current Stock
                  </th>
                  {/* Column 6: Units Sold */}
                  <th className={`min-w-[100px] text-right ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Units Sold
                  </th>
                  {/* Column 7: Velocity */}
                  <th className={`min-w-[100px] text-right ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Velocity
                  </th>
                  {/* Column 8: Days of Stock */}
                  <th className={`min-w-[120px] text-right ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Days of Stock
                  </th>
                  {/* Column 9: Inventory Value */}
                  <th className={`min-w-[130px] text-right ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Inventory Value
                  </th>
                  {/* Column 10: Risk Type */}
                  <th className={`min-w-[130px] text-center ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Risk Type
                  </th>
                  {/* Column 11: Demand */}
                  <th className={`min-w-[130px] text-center ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Demand
                  </th>
                  {/* Column 12: AI Recommendation */}
                  <th className={`min-w-[340px] max-w-[400px] text-left ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    AI Recommendation
                  </th>
                  {/* Sticky Right Column: ACTION */}
                  <th className={`w-[160px] min-w-[160px] max-w-[160px] sticky right-0 z-20 bg-slate-50 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] text-right ${viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5'}`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => {
                    const isRestockType =
                      item.riskType === 'Out of Stock' ||
                      item.riskType === 'Critical' ||
                      item.riskType === 'Low Stock';
                    const isPromotionType =
                      item.riskType === 'Dead Stock' || item.riskType === 'Slow Moving';
                    const barcodeVal = item.barcode || '8900000000000';
                    const storeSt = item.storeStock || 0;
                    const cPad = viewDensity === 'comfortable' ? 'py-3.5 px-3' : 'py-2 px-2.5';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedProductId(item.id)}
                        className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                      >
                        {/* 1. Product (Sticky Left) */}
                        <td
                          className={`w-[240px] min-w-[240px] max-w-[240px] sticky left-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-r border-slate-200/80 dark:border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] font-semibold text-slate-900 dark:text-white transition-colors ${cPad}`}
                        >
                          <div className="flex flex-col pr-1">
                            <span
                              className={`font-bold hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors leading-snug ${
                                viewDensity === 'comfortable' ? 'line-clamp-2' : 'truncate'
                              }`}
                              title={item.name}
                            >
                              {item.name}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {item.department ? item.department : 'General Retail'}
                            </span>
                          </div>
                        </td>

                        {/* 2. SKU */}
                        <td className={`min-w-[120px] font-mono text-[11px] text-slate-500 dark:text-slate-400 font-medium ${cPad}`}>
                          {item.sku}
                        </td>

                        {/* 3. Barcode */}
                        <td className={`min-w-[150px] ${cPad}`} onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-start gap-1">
                            <div className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                              <BarcodeVisual
                                value={barcodeVal}
                                height={16}
                                showDigits={false}
                                className="scale-90 origin-left"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold text-slate-700 dark:text-slate-300 tracking-wider">
                                {barcodeVal}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(barcodeVal);
                                  toast.info('Barcode Copied', `${barcodeVal} copied to clipboard.`, 2000);
                                }}
                                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 transition-colors cursor-pointer"
                                title="Copy Barcode"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* 4. Category */}
                        <td className={`min-w-[120px] ${cPad}`}>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>

                        {/* 5. Current Stock */}
                        <td className={`min-w-[130px] text-right font-mono ${cPad}`}>
                          <span
                            className={`font-extrabold text-xs ${
                              storeSt <= 0
                                ? 'text-slate-500'
                                : storeSt <= (item.reorderLevel || 20) * 0.5
                                ? 'text-red-600 dark:text-red-400'
                                : storeSt <= (item.reorderLevel || 20)
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            {storeSt.toLocaleString('en-IN')} pcs
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            WH: {(item.warehouseStock || 0).toLocaleString('en-IN')} pcs
                          </span>
                        </td>

                        {/* 6. Units Sold */}
                        <td className={`min-w-[100px] text-right font-mono text-slate-700 dark:text-slate-300 font-semibold text-xs ${cPad}`}>
                          {item.hasDemandData ? (
                            `${Number(item.unitsSold || 0).toLocaleString('en-IN')} pcs`
                          ) : (
                            <span className="text-slate-400 text-[10px]">0 pcs</span>
                          )}
                        </td>

                        {/* 7. Sales Velocity */}
                        <td className={`min-w-[100px] text-right font-mono ${cPad}`}>
                          {item.salesVelocity !== null && item.salesVelocity !== undefined ? (
                            <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                              {item.salesVelocity} <span className="text-[10px] font-normal text-slate-400">/d</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">0.00 /d</span>
                          )}
                        </td>

                        {/* 8. Days of Stock */}
                        <td className={`min-w-[120px] text-right font-mono ${cPad}`}>
                          {item.daysOfStock !== null && item.daysOfStock !== undefined ? (
                            <span
                              className={`font-extrabold text-xs ${
                                item.daysOfStock <= 3
                                  ? 'text-red-600 dark:text-red-400'
                                  : item.daysOfStock <= 7
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : item.daysOfStock >= 45
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              {item.daysOfStock} <span className="text-[10px] font-normal text-slate-400">days</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">No demand</span>
                          )}
                        </td>

                        {/* 9. Inventory Value */}
                        <td className={`min-w-[130px] text-right font-mono font-bold text-xs text-slate-900 dark:text-white ${cPad}`}>
                          {formatINR(item.storeValue || storeSt * (item.price || 0), 0)}
                        </td>

                        {/* 10. Risk Type */}
                        <td className={`min-w-[130px] text-center ${cPad}`}>
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold whitespace-nowrap border ${getRiskBadge(
                              item.riskType
                            )}`}
                          >
                            {item.riskType}
                          </span>
                        </td>

                        {/* 11. Demand Level */}
                        <td className={`min-w-[130px] text-center ${cPad}`}>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                              item.demandLevel === 'High Demand'
                                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : item.demandLevel === 'Medium Demand'
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : item.demandLevel === 'Low Demand'
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {item.demandLevel}
                          </span>
                        </td>

                        {/* 12. AI Recommendation */}
                        <td className={`min-w-[340px] max-w-[400px] text-left ${cPad}`}>
                          <div className="flex flex-col max-w-[380px]">
                            <span className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="truncate">{item.aiRecommendation?.action || 'Evaluate stock action'}</span>
                            </span>
                            <p
                              className={`text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed mt-0.5 ${
                                viewDensity === 'comfortable' ? 'line-clamp-2' : 'truncate'
                              }`}
                              title={item.aiRecommendation?.reason}
                            >
                              {item.aiRecommendation?.reason}
                            </p>
                          </div>
                        </td>

                        {/* 13. Action (Sticky Right) */}
                        <td
                          className={`w-[220px] min-w-[220px] max-w-[220px] sticky right-0 z-20 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 border-l border-slate-200/80 dark:border-slate-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.06)] text-right transition-colors ${cPad}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedProductId(item.id)}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 transition-colors cursor-pointer shrink-0"
                              title="View Full Product Intelligence"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {actionLoadingId === item.id ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-500">
                                <RefreshCw className="w-3 h-3 animate-spin" /> Processing...
                              </span>
                            ) : item.recStatus === 'PENDING' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleApproveRecommendation(item)}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs shrink-0"
                                  title="Approve Recommendation"
                                >
                                  <ShieldCheck className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRejectRecommendation(item)}
                                  className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                                  title="Reject"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : item.recStatus === 'APPROVED' ? (
                              <>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                                  Approved
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isRestockType) setReplenishProduct(item);
                                    else handleLaunchRecommendation(item);
                                  }}
                                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-xs shrink-0"
                                  title="Launch Campaign / Order Transfer"
                                >
                                  <Zap className="w-3 h-3" /> Launch
                                </button>
                              </>
                            ) : item.recStatus === 'LAUNCHED' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200">
                                <CheckCircle2 className="w-3 h-3" /> Launched
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                Rejected
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          No products match your risk filter criteria
                        </p>
                        <p className="text-xs text-slate-400">
                          Try adjusting your search terms or reset the risk type and category dropdowns.
                        </p>
                        {hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleClearFilters}
                            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline mt-2 cursor-pointer"
                          >
                            Clear All Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredItems.length > pageSize && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div>
                Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{' '}
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Math.min(startIndex + pageSize, filteredItems.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredItems.length}</span> items
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 font-semibold text-slate-800 dark:text-slate-200">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= AI CLEARANCE RECOMMENDATIONS SECTION ================= */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>AI Clearance & Promotion Campaigns</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Dead & Slow Moving Stock
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Targeted actions to monetize idle working capital, prevent holding costs, and free up shelf space
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clearanceCandidates.length > 0 ? (
              clearanceCandidates.map((item) => {
                const storeSt = item.storeStock || 0;
                const rec = item.aiRecommendation;
                const discPct = rec?.discount_pct || 15;
                const promoPrice = rec?.promotional_price || item.price * (1 - discPct / 100);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
                  >
                    <div>
                      {/* Badge Row */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getRiskBadge(
                            item.riskType
                          )}`}
                        >
                          {item.riskType}
                        </span>
                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200/50">
                          {rec?.priority || 'High'} Priority
                        </span>
                      </div>

                      {/* Title & SKU */}
                      <h4
                        onClick={() => setSelectedProductId(item.id)}
                        className="font-extrabold text-sm text-slate-900 dark:text-white hover:text-indigo-600 transition-colors cursor-pointer line-clamp-1"
                      >
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                        <span>{item.sku}</span>
                        <span>•</span>
                        <span>{item.category}</span>
                      </div>

                      {/* Stock & Value Metrics */}
                      <div className="grid grid-cols-3 gap-2 mt-3 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-center">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Stock</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                            {storeSt} pcs
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Velocity</span>
                          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                            {item.salesVelocity !== null && item.salesVelocity !== undefined ? `${item.salesVelocity}/d` : '0/d'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Tied Capital</span>
                          <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                            {formatINR(item.storeValue || storeSt * item.price, 0)}
                          </span>
                        </div>
                      </div>

                      {/* AI Recommendation Banner */}
                      <div className="mt-3 p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-indigo-950 dark:text-indigo-200 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                            {rec?.action || 'Clearance Action'}
                          </span>
                          <span className="font-mono font-black text-xs text-indigo-700 dark:text-indigo-300">
                            {discPct}% OFF
                          </span>
                        </div>
                        <p className="text-[10px] text-indigo-900/80 dark:text-indigo-300 leading-relaxed">
                          {rec?.reason ||
                            `Stagnant turnover with ${storeSt} units in store. Promotional markdown will activate consumer interest.`}
                        </p>
                      </div>

                      {/* Price Markdown Comparison */}
                      <div className="mt-2.5 flex items-center justify-between text-xs px-1">
                        <span className="text-slate-400">
                          Base: <span className="line-through font-mono">{formatINR(item.price, 2)}</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                            {formatINR(promoPrice, 2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPromotionProduct(item)}
                        className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Tag className="w-3.5 h-3.5" />
                        Create Promotion & Review
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                No slow-moving or dead stock candidates match your active filters.
              </div>
            )}
          </div>
        </div>

        {/* ================= MODALS ================= */}
        {/* 1. Product Details Modal */}
        {selectedProductId && (
          <ProductDetailsModal
            productId={selectedProductId}
            isOpen={!!selectedProductId}
            onClose={() => setSelectedProductId(null)}
            onReplenished={loadData}
          />
        )}

        {/* 2. Replenishment Modal */}
        {replenishProduct && (
          <ReplenishmentModal
            product={replenishProduct}
            onClose={() => setReplenishProduct(null)}
            onReplenished={loadData}
          />
        )}

        {/* 3. Promotion Modal */}
        {promotionProduct && (
          <CreatePromotionModal
            product={promotionProduct}
            isOpen={!!promotionProduct}
            onClose={() => setPromotionProduct(null)}
            onApproved={() => {
              loadData();
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
