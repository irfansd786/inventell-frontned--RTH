import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AnalyticsHeader from '../../components/store-intelligence/AnalyticsHeader';
import OrderTable from '../../components/warehouse/OrderTable';
import OrderDetail from '../../components/warehouse/OrderDetail';
import CreateOrderModal from '../../components/warehouse/CreateOrderModal';
import Loading from '../../components/common/Loading';
import { getOrdersData, transitionOrder, updateOrderStatus } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import WarehouseWorkflowBar from '../../components/warehouse/WarehouseWorkflowBar';
import { getUniqueProductCount, getTotalUnits, exportWarehouseCSV } from '../../utils/warehouseUtils';
import { useProductSummary } from '../../hooks/useProductSummary';
import { masterProducts } from '../../data/productsData';
import { formatINR } from '../../utils/formatters';

import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  X,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  Truck,
  Box,
  Download,
  Check,
  TrendingUp,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

export default function Orders() {
  const { toast } = useToast();
  const { totalProducts, totalUnits: masterUnits, loading: masterLoading } = useProductSummary();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createPreFill, setCreatePreFill] = useState(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    orderType: 'All',
    priority: 'All',
    dateRange: 'All', // 'All' | 'Today' | '7 Days' | '30 Days'
    sort: 'newest', // 'newest' | 'oldest' | 'value_desc' | 'value_asc' | 'priority_desc'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrdersData();
      setOrders(result.orders || []);
    } catch {
      toast.error('Network Error', 'Unable to fetch orders data.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter Handler
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'All',
      orderType: 'All',
      priority: 'All',
      dateRange: 'All',
      sort: 'newest',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'All' ||
    filters.orderType !== 'All' ||
    filters.priority !== 'All' ||
    filters.dateRange !== 'All' ||
    filters.sort !== 'newest';

  // Filtered and Sorted Orders List
  const filteredOrders = useMemo(() => {
    return orders
      .filter((ord) => {
        // 1. Search across Order ID, Product, SKU, Barcode, Supplier/Source, Destination, Status
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const idMatch = (ord.id || '').toLowerCase().includes(q);
          const statusMatch = (ord.status || '').toLowerCase().includes(q);
          const typeMatch = (ord.type || '').toLowerCase().includes(q);
          const sourceMatch = (ord.source || '').toLowerCase().includes(q);
          const destMatch = (ord.destination || '').toLowerCase().includes(q);
          const itemsMatch = (ord.items || []).some(
            (it) =>
              (it.product || it.name || '').toLowerCase().includes(q) ||
              (it.sku || '').toLowerCase().includes(q) ||
              (it.barcode || '').toLowerCase().includes(q)
          );

          if (!idMatch && !statusMatch && !typeMatch && !sourceMatch && !destMatch && !itemsMatch) {
            return false;
          }
        }

        // 2. Status
        if (filters.status !== 'All') {
          if (filters.status === 'At Risk') {
            if (ord.status !== 'At Risk' && !ord.isAtRisk) return false;
          } else if (ord.status !== filters.status) {
            return false;
          }
        }

        // 3. Order Type
        if (filters.orderType !== 'All' && ord.type !== filters.orderType) {
          return false;
        }

        // 4. Priority
        if (filters.priority !== 'All' && (ord.priority || '').toLowerCase() !== filters.priority.toLowerCase()) {
          return false;
        }

        // 5. Date Range
        if (filters.dateRange !== 'All') {
          if (filters.dateRange === 'Today') {
            const isToday =
              (ord.dateLabel && ord.dateLabel.includes('09 Sep 2026')) ||
              (ord.createdAt && ord.createdAt.startsWith('2026-09-09'));
            if (!isToday) return false;
          } else if (ord.createdAt) {
            const orderDate = new Date(ord.createdAt);
            const anchor = new Date('2026-09-09T23:59:59Z');
            const diffDays = (anchor - orderDate) / (1000 * 60 * 60 * 24);

            if (filters.dateRange === '7 Days' && (diffDays > 7 || diffDays < 0)) return false;
            if (filters.dateRange === '30 Days' && (diffDays > 30 || diffDays < 0)) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const valA = a.totalAmount || a.items?.reduce((s, it) => s + (it.subtotal || 0), 0) || 0;
        const valB = b.totalAmount || b.items?.reduce((s, it) => s + (it.subtotal || 0), 0) || 0;
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();

        const priorityRank = { critical: 4, high: 3, normal: 2, low: 1 };
        const pRankA = priorityRank[(a.priority || '').toLowerCase()] || 0;
        const pRankB = priorityRank[(b.priority || '').toLowerCase()] || 0;

        switch (filters.sort) {
          case 'oldest':
            return dateA - dateB;
          case 'value_desc':
            return valB - valA;
          case 'value_asc':
            return valA - valB;
          case 'priority_desc':
            return pRankB - pRankA;
          case 'newest':
          default:
            return dateB - dateA;
        }
      });
  }, [orders, filters]);

  // Dynamically Calculated Primary KPIs
  const kpis = useMemo(() => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter((o) =>
      ['pending', 'draft', 'confirmed'].includes((o.status || '').toLowerCase())
    ).length;
    const inProgress = filteredOrders.filter((o) =>
      ['allocated', 'partially allocated', 'picking', 'ready for picking', 'packing', 'ready for packing', 'packed', 'ready for dispatch'].includes((o.status || '').toLowerCase())
    ).length;
    const completed = filteredOrders.filter((o) =>
      ['dispatched', 'delivered'].includes((o.status || '').toLowerCase())
    ).length;
    const atRisk = filteredOrders.filter((o) => (o.status || '').toLowerCase() === 'at risk' || o.isAtRisk).length;

    return {
      total,
      pending,
      inProgress,
      completed,
      atRisk,
    };
  }, [filteredOrders]);

  // At-Risk Orders List
  const atRiskOrders = useMemo(() => {
    return filteredOrders.filter((o) => (o.status || '').toLowerCase() === 'at risk' || o.isAtRisk);
  }, [filteredOrders]);

  // Pagination Slice
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    if (paginatedOrders.every((o) => selectedIds.includes(o.id))) {
      // Unselect current page
      const pageIds = new Set(paginatedOrders.map((o) => o.id));
      setSelectedIds(selectedIds.filter((id) => !pageIds.has(id)));
    } else {
      // Select current page
      const pageIds = paginatedOrders.map((o) => o.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Actions
  const handleBulkConfirm = () => {
    if (selectedIds.length === 0) return;
    setOrders((prev) =>
      prev.map((o) => {
        if (selectedIds.includes(o.id) && ['Draft', 'Pending'].includes(o.status)) {
          return { ...o, status: 'Confirmed' };
        }
        return o;
      })
    );
    toast.success('Orders Confirmed', `${selectedIds.length} orders moved to Confirmed status.`);
    setSelectedIds([]);
  };

  const handleBulkPriority = (newPriority) => {
    if (selectedIds.length === 0) return;
    setOrders((prev) =>
      prev.map((o) => (selectedIds.includes(o.id) ? { ...o, priority: newPriority } : o))
    );
    toast.success('Priority Updated', `Priority set to ${newPriority} for ${selectedIds.length} orders.`);
    setSelectedIds([]);
  };

  // Aggregated products and units summary for Orders
  const orderSummary = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const productsInOrders = getUniqueProductCount(filteredOrders);
    const totalUnits = getTotalUnits(filteredOrders, 'requested');
    const totalValue = filteredOrders.reduce(
      (sum, ord) => sum + (ord.totalAmount || ord.items?.reduce((s, it) => s + (it.subtotal || 0), 0) || 0),
      0
    );
    return { totalOrders, productsInOrders, totalUnits, totalValue };
  }, [filteredOrders]);

  // Export CSV of currently filtered orders
  const handleExportCSV = (ordersToExport = filteredOrders) => {
    if (ordersToExport.length === 0) {
      toast.error('No Data', 'There are no orders to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Type',
      'Products Count',
      'Total Units',
      'Value (INR)',
      'Source',
      'Destination',
      'Priority',
      'Status',
      'Expected Date',
    ];

    const rows = ordersToExport.map((o) => [
      o.id,
      o.dateLabel || '',
      o.type || 'Replenishment',
      o.items?.length || o.itemsCount || 1,
      o.totalUnits || 0,
      o.totalAmount || 0,
      o.source || 'Central Warehouse',
      o.destination || 'Main Street Store',
      o.priority || 'Normal',
      o.status || 'Pending',
      o.expectedDate || '',
    ]);

    exportWarehouseCSV({
      filename: `INVINTELL_Orders_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows,
    });

    toast.success('Export Complete', `Exported ${ordersToExport.length} orders to CSV.`);
  };

  // Low Stock / Forecasting trigger to open create order
  const handleOpenReplenishFromTrigger = (prod) => {
    setCreatePreFill({
      sku: prod.sku,
      name: prod.name,
      id: prod.id,
      quantity: 50,
      type: 'Replenishment',
    });
    setIsCreateOpen(true);
  };

  if (loading && orders.length === 0) {
    return <Loading text="Loading Warehouse Fulfillment Order Management System..." />;
  }

  return (
    <PageContainer>
      {/* ================= TOP HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            ORDERS
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage replenishment and fulfillment orders across the retail operation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExportCSV()}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreatePreFill(null);
              setIsCreateOpen(true);
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ================= WORKFLOW INDICATOR ================= */}
        <WarehouseWorkflowBar activeStage="orders" orders={orders} />

        {/* ================= KPI ROW ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. TOTAL ORDERS */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL ORDERS
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.total}
              </p>
              <span className="text-[10px] text-slate-400">All registered requisitions</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>

          {/* 2. PENDING */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PENDING
              </span>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-200 mt-0.5 font-mono">
                {kpis.pending}
              </p>
              <span className="text-[10px] text-slate-400">Awaiting allocation review</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* 3. IN PROGRESS */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                IN PROGRESS
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.inProgress}
              </p>
              <span className="text-[10px] text-slate-400">Allocated, picking, packed</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* 4. COMPLETED */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                COMPLETED
              </span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {kpis.completed}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Dispatched or delivered
              </span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200/60 dark:border-emerald-900">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          {/* 5. AT RISK */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                AT RISK
              </span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5 font-mono">
                {kpis.atRisk}
              </p>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                Shortage or delay alert
              </span>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200/60 dark:border-amber-900">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ================= PRODUCTS & UNITS SUMMARY STRIP ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Total Products:
              </span>
              <span id="warehouse-product-count" className="font-bold text-slate-900 dark:text-white font-mono">
                {masterLoading || totalProducts === null ? '—' : `${totalProducts} Products`}
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Orders in Queue:
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {orderSummary.totalOrders}
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Products in Orders:
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {orderSummary.productsInOrders} Products
              </span>
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Units in Orders:
              </span>
              <span className="font-bold text-slate-900 dark:text-white font-mono">
                {orderSummary.totalUnits.toLocaleString('en-IN')} Units
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Order Value:
            </span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400 font-mono">
              {formatINR(orderSummary.totalValue)}
            </span>
          </div>
        </div>

        {/* ================= LOW STOCK & FORECASTING REPLENISHMENT CONNECTION ================= */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 shrink-0">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wide text-[11px]">
                  Demand Planning & Low Stock Requisition Signals
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  Live Sync
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                Lays Classic Chips (SNK-001) is currently at 0 store stock with high weekend demand elasticity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleOpenReplenishFromTrigger(masterProducts[1])}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              + Create Replenishment Order
            </button>
          </div>
        </div>

        {/* ================= AT-RISK ORDERS SECTION ================= */}
        {atRiskOrders.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AT-RISK ORDERS ({atRiskOrders.length})
                </h3>
                <span className="text-[10px] text-slate-400">Important orders requiring operational attention</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {atRiskOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {ord.id}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300">
                        {ord.priority} Priority
                      </span>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Reason</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                          {ord.riskReason || 'Inventory shortfall at destination store'}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">Impact</span>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          {ord.riskImpact || `${ord.totalUnits || 40} units delayed or unallocated`}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                          Recommended Action
                        </span>
                        <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                          {ord.riskAction || 'Review warehouse reserves and expedite order picking'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedOrder(ord)}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Review Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= FILTER BAR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Order Queue Filters & Sorting</span>
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
                placeholder="Search Order ID, Product, SKU, Barcode, Destination..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* 2. Status */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Allocated">Allocated</option>
                <option value="Picking">Picking</option>
                <option value="Packed">Packed</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="At Risk">At Risk</option>
              </select>
            </div>

            {/* 3. Order Type */}
            <div>
              <select
                value={filters.orderType}
                onChange={(e) => handleFilterChange('orderType', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Order Types</option>
                <option value="Replenishment">Replenishment</option>
                <option value="Transfer">Transfer</option>
                <option value="Customer Order">Customer Order</option>
              </select>
            </div>

            {/* 4. Priority */}
            <div>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            {/* 5. Date Range */}
            <div>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="7 Days">Past 7 Days</option>
                <option value="30 Days">Past 30 Days</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold cursor-pointer focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="value_desc">Highest Value</option>
                <option value="value_asc">Lowest Value</option>
                <option value="priority_desc">Highest Priority</option>
              </select>
            </div>

            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} matching criteria
            </span>
          </div>
        </div>

        {/* ================= BULK ACTIONS BAR (When checked) ================= */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedIds.length} orders selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkConfirm}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Confirm Selected
              </button>

              <button
                type="button"
                onClick={() => handleBulkPriority('High')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold transition-colors cursor-pointer"
              >
                Set High Priority
              </button>

              <button
                type="button"
                onClick={() =>
                  handleExportCSV(orders.filter((o) => selectedIds.includes(o.id)))
                }
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                <span>Export Selected</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= MAIN ORDERS TABLE ================= */}
        <OrderTable
          orders={paginatedOrders}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onSelectOrder={(ord) => setSelectedOrder(ord)}
          currentPage={currentPage}
          pageSize={pageSize}
          totalOrdersCount={filteredOrders.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= MODALS ================= */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onOrderUpdated={(updated) => {
            setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
            setSelectedOrder(updated);
          }}
          onOpenCreateReplenish={(shortfallItem) => {
            setCreatePreFill({
              sku: shortfallItem.sku,
              name: shortfallItem.product,
              quantity: shortfallItem.shortfall || 50,
              type: 'Replenishment',
            });
            setIsCreateOpen(true);
          }}
        />
      )}

      {isCreateOpen && (
        <CreateOrderModal
          isOpen={isCreateOpen}
          initialProduct={createPreFill}
          initialQuantity={createPreFill?.quantity || 50}
          initialType={createPreFill?.type || 'Replenishment'}
          onClose={() => {
            setIsCreateOpen(false);
            setCreatePreFill(null);
          }}
          onOrderCreated={(newOrder) => {
            setOrders((prev) => [newOrder, ...prev]);
            setSelectedOrder(newOrder);
          }}
        />
      )}
    </PageContainer>
  );
}
