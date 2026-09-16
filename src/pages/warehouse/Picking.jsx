import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PickingTable from '../../components/warehouse/PickingTable';
import PickingDetailModal from '../../components/warehouse/PickingDetailModal';
import ReportExceptionModal from '../../components/warehouse/ReportExceptionModal';
import WarehouseWorkflowBar from '../../components/warehouse/WarehouseWorkflowBar';
import Loading from '../../components/common/Loading';
import { getOrdersData, markOrderPicked } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { exportWarehouseCSV, getUniqueProductCount, getTotalUnits } from '../../utils/warehouseUtils';
import { useProductSummary } from '../../hooks/useProductSummary';

import {
  Boxes,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Check,
  Package,
} from 'lucide-react';

export default function Picking() {
  const { toast } = useToast();
  const { totalProducts, loading: masterLoading } = useProductSummary();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exceptionOrder, setExceptionOrder] = useState(null);

  // Bulk selection state (keys in format "orderId-sku")
  const [selectedKeys, setSelectedKeys] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'All', // 'All' | 'Ready to Pick' | 'Picking' | 'Partially Picked' | 'Picked' | 'Exception'
    priority: 'All', // 'All' | 'Critical' | 'High' | 'Normal' | 'Low'
    orderType: 'All', // 'All' | 'Replenishment' | 'Transfer' | 'Customer Order'
    destination: 'All',
    sort: 'priority', // 'priority' | 'newest' | 'oldest' | 'expected'
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
      toast.error('Network Error', 'Unable to fetch warehouse picking queue.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flatten active orders into unified picking lines
  const rawPickingItems = useMemo(() => {
    const list = [];
    orders.forEach((ord) => {
      // Exclude cancelled or delivered orders
      if (['Cancelled', 'Delivered', 'Draft'].includes(ord.status)) return;

      // Only orders that have allocations
      const hasAllocated = (ord.items || []).some((it) => (it.allocated || 0) > 0);
      if (!hasAllocated && ord.status === 'Pending') return;

      (ord.items || []).forEach((it) => {
        const required = Number(it.requested || 0);
        const allocated = Number(it.allocated || 0);
        const picked = Number(it.picked || 0);
        const remaining = Math.max(0, allocated - picked);

        let itemStatus = 'Ready to Pick';
        if (ord.status === 'Exception' || ord.status === 'At Risk') {
          itemStatus = 'Exception';
        } else if (remaining === 0 && allocated > 0) {
          itemStatus = 'Picked';
        } else if (picked > 0) {
          itemStatus = 'Partially Picked';
        } else if (ord.status === 'Picking') {
          itemStatus = 'Picking';
        }

        list.push({
          orderId: ord.id,
          orderType: ord.type || 'Replenishment',
          priority: ord.priority || 'Normal',
          source: ord.source || 'Central Warehouse',
          destination: ord.destination || 'Main Street Store',
          picker: ord.picker || 'Unassigned',
          expectedDate: ord.expectedDate || '',
          createdAt: ord.createdAt,
          product: it.product || it.name,
          sku: it.sku,
          barcode: it.barcode,
          required,
          allocated,
          picked,
          remaining,
          status: itemStatus,
          orderRef: ord,
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
      destination: 'All',
      sort: 'priority',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.orderType !== 'All' ||
    filters.destination !== 'All' ||
    filters.sort !== 'priority';

  // Filter and sort items
  const filteredItems = useMemo(() => {
    const priorityRank = { critical: 4, high: 3, normal: 2, low: 1 };

    return rawPickingItems
      .filter((it) => {
        // 1. Search
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const idMatch = (it.orderId || '').toLowerCase().includes(q);
          const prodMatch = (it.product || '').toLowerCase().includes(q);
          const skuMatch = (it.sku || '').toLowerCase().includes(q);
          const barcodeMatch = (it.barcode || '').toLowerCase().includes(q);
          const destMatch = (it.destination || '').toLowerCase().includes(q);
          const pickerMatch = (it.picker || '').toLowerCase().includes(q);
          if (!idMatch && !prodMatch && !skuMatch && !barcodeMatch && !destMatch && !pickerMatch) {
            return false;
          }
        }

        // 2. Status
        if (filters.status !== 'All' && it.status !== filters.status) {
          return false;
        }

        // 3. Priority
        if (filters.priority !== 'All' && (it.priority || '').toLowerCase() !== filters.priority.toLowerCase()) {
          return false;
        }

        // 4. Order Type
        if (filters.orderType !== 'All' && it.orderType !== filters.orderType) {
          return false;
        }

        // 5. Destination
        if (filters.destination !== 'All' && it.destination !== filters.destination) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'priority') {
          const rA = priorityRank[(a.priority || '').toLowerCase()] || 0;
          const rB = priorityRank[(b.priority || '').toLowerCase()] || 0;
          if (rB !== rA) return rB - rA;
        }
        if (filters.sort === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (filters.sort === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (filters.sort === 'expected') {
          return new Date(a.expectedDate || 0) - new Date(b.expectedDate || 0);
        }
        return 0;
      });
  }, [rawPickingItems, filters]);

  // 6 Dynamic KPIs
  const kpis = useMemo(() => {
    // 1. READY TO PICK: count of distinct orders requiring picking
    const readyOrders = new Set(
      filteredItems.filter((i) => i.status !== 'Picked' && i.remaining > 0).map((i) => i.orderId)
    ).size;

    // 2. PRODUCTS TO PICK: count of UNIQUE products/SKUs
    const productsToPick = new Set(
      filteredItems.filter((i) => i.remaining > 0).map((i) => i.sku)
    ).size;

    // 3. UNITS TO PICK: SUM of allocated units needing picking
    const unitsToPick = filteredItems.reduce((sum, i) => sum + (i.allocated || 0), 0);

    // 4. PICKED: SUM of units already picked
    const pickedUnits = filteredItems.reduce((sum, i) => sum + (i.picked || 0), 0);

    // 5. REMAINING: SUM of remaining units
    const remainingUnits = Math.max(0, unitsToPick - pickedUnits);

    // 6. AT RISK: count of distinct orders with exceptions
    const atRiskOrders = new Set(
      filteredItems.filter((i) => i.status === 'Exception' || i.orderRef?.isAtRisk).map((i) => i.orderId)
    ).size;

    return {
      readyOrders,
      productsToPick,
      unitsToPick,
      pickedUnits,
      remainingUnits,
      atRiskOrders,
    };
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

  // Bulk Pick Action
  const handleBulkMarkPicked = async () => {
    if (selectedKeys.length === 0) return;
    const orderIds = Array.from(new Set(selectedKeys.map((k) => k.split('-')[0])));

    try {
      for (const ordId of orderIds) {
        await markOrderPicked(ordId);
      }
      toast.success('Batch Picking Completed', `✓ Picked all items for ${orderIds.length} orders.`);
      setSelectedKeys([]);
      loadData();
    } catch {
      toast.error('Batch Error', 'Unable to complete batch picking.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error('No Data', 'No picking lines available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Product',
      'SKU',
      'Barcode',
      'Required Units',
      'Allocated Units',
      'Picked Units',
      'Remaining Units',
      'Source',
      'Destination',
      'Assigned Picker',
      'Priority',
      'Status',
    ];

    const rows = filteredItems.map((it) => [
      it.orderId,
      it.product,
      it.sku,
      it.barcode,
      it.required,
      it.allocated,
      it.picked,
      it.remaining,
      it.source,
      it.destination,
      it.picker,
      it.priority,
      it.status,
    ]);

    exportWarehouseCSV({
      filename: `INVINTELL_Picking_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows,
    });

    toast.success('Export Complete', `Exported ${filteredItems.length} picking tasks to CSV.`);
  };

  if (loading && orders.length === 0) {
    return <Loading text="Connecting to Warehouse Floor Picking Assignments..." />;
  }

  return (
    <PageContainer>
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            PICKING
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage floor picker tasks, aisle pick lists, and item location verification.
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
              const pendingOrder = orders.find((o) =>
                ['Allocated', 'Ready for Picking', 'Picking', 'Partially Picked'].includes(o.status)
              );
              if (pendingOrder) setSelectedOrder(pendingOrder);
              else toast.info('Queue Picked', 'No pending orders requiring picking.');
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Start Batch Picking</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ================= WORKFLOW INDICATOR ================= */}
        <WarehouseWorkflowBar activeStage="picking" orders={orders} />

        {/* ================= 7 DYNAMIC KPI ROW ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
          {/* 1. TOTAL PRODUCTS (GLOBAL MASTER) */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL PRODUCTS
              </span>
              <p id="warehouse-product-count" className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {masterLoading || totalProducts === null ? '—' : totalProducts}
              </p>
              <span className="text-[10px] text-slate-400">Master catalog</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>

          {/* 2. PRODUCTS TO PICK */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PRODUCTS TO PICK
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.productsToPick}
              </p>
              <span className="text-[10px] text-slate-400">Unique SKUs</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* 3. UNITS TO PICK */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                UNITS TO PICK
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.unitsToPick}
              </p>
              <span className="text-[10px] text-slate-400">Total units</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Boxes className="w-4 h-4" />
            </div>
          </div>

          {/* 4. PICKED */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PICKED
              </span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {kpis.pickedUnits}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Units picked
              </span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200/60 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* 5. REMAINING */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                REMAINING
              </span>
              <p
                className={`text-xl font-black mt-0.5 font-mono ${
                  kpis.remainingUnits > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'
                }`}
              >
                {kpis.remainingUnits}
              </p>
              <span className="text-[10px] text-slate-400">Units left</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* 6. READY ORDERS */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                READY ORDERS
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.readyOrders}
              </p>
              <span className="text-[10px] text-slate-400">Orders ready</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          {/* 7. AT RISK */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                AT RISK
              </span>
              <p
                className={`text-xl font-black mt-0.5 font-mono ${
                  kpis.atRiskOrders > 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-400'
                }`}
              >
                {kpis.atRiskOrders}
              </p>
              <span className="text-[10px] text-red-700 dark:text-red-400 font-semibold">
                Exceptions
              </span>
            </div>
            <div className="p-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 rounded-lg border border-red-200/60 dark:border-red-900">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* ================= FILTER BAR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Picking Queue Filters</span>
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
                placeholder="Search Order ID, Product, SKU, Barcode, Picker..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
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
                <option value="Ready to Pick">Ready to Pick</option>
                <option value="Picking">Picking</option>
                <option value="Partially Picked">Partially Picked</option>
                <option value="Picked">Picked</option>
                <option value="Exception">Exception</option>
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

            {/* 5. Sort */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="priority">Sort: Highest Priority</option>
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="expected">Sort: Expected Date</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'task' : 'tasks'} across{' '}
              {new Set(filteredItems.map((i) => i.orderId)).size} orders
            </span>
          </div>
        </div>

        {/* ================= BULK ACTIONS BAR ================= */}
        {selectedKeys.length > 0 && (
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedKeys.length} pick items selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkMarkPicked}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                Mark Selected as Picked
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

        {/* ================= MAIN PICKING TABLE ================= */}
        <PickingTable
          items={paginatedItems}
          selectedKeys={selectedKeys}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onOpenPickModal={(orderRef) => setSelectedOrder(orderRef)}
          currentPage={currentPage}
          pageSize={pageSize}
          totalItemsCount={filteredItems.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= PICKING DETAIL MODAL ================= */}
      {selectedOrder && (
        <PickingDetailModal
          isOpen={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPickingUpdated={() => {
            loadData();
          }}
          onOpenException={(ord) => {
            setSelectedOrder(null);
            setExceptionOrder(ord);
          }}
        />
      )}

      {/* ================= REPORT EXCEPTION MODAL ================= */}
      {exceptionOrder && (
        <ReportExceptionModal
          isOpen={Boolean(exceptionOrder)}
          order={exceptionOrder}
          stage="Picking"
          onClose={() => setExceptionOrder(null)}
          onExceptionReported={() => {
            loadData();
          }}
        />
      )}
    </PageContainer>
  );
}
