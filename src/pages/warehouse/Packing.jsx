import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import PackingTable from '../../components/warehouse/PackingTable';
import PackingDetailModal from '../../components/warehouse/PackingDetailModal';
import ReportExceptionModal from '../../components/warehouse/ReportExceptionModal';
import WarehouseWorkflowBar from '../../components/warehouse/WarehouseWorkflowBar';
import Loading from '../../components/common/Loading';
import { getOrdersData, markOrderPacked } from '../../services/orderService';
import { useToast } from '../../context/ToastContext';
import { exportWarehouseCSV, getUniqueProductCount, getTotalUnits } from '../../utils/warehouseUtils';
import { useProductSummary } from '../../hooks/useProductSummary';

import {
  Package,
  Search,
  Filter,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Download,
  Box,
} from 'lucide-react';

export default function Packing() {
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
    status: 'All', // 'All' | 'Ready for Packing' | 'Packing' | 'Partially Packed' | 'Packed' | 'Exception'
    priority: 'All',
    destination: 'All',
    orderType: 'All',
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
      toast.error('Network Error', 'Unable to fetch warehouse packing stations queue.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Eligible orders for packing floor: orders that are Picked, Picking, Ready for Packing, or Packed
  const packingOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (['Cancelled', 'Delivered', 'Draft'].includes(ord.status)) return false;
      const totalPicked = (ord.items || []).reduce((sum, it) => sum + (it.picked || 0), 0);
      // If order is in Picking or beyond, or has picked items
      return (
        totalPicked > 0 ||
        ['Picked', 'Ready for Packing', 'Packing', 'Partially Packed', 'Packed', 'Ready for Dispatch'].includes(
          ord.status
        )
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
    filters.sort !== 'priority';

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    const priorityRank = { critical: 4, high: 3, normal: 2, low: 1 };

    return packingOrders
      .filter((ord) => {
        // 1. Search
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const idMatch = (ord.id || '').toLowerCase().includes(q);
          const destMatch = (ord.destination || '').toLowerCase().includes(q);
          const packerMatch = (ord.packer || '').toLowerCase().includes(q);
          const itemsMatch = (ord.items || []).some(
            (it) =>
              (it.product || it.name || '').toLowerCase().includes(q) ||
              (it.sku || '').toLowerCase().includes(q) ||
              (it.barcode || '').toLowerCase().includes(q)
          );
          if (!idMatch && !destMatch && !packerMatch && !itemsMatch) {
            return false;
          }
        }

        // 2. Status
        if (filters.status !== 'All') {
          const totalPicked = (ord.items || []).reduce((s, it) => s + (it.picked || 0), 0);
          const totalPacked = (ord.items || []).reduce((s, it) => s + (it.packed || 0), 0);

          if (filters.status === 'Packed') {
            if (ord.status !== 'Packed' && ord.status !== 'Ready for Dispatch' && totalPacked < totalPicked) {
              return false;
            }
          } else if (filters.status === 'Ready for Packing') {
            if (totalPacked > 0 || ['Packed', 'Ready for Dispatch', 'Dispatched'].includes(ord.status)) {
              return false;
            }
          } else if (filters.status === 'Partially Packed') {
            if (totalPacked === 0 || totalPacked >= totalPicked) return false;
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
  }, [packingOrders, filters]);

  // 6 Dynamic KPIs
  const kpis = useMemo(() => {
    // 1. READY FOR PACKING: count of orders needing packing
    const readyOrders = filteredOrders.filter((o) => {
      const picked = (o.items || []).reduce((s, it) => s + (it.picked || it.allocated || 0), 0);
      const packed = (o.items || []).reduce((s, it) => s + (it.packed || 0), 0);
      return packed < picked;
    }).length;

    // 2. PRODUCTS TO PACK: count of UNIQUE products/SKUs
    const productsToPack = getUniqueProductCount(filteredOrders);

    // 3. UNITS TO PACK: SUM of picked units needing packing
    const unitsToPack = filteredOrders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((s, it) => s + (it.picked || it.allocated || 0), 0);
    }, 0);

    // 4. PACKED: SUM of units already packed
    const packedUnits = filteredOrders.reduce((sum, o) => {
      return sum + (o.items || []).reduce((s, it) => s + (it.packed || 0), 0);
    }, 0);

    // 5. REMAINING: units to pack minus units packed
    const remainingUnits = Math.max(0, unitsToPack - packedUnits);

    // 6. AT RISK: count of orders with exceptions
    const atRiskOrders = filteredOrders.filter((o) => o.status === 'Exception' || o.isAtRisk).length;

    return {
      readyOrders,
      productsToPack,
      unitsToPack,
      packedUnits,
      remainingUnits,
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

  // Bulk Pack Action
  const handleBulkMarkPacked = async () => {
    if (selectedIds.length === 0) return;
    try {
      for (const id of selectedIds) {
        await markOrderPacked(id);
      }
      toast.success('Batch Packing Completed', `✓ Packed and sealed ${selectedIds.length} orders.`);
      setSelectedIds([]);
      loadData();
    } catch {
      toast.error('Packing Error', 'Failed to pack selected orders.');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error('No Data', 'No packing orders available to export.');
      return;
    }

    const headers = [
      'Order ID',
      'Products Count',
      'Total Units',
      'Picked Units',
      'Packed Units',
      'Destination',
      'Assigned Packer',
      'Package Count',
      'Box Type',
      'Priority',
      'Status',
    ];

    const rows = filteredOrders.map((ord) => {
      const items = ord.items || [];
      const totalUnits = items.reduce((s, it) => s + (it.requested || 0), 0);
      const totalPicked = items.reduce((s, it) => s + (it.picked || it.allocated || 0), 0);
      const totalPacked = items.reduce((s, it) => s + (it.packed || 0), 0);

      return [
        ord.id,
        items.length,
        totalUnits,
        totalPicked,
        totalPacked,
        ord.destination || 'Main Street Store',
        ord.packer || 'Sunita P.',
        ord.packageCount || 2,
        ord.boxType || 'Corrugated Carton B2',
        ord.priority || 'Normal',
        ord.status || 'Packing',
      ];
    });

    exportWarehouseCSV({
      filename: `INVINTELL_Packing_${new Date().toISOString().split('T')[0]}.csv`,
      headers,
      rows,
    });

    toast.success('Export Complete', `Exported ${filteredOrders.length} packing orders to CSV.`);
  };

  if (loading && orders.length === 0) {
    return <Loading text="Connecting to Warehouse Packing Stations..." />;
  }

  return (
    <PageContainer>
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            PACKING
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verify picked order items, package containers, and prepare shipping manifests.
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
                const picked = (o.items || []).reduce((s, it) => s + (it.picked || it.allocated || 0), 0);
                const packed = (o.items || []).reduce((s, it) => s + (it.packed || 0), 0);
                return packed < picked;
              });
              if (pendingOrder) setSelectedOrder(pendingOrder);
              else toast.info('Queue Packed', 'No pending orders requiring packing.');
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Pack Selected</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* ================= WORKFLOW INDICATOR ================= */}
        <WarehouseWorkflowBar activeStage="packing" orders={orders} />

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
              <Box className="w-4 h-4" />
            </div>
          </div>

          {/* 2. PRODUCTS TO PACK */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PRODUCTS TO PACK
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.productsToPack}
              </p>
              <span className="text-[10px] text-slate-400">Unique SKUs</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Package className="w-4 h-4" />
            </div>
          </div>

          {/* 3. UNITS TO PACK */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                UNITS TO PACK
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white mt-0.5 font-mono">
                {kpis.unitsToPack}
              </p>
              <span className="text-[10px] text-slate-400">Total units</span>
            </div>
            <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">
              <Box className="w-4 h-4" />
            </div>
          </div>

          {/* 4. PACKED */}
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                PACKED
              </span>
              <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5 font-mono">
                {kpis.packedUnits}
              </p>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Sealed into boxes
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
              <span>Packing Queue Filters</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {/* 1. Search */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search Order ID, Product, SKU, Barcode, Packer..."
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
                <option value="Ready for Packing">Ready for Packing</option>
                <option value="Packing">Packing</option>
                <option value="Partially Packed">Partially Packed</option>
                <option value="Packed">Packed</option>
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

            {/* 4. Sort */}
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
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'} in packing queue
            </span>
          </div>
        </div>

        {/* ================= BULK ACTIONS BAR ================= */}
        {selectedIds.length > 0 && (
          <div className="p-3 bg-slate-900 text-white rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-md animate-fadeIn">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{selectedIds.length} packing orders selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleBulkMarkPacked}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer"
              >
                Mark Selected as Packed
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

        {/* ================= MAIN PACKING TABLE ================= */}
        <PackingTable
          orders={paginatedOrders}
          selectedIds={selectedIds}
          onToggleSelectAll={handleToggleSelectAll}
          onToggleSelectOne={handleToggleSelectOne}
          onOpenPackModal={(ord) => setSelectedOrder(ord)}
          currentPage={currentPage}
          pageSize={pageSize}
          totalOrdersCount={filteredOrders.length}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ================= PACKING DETAIL MODAL ================= */}
      {selectedOrder && (
        <PackingDetailModal
          isOpen={Boolean(selectedOrder)}
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPackingUpdated={() => {
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
          stage="Packing"
          onClose={() => setExceptionOrder(null)}
          onExceptionReported={() => {
            loadData();
          }}
        />
      )}
    </PageContainer>
  );
}
