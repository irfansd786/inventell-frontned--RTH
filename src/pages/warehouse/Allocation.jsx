import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AllocationTable from '../../components/warehouse/AllocationTable';
import AllocationDetailModal from '../../components/warehouse/AllocationDetailModal';
import AutoAllocationModal from '../../components/warehouse/AutoAllocationModal';
import CreateOrderModal from '../../components/warehouse/CreateOrderModal';
import Loading from '../../components/common/Loading';
import { getOrdersData, sendOrderToPicking } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import WarehouseWorkflowBar from '../../components/warehouse/WarehouseWorkflowBar';
import { exportWarehouseCSV } from '../../utils/warehouseUtils';
import { useProductSummary } from '../../hooks/useProductSummary';
import {
  Layers,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Package,
  Play,
  Download,
} from 'lucide-react';

export default function Allocation() {
  const { toast } = useToast();
  const { totalProducts, totalUnits: masterUnits, loading: masterLoading } = useProductSummary();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Modals state
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
  const [replenishPreFill, setReplenishPreFill] = useState(null);
  const [isReplenishOpen, setIsReplenishOpen] = useState(false);

  // Bulk selection state (keys in format "orderId-sku")
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'All', // 'All' | 'Pending' | 'Partially Allocated' | 'Fully Allocated' | 'Shortfall' | 'Ready for Picking'
    priority: 'All', // 'All' | 'Low' | 'Normal' | 'High' | 'Critical'
    orderType: 'All', // 'All' | 'Replenishment' | 'Transfer' | 'Customer Order'
    dateRange: 'All', // 'All' | 'Today' | '7 Days' | '30 Days'
    stockAvailability: 'All', // 'All' | 'Available' | 'Partial' | 'Unavailable'
  });

  // Table Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getOrdersData();
      setOrders(result.orders || []);
    } catch {
      toast.error('Network Error', 'Unable to fetch warehouse orders for allocation.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flatten order items into unified allocation tasks
  const rawAllocationItems = useMemo(() => {
    const list = [];
    orders.forEach((ord) => {
      // Exclude cancelled or delivered orders from active allocation queue
      if (['Cancelled', 'Delivered'].includes(ord.status)) return;

      (ord.items || []).forEach((it) => {
        const required = Number(it.requested || 0);
        const allocated = Number(it.allocated || 0);
        const remainingRequired = Math.max(0, required - allocated);
        const warehouseStock = Number(it.warehouseStock !== undefined ? it.warehouseStock : 50);
        const shortfall = Math.max(0, remainingRequired - warehouseStock);

        let itemStatus = 'Pending';
        if (allocated >= required) {
          itemStatus = ord.status === 'Ready for Picking' ? 'Ready for Picking' : 'Fully Allocated';
        } else if (allocated > 0) {
          itemStatus = 'Partially Allocated';
        } else if (warehouseStock === 0) {
          itemStatus = 'Shortfall';
        } else if (warehouseStock < required) {
          itemStatus = 'Shortfall';
        }

        list.push({
          orderId: ord.id,
          orderType: ord.type || 'Replenishment',
          priority: ord.priority || 'Normal',
          source: ord.source || 'Central Warehouse',
          destination: ord.destination || 'Main Street Store',
          expectedDate: ord.expectedDate || '11 Sep 2026',
          createdAt: ord.createdAt,
          dateLabel: ord.dateLabel,
          product: it.product || it.name,
          sku: it.sku,
          barcode: it.barcode,
          required,
          allocated,
          remainingRequired,
          warehouseStock,
          storeStock: Number(it.storeStock || 0),
          shortfall,
          status: itemStatus,
          unitPrice: it.unitPrice || 0,
        });
      });
    });

    return list;
  }, [orders]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: 'All',
      priority: 'All',
      orderType: 'All',
      dateRange: 'All',
      stockAvailability: 'All',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.orderType !== 'All' ||
    filters.dateRange !== 'All' ||
    filters.stockAvailability !== 'All';

  // Filtered and Sorted Allocation Items
  const filteredItems = useMemo(() => {
    return rawAllocationItems.filter((it) => {
      // 1. Search across Order ID, Product, SKU, Barcode
      if (filters.search.trim()) {
        const q = filters.search.trim().toLowerCase();
        const idMatch = (it.orderId || '').toLowerCase().includes(q);
        const prodMatch = (it.product || '').toLowerCase().includes(q);
        const skuMatch = (it.sku || '').toLowerCase().includes(q);
        const barcodeMatch = (it.barcode || '').toLowerCase().includes(q);
        if (!idMatch && !prodMatch && !skuMatch && !barcodeMatch) return false;
      }

      // 2. Status
      if (filters.status !== 'All') {
        if (filters.status === 'Ready for Picking') {
          if (it.status !== 'Ready for Picking' && it.status !== 'Fully Allocated') return false;
        } else if (it.status !== filters.status) {
          return false;
        }
      }

      // 3. Priority
      if (filters.priority !== 'All' && (it.priority || '').toLowerCase() !== filters.priority.toLowerCase()) {
        return false;
      }

      // 4. Order Type
      if (filters.orderType !== 'All' && it.orderType !== filters.orderType) {
        return false;
      }

      // 5. Date Range
      if (filters.dateRange !== 'All') {
        if (filters.dateRange === 'Today') {
          const isToday =
            (it.dateLabel && it.dateLabel.includes('09 Sep 2026')) ||
            (it.createdAt && it.createdAt.startsWith('2026-09-09'));
          if (!isToday) return false;
        } else if (it.createdAt) {
          const orderDate = new Date(it.createdAt);
          const anchor = new Date('2026-09-09T23:59:59Z');
          const diffDays = (anchor - orderDate) / (1000 * 60 * 60 * 24);

          if (filters.dateRange === '7 Days' && (diffDays > 7 || diffDays < 0)) return false;
          if (filters.dateRange === '30 Days' && (diffDays > 30 || diffDays < 0)) return false;
        }
      }

      // 6. Stock Availability
      if (filters.stockAvailability !== 'All') {
        if (filters.stockAvailability === 'Available' && it.warehouseStock < it.remainingRequired) return false;
        if (filters.stockAvailability === 'Partial' && (it.warehouseStock === 0 || it.warehouseStock >= it.remainingRequired)) return false;
        if (filters.stockAvailability === 'Unavailable' && it.warehouseStock > 0) return false;
      }

      return true;
    });
  }, [rawAllocationItems, filters]);

  // Primary KPIs (Dynamically calculated)
  const kpis = useMemo(() => {
    const pendingAlloc = filteredItems.filter((i) => i.status === 'Pending').length;
    const fullyAlloc = filteredItems.filter((i) => i.status === 'Fully Allocated').length;
    const partiallyAlloc = filteredItems.filter((i) => i.status === 'Partially Allocated').length;
    const shortfallCount = filteredItems.filter((i) => i.shortfall > 0 || i.status === 'Shortfall').length;

    // Distinct orders that are ready for picking
    const readyOrdersCount = new Set(
      filteredItems.filter((i) => i.status === 'Ready for Picking' || i.allocated >= i.required).map((i) => i.orderId)
    ).size;

    return {
      pendingAllocation: pendingAlloc,
      allocated: fullyAlloc,
      partiallyAllocated: partiallyAlloc,
      shortfall: shortfallCount,
      readyForPicking: readyOrdersCount,
    };
  }, [filteredItems]);

  // Allocation Summary Statistics
  const summary = useMemo(() => {
    const ordersCount = new Set(filteredItems.map((i) => i.orderId)).size;
    const productsCount = new Set(filteredItems.map((i) => i.sku)).size;
    const totalRequired = filteredItems.reduce((sum, it) => sum + it.required, 0);
    const totalAllocated = filteredItems.reduce((sum, it) => sum + (it.allocated || 0), 0);
    const totalRemaining = Math.max(0, totalRequired - totalAllocated);
    const totalShortfall = filteredItems.reduce((sum, it) => sum + (it.shortfall || 0), 0);
    const totalWarehouseAvailable = filteredItems.reduce((sum, it) => sum + (it.warehouseStock || 0), 0);
    const completionPct = totalRequired > 0 ? Math.min(100, Math.round((totalAllocated / totalRequired) * 100)) : 100;

    return {
      ordersCount,
      productsCount,
      totalRequired,
      totalAllocated,
      totalRemaining,
      totalShortfall,
      totalWarehouseAvailable,
      completionPct,
    };
  }, [filteredItems]);

  // Export CSV of currently filtered allocation lines
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error('No Data', 'No allocation lines available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Product',
      'SKU',
      'Barcode',
      'Required Units',
      'Warehouse Available',
      'Allocated Units',
      'Shortfall Units',
      'Source',
      'Destination',
      'Priority',
      'Status',
    ];

    const rows = filteredItems.map((it) => [
      it.orderId,
      it.product,
      it.sku,
      it.barcode,
      it.required,
      it.warehouseStock,
      it.allocated,
      it.shortfall,
      it.source,
      it.destination,
      it.priority,
      it.status,
    ]);

    exportWarehouseCSV({
      filename: `INVINTELL_Allocation_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows,
    });

    toast.success('Export Complete', `Exported ${filteredItems.length} allocation lines to CSV.`);
  };

  // Shortfalls list
  const shortfallsList = useMemo(() => {
    return filteredItems.filter((i) => i.shortfall > 0 || i.warehouseStock === 0);
  }, [filteredItems]);

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + pageSize);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    const pageKeys = paginatedItems.map((it) => `${it.orderId}-${it.sku}`);
    const allPageSelected = pageKeys.every((k) => selectedKeys.includes(k));

    if (allPageSelected) {
      const pageSet = new Set(pageKeys);
      setSelectedKeys(selectedKeys.filter((k) => !pageSet.has(k)));
    } else {
      setSelectedKeys(Array.from(new Set([...selectedKeys, ...pageKeys])));
    }
  };

  const handleToggleSelectOne = (key) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Release order to picking floor
  const handleSendToPicking = async (orderId) => {
    try {
      await sendOrderToPicking(orderId);
      toast.success('Released to Picking', `Order ${orderId} has been sent to the warehouse picking floor.`);
      loadData();
    } catch {
      toast.error('Dispatch Failed', 'Unable to transition order to picking floor.');
    }
  };

  // Review shortfall trigger
  const handleReviewShortfall = (item) => {
    setReplenishPreFill({
      sku: item.sku,
      name: item.product,
      quantity: item.shortfall || item.required || 50,
      type: 'Replenishment',
    });
    setIsReplenishOpen(true);
  };

  if (loading && orders.length === 0) {
    return <Loading text="Connecting to Central Warehouse Inventory Allocation Console..." />;
  }

  return (
    <PageContainer>
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            ALLOCATION
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Assign available inventory to orders before fulfillment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const pending = filteredItems.find((i) => i.allocated < i.required);
              if (pending) setSelectedItem(pending);
              else toast.info('Queue Allocated', 'No pending lines requiring manual allocation.');
            }}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Manual Allocate
          </button>

          <button
            type="button"
            onClick={() => setIsAutoModalOpen(true)}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Auto Allocate</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ================= WORKFLOW INDICATOR ================= */}
        <WarehouseWorkflowBar activeStage="allocation" orders={orders} />

        {/* ================= KPI ROW: 6 DYNAMIC CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* 1. TOTAL PRODUCTS (GLOBAL MASTER) */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL PRODUCTS
              </span>
              <p id="warehouse-product-count" className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {masterLoading || totalProducts === null ? '—' : totalProducts}
              </p>
              <span className="text-[10px] text-slate-400">Master catalog SKUs</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* 2. PENDING ALLOCATION */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PENDING ALLOCATION
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.pendingAllocation}
              </p>
              <span className="text-[10px] text-slate-400">Order lines awaiting stock</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* 3. ALLOCATED */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                ALLOCATED
              </span>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {kpis.allocated}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                100% reserved lines
              </span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200/60 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* 4. PARTIALLY ALLOCATED */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PARTIALLY ALLOCATED
              </span>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5 font-mono">
                {kpis.partiallyAllocated}
              </p>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold">
                Partial quantity reserved
              </span>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200/60 dark:border-amber-900">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          {/* 5. SHORTFALL */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                SHORTFALL
              </span>
              <p className="text-2xl font-black text-red-700 dark:text-red-400 mt-0.5 font-mono">
                {kpis.shortfall}
              </p>
              <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold">
                Stockout or deficient
              </span>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-lg border border-red-200/60 dark:border-red-900">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          {/* 6. ORDERS READY FOR PICKING */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                READY FOR PICKING
              </span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.readyForPicking}
              </p>
              <span className="text-[10px] text-slate-400">Can release to floor</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ================= ALLOCATION SUMMARY & PROGRESS BAR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                ALLOCATION SUMMARY
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Warehouse reservation progress across active retail store requisitions
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                {summary.ordersCount} Orders • {summary.productsCount} Products in Queue
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                {summary.totalAllocated} / {summary.totalRequired} units allocated ({summary.completionPct}%)
              </span>
            </div>
          </div>

          {/* Compact Controlled Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${summary.completionPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Total Required Units</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                {summary.totalRequired} pcs
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Allocated Units</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                {summary.totalAllocated} pcs
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Remaining Units</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {summary.totalRemaining} pcs
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Warehouse Reserves</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                {summary.totalWarehouseAvailable} pcs
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Shortfall Units</span>
              <span
                className={`font-mono font-bold text-sm ${
                  summary.totalShortfall > 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-400'
                }`}
              >
                {summary.totalShortfall} pcs
              </span>
            </div>
          </div>
        </div>

        {/* ================= ALLOCATION SHORTFALLS ================= */}
        {shortfallsList.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  ALLOCATION SHORTFALLS ({shortfallsList.length})
                </h3>
                <span className="text-[10px] text-slate-400">Orders where warehouse inventory is deficient</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shortfallsList.slice(0, 3).map((item, idx) => (
                <div
                  key={`${item.orderId}-${item.sku}-${idx}`}
                  className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 rounded-xl p-3.5 shadow-xs flex flex-col justify-between space-y-2.5"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                        {item.orderId}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/60 dark:text-red-300">
                        Shortfall: {item.shortfall} pcs
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate" title={item.product}>
                      {item.product}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      SKU: {item.sku} • Required: {item.required} • WH Stock: {item.warehouseStock}
                    </p>

                    <div className="mt-2 text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                        Recommended Action
                      </span>
                      <p className="text-[11px] text-red-800 dark:text-red-300 font-medium">
                        Replenish warehouse stock or issue vendor purchase order before release.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleReviewShortfall(item)}
                    className="w-full py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Review Shortfall</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
              <span>Allocation Queue Filters</span>
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
                placeholder="Search Order ID, Product, SKU, Barcode..."
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
                <option value="Pending">Pending</option>
                <option value="Partially Allocated">Partially Allocated</option>
                <option value="Fully Allocated">Fully Allocated</option>
                <option value="Shortfall">Shortfall</option>
                <option value="Ready for Picking">Ready for Picking</option>
              </select>
            </div>

            {/* 3. Priority */}
            <div>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* 4. Order Type */}
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

            {/* 5. Stock Availability */}
            <div>
              <select
                value={filters.stockAvailability}
                onChange={(e) => handleFilterChange('stockAvailability', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Stock Levels</option>
                <option value="Available">Available (100%)</option>
                <option value="Partial">Partial Stock</option>
                <option value="Unavailable">Zero Stock</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in allocation queue
            </span>
          </div>
        </div>

        {/* ================= BULK ACTIONS BAR ================= */}
        {selectedKeys.length > 0 && (
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedKeys.length} allocation items selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAutoModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                Auto Allocate Selected
              </button>

              <button
                type="button"
                onClick={() => setSelectedKeys([])}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Clear selection"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= MAIN ALLOCATION TABLE ================= */}
        <AllocationTable
          items={paginatedItems}
          selectedKeys={selectedKeys}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onOpenAllocateModal={(item) => setSelectedItem(item)}
          onSendToPicking={handleSendToPicking}
          onReviewShortfall={handleReviewShortfall}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItemsCount={filteredItems.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= MODALS ================= */}
      {selectedItem && (
        <AllocationDetailModal
          isOpen={Boolean(selectedItem)}
          itemData={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAllocationConfirmed={() => {
            loadData();
          }}
        />
      )}

      {isAutoModalOpen && (
        <AutoAllocationModal
          isOpen={isAutoModalOpen}
          eligibleItems={
            selectedKeys.length > 0
              ? filteredItems.filter((it) => selectedKeys.includes(`${it.orderId}-${it.sku}`))
              : filteredItems.filter((it) => it.allocated < it.required)
          }
          onClose={() => setIsAutoModalOpen(false)}
          onAutoAllocationConfirmed={() => {
            setSelectedKeys([]);
            loadData();
          }}
        />
      )}

      {isReplenishOpen && (
        <CreateOrderModal
          isOpen={isReplenishOpen}
          initialProduct={replenishPreFill}
          initialQuantity={replenishPreFill?.quantity || 50}
          initialType="Replenishment"
          onClose={() => {
            setIsReplenishOpen(false);
            setReplenishPreFill(null);
          }}
          onOrderCreated={() => {
            loadData();
          }}
        />
      )}
    </PageContainer>
  );
}
