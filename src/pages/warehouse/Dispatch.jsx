import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import DispatchTable from '../../components/warehouse/DispatchTable';
import DispatchDetailModal from '../../components/warehouse/DispatchDetailModal';
import ReportExceptionModal from '../../components/warehouse/ReportExceptionModal';
import WarehouseWorkflowBar from '../../components/warehouse/WarehouseWorkflowBar';
import Loading from '../../components/common/Loading';
import { getOrdersData, dispatchOrder } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { exportWarehouseCSV, getUniqueProductCount, getTotalUnits } from '../../utils/warehouseUtils';
import { useProductSummary } from '../../hooks/useProductSummary';

import {
  Truck,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Package,
} from 'lucide-react';

export default function Dispatch() {
  const { toast } = useToast();
  const { totalProducts, loading: masterLoading } = useProductSummary();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [exceptionOrder, setExceptionOrder] = useState(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    status: 'All', // 'All' | 'Ready for Dispatch' | 'Dispatched' | 'Delivered' | 'Blocked' | 'Exception'
    priority: 'All',
    destination: 'All',
    orderType: 'All',
    dateRange: 'All',
    sort: 'priority',
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
      toast.error('Network Error', 'Unable to fetch warehouse dispatch logistics queue.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Orders eligible for dispatch dock: orders that are Packed, Ready for Dispatch, Dispatched, Delivered, or In Transit
  const dispatchOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (['Cancelled', 'Draft'].includes(ord.status)) return false;
      const totalPacked = (ord.items || []).reduce((sum, it) => sum + (it.packed || 0), 0);
      return (
        totalPacked > 0 ||
        ['Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(ord.status)
      );
    });
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
      destination: 'All',
      orderType: 'All',
      dateRange: 'All',
      sort: 'priority',
    });
    setCurrentPage(1);
  };

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.status !== 'All' ||
    filters.priority !== 'All' ||
    filters.destination !== 'All' ||
    filters.orderType !== 'All' ||
    filters.dateRange !== 'All' ||
    filters.sort !== 'priority';

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    const priorityRank = { critical: 4, high: 3, normal: 2, low: 1 };

    return dispatchOrders
      .filter((ord) => {
        // 1. Search
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const idMatch = (ord.id || '').toLowerCase().includes(q);
          const destMatch = (ord.destination || '').toLowerCase().includes(q);
          const carrierMatch = (ord.carrier || '').toLowerCase().includes(q);
          const itemsMatch = (ord.items || []).some(
            (it) =>
              (it.product || it.name || '').toLowerCase().includes(q) ||
              (it.sku || '').toLowerCase().includes(q) ||
              (it.barcode || '').toLowerCase().includes(q)
          );
          if (!idMatch && !destMatch && !carrierMatch && !itemsMatch) {
            return false;
          }
        }

        // 2. Status
        if (filters.status !== 'All') {
          const totalUnits = (ord.items || []).reduce((s, it) => s + (it.requested || 0), 0);
          const totalPacked = (ord.items || []).reduce((s, it) => s + (it.packed || 0), 0);

          if (filters.status === 'Ready for Dispatch') {
            if (ord.status === 'Dispatched' || ord.status === 'Delivered' || totalPacked < totalUnits) {
              return false;
            }
          } else if (filters.status === 'Dispatched') {
            if (ord.status !== 'Dispatched') return false;
          } else if (filters.status === 'Delivered') {
            if (ord.status !== 'Delivered') return false;
          } else if (filters.status === 'Blocked') {
            if (totalPacked >= totalUnits && ord.status !== 'Blocked') return false;
          } else if (filters.status === 'Exception') {
            if (ord.status !== 'Exception' && !ord.isAtRisk) return false;
          } else if (ord.status !== filters.status) {
            return false;
          }
        }

        // 3. Priority
        if (filters.priority !== 'All' && (ord.priority || '').toLowerCase() !== filters.priority.toLowerCase()) {
          return false;
        }

        // 4. Destination
        if (filters.destination !== 'All' && ord.destination !== filters.destination) {
          return false;
        }

        // 5. Order Type
        if (filters.orderType !== 'All' && ord.type !== filters.orderType) {
          return false;
        }

        // 6. Date Range
        if (filters.dateRange !== 'All' && ord.createdAt) {
          const orderDate = new Date(ord.createdAt);
          const now = new Date();
          const diffDays = (now - orderDate) / (1000 * 60 * 60 * 24);

          if (filters.dateRange === 'Today' && diffDays > 1) return false;
          if (filters.dateRange === '7 Days' && diffDays > 7) return false;
          if (filters.dateRange === '30 Days' && diffDays > 30) return false;
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
  }, [dispatchOrders, filters]);

  // 6 Dynamic KPIs
  const kpis = useMemo(() => {
    // 1. READY FOR DISPATCH: orders packed and ready to leave dock
    const readyOrders = filteredOrders.filter((o) => {
      const totalUnits = (o.items || []).reduce((s, it) => s + (it.requested || 0), 0);
      const totalPacked = (o.items || []).reduce((s, it) => s + (it.packed || 0), 0);
      return totalPacked >= totalUnits && totalUnits > 0 && !['Dispatched', 'Delivered'].includes(o.status);
    }).length;

    // 2. PRODUCTS TO DISPATCH: count of UNIQUE products/SKUs
    const productsToDispatch = getUniqueProductCount(filteredOrders);

    // 3. UNITS TO DISPATCH: SUM of all units in active dispatch queue
    const unitsToDispatch = filteredOrders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((s, it) => s + (it.requested || 0), 0);
    }, 0);

    // 4. DISPATCHED: SUM of units dispatched
    const dispatchedUnits = filteredOrders.reduce((sum, o) => {
      if (['Dispatched', 'Delivered'].includes(o.status)) {
        return sum + (o.items || []).reduce((s, it) => s + (it.requested || 0), 0);
      }
      return sum;
    }, 0);

    // 5. PENDING: units not yet dispatched
    const pendingUnits = Math.max(0, unitsToDispatch - dispatchedUnits);

    // 6. AT RISK: count of orders with exceptions
    const atRiskOrders = filteredOrders.filter((o) => o.status === 'Exception' || o.isAtRisk).length;

    return {
      readyOrders,
      productsToDispatch,
      unitsToDispatch,
      dispatchedUnits,
      pendingUnits,
      atRiskOrders,
    };
  }, [filteredOrders]);

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  // Bulk Selection Handlers
  const handleToggleSelectAll = () => {
    const pageIds = paginatedOrders.map((o) => o.id);
    const allPageSelected = pageIds.every((id) => selectedIds.includes(id));

    if (allPageSelected) {
      const pageSet = new Set(pageIds);
      setSelectedIds(selectedIds.filter((id) => !pageSet.has(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Bulk Dispatch Action
  const handleBulkDispatch = async () => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await dispatchOrder(id, {
          carrier: 'Dedicated Fleet - Van #3',
          dockDoor: 'Dock Bay 4',
        });
      }
      toast.success('Batch Dispatch Completed', `✓ Dispatched ${selectedIds.length} orders.`);
      setSelectedIds([]);
      loadData();
    } catch {
      toast.error('Dispatch Error', 'Failed to dispatch selected orders. Ensure all items are packed.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No Data', 'No dispatch orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Products Count',
      'Total Units',
      'Destination',
      'Carrier / Method',
      'Vehicle Number',
      'Dock Door',
      'Tracking Number',
      'Priority',
      'Status',
      'Expected Date',
    ];

    const rows = filteredOrders.map((ord) => {
      const items = ord.items || [];
      const totalUnits = items.reduce((s, it) => s + (it.requested || 0), 0);

      return [
        ord.id,
        items.length,
        totalUnits,
        ord.destination || 'Main Street Store',
        ord.carrier || 'Dedicated Fleet - Van #3',
        ord.vehicleNumber || 'KA-01-E-4421',
        ord.dockDoor || 'Dock Bay 4',
        ord.trackingNumber || 'TRK-2026-9021',
        ord.priority || 'Normal',
        ord.status || 'Ready for Dispatch',
        ord.expectedDate || '',
      ];
    });

    exportWarehouseCSV({
      filename: `INVINTELL_Dispatch_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows,
    });

    toast.success('Export Complete', `Exported ${filteredOrders.length} dispatch shipments to CSV.`);
  };

  if (loading && orders.length === 0) {
    return <Loading text="Connecting to Warehouse Dispatch Docks..." />;
  }

  return (
    <PageContainer>
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            DISPATCH
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage carrier assignments, dock loading, and outgoing store shipments.
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
              const pendingOrder = filteredOrders.find((o) => {
                const totalUnits = (o.items || []).reduce((s, it) => s + (it.requested || 0), 0);
                const totalPacked = (o.items || []).reduce((s, it) => s + (it.packed || 0), 0);
                return totalPacked >= totalUnits && !['Dispatched', 'Delivered'].includes(o.status);
              });
              if (pendingOrder) setSelectedOrder(pendingOrder);
              else toast.info('Queue Dispatched', 'No packed orders waiting at the dispatch dock.');
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Dispatch Selected</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ================= WORKFLOW INDICATOR ================= */}
        <WarehouseWorkflowBar activeStage="dispatch" orders={orders} />

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
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* 2. PRODUCTS TO DISPATCH */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PRODUCTS TO DISPATCH
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.productsToDispatch}
              </p>
              <span className="text-[10px] text-slate-400">Unique SKUs</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* 3. UNITS TO DISPATCH */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                UNITS TO DISPATCH
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.unitsToDispatch}
              </p>
              <span className="text-[10px] text-slate-400">Total units</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>

          {/* 4. DISPATCHED */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                DISPATCHED
              </span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {kpis.dispatchedUnits}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Units in transit
              </span>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200/60 dark:border-emerald-900">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          {/* 5. PENDING */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PENDING
              </span>
              <p
                className={`text-xl font-black mt-0.5 font-mono ${
                  kpis.pendingUnits > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400'
                }`}
              >
                {kpis.pendingUnits}
              </p>
              <span className="text-[10px] text-slate-400">Units left</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Clock className="w-4 h-4" />
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
              <span className="text-[10px] text-slate-400">Orders on dock</span>
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
              <span>Dispatch Queue Filters</span>
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
                placeholder="Search Order ID, Product, SKU, Barcode, Carrier..."
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
                <option value="Ready for Dispatch">Ready for Dispatch</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Delivered">Delivered</option>
                <option value="Blocked">Blocked</option>
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

            {/* 4. Destination */}
            <div>
              <select
                value={filters.destination}
                onChange={(e) => handleFilterChange('destination', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium cursor-pointer focus:outline-none"
              >
                <option value="All">All Destinations</option>
                <option value="Main Street Store">Main Street Store</option>
                <option value="Sector 18 Store">Sector 18 Store</option>
                <option value="Direct Customer Delivery">Direct Customer Delivery</option>
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
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'shipment' : 'shipments'} in dispatch queue
            </span>
          </div>
        </div>

        {/* ================= BULK ACTIONS BAR ================= */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedIds.length} dispatch orders selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkDispatch}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                Dispatch Selected Orders
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

        {/* ================= MAIN DISPATCH TABLE ================= */}
        <DispatchTable
          orders={paginatedOrders}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onOpenDispatchModal={(ord) => setSelectedOrder(ord)}
          currentPage={currentPage}
          pageSize={pageSize}
          totalOrdersCount={filteredOrders.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= DISPATCH DETAIL MODAL ================= */}
      {selectedOrder && (
        <DispatchDetailModal
          isOpen={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onDispatchConfirmed={() => {
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
          stage="Dispatch"
          onClose={() => setExceptionOrder(null)}
          onExceptionReported={() => {
            loadData();
          }}
        />
      )}
    </PageContainer>
  );
}
