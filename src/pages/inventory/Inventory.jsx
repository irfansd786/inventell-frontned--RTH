import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import InventoryTable from '../../components/inventory/InventoryTable';
import InventoryIntelligence from '../../components/inventory/InventoryIntelligence';
import ProductDetailsModal from '../../components/inventory/ProductDetailsModal';
import ReplenishmentModal from '../../components/inventory/ReplenishmentModal';
import AddProductModal from '../../components/inventory/AddProductModal';
import Loading from '../../components/common/Loading';
import { getInventoryOverview } from '../../services/inventoryService';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import {
  Search,
  Filter,
  X,
  Package,
  Boxes,
  CheckCircle2,
  Clock,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
  Plus,
  Database,
  Layers,
} from 'lucide-react';

export default function Inventory() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [replenishProduct, setReplenishProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Central Unified Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    status: 'All',
    location: 'All',
    sort: 'name_asc',
  });

  // Central Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getInventoryOverview();
      setData(result);
    } catch (err) {
      console.error('Failed to load inventory data', err);
      toast.error('Data Load Error', 'Unable to connect to inventory services.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle filter changes & automatically reset pagination to page 1
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      status: 'All',
      location: 'All',
      sort: 'name_asc',
    });
    setCurrentPage(1);
  };

  const rawProducts = data?.products || [];

  // Dynamically extract categories directly from real dataset products
  const categories = useMemo(() => {
    const set = new Set();
    rawProducts.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [rawProducts]);

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.category !== 'All' ||
    filters.status !== 'All' ||
    filters.location !== 'All' ||
    filters.sort !== 'name_asc';

  // Single Source of Truth: Filtered Products
  const filteredProducts = useMemo(() => {
    return rawProducts
      .filter((item) => {
        // 1. Search filter: works across Product Name, SKU, Item ID, Barcode, Category (case insensitive)
        if (filters.search.trim()) {
          const q = filters.search.trim().toLowerCase();
          const matchName = (item.name || '').toLowerCase().includes(q);
          const matchSku = (item.sku || '').toLowerCase().includes(q);
          const matchId = String(item.id || '').toLowerCase().includes(q);
          const matchBarcode = (item.barcode || '').toLowerCase().includes(q);
          const matchCat = (item.category || '').toLowerCase().includes(q);
          const matchDept = (item.department || '').toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchId && !matchBarcode && !matchCat && !matchDept) {
            return false;
          }
        }

        // 2. Category filter
        if (filters.category !== 'All' && item.category !== filters.category) {
          return false;
        }

        // 3. Stock Status filter
        if (filters.status !== 'All') {
          if (filters.status === 'Healthy' && item.status !== 'Healthy') return false;
          if (filters.status === 'Low Stock' && item.status !== 'Low Stock' && item.status !== 'Low') return false;
          if (filters.status === 'Critical' && item.status !== 'Critical') return false;
          if (filters.status === 'Out of Stock' && item.status !== 'Out of Stock') return false;
        }

        // 4. Location filter
        if (filters.location === 'Store' && (item.storeStock || 0) <= 0) return false;
        if (filters.location === 'Warehouse' && (item.warehouseStock || 0) <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        // Sorting happens after filtering
        switch (filters.sort) {
          case 'name_desc':
            return (b.name || '').localeCompare(a.name || '');
          case 'stock_asc':
            return (a.totalStock || 0) - (b.totalStock || 0);
          case 'stock_desc':
            return (b.totalStock || 0) - (a.totalStock || 0);
          case 'price_asc':
            return (a.price || 0) - (b.price || 0);
          case 'price_desc':
            return (b.price || 0) - (a.price || 0);
          case 'units_desc':
            return (b.unitsSold || 0) - (a.unitsSold || 0);
          case 'units_asc':
            return (a.unitsSold || 0) - (b.unitsSold || 0);
          case 'revenue_desc':
            return (b.revenue || 0) - (a.revenue || 0);
          case 'revenue_asc':
            return (a.revenue || 0) - (b.revenue || 0);
          case 'velocity_desc':
            return (b.salesVelocity || 0) - (a.salesVelocity || 0);
          case 'name_asc':
          default:
            return (a.name || '').localeCompare(b.name || '');
        }
      });
  }, [rawProducts, filters]);

  // Derived Filter-Dependent KPIs (Every KPI dynamically calculated from filtered dataset)
  const kpis = useMemo(() => {
    const totalProducts = filteredProducts.length;
    let totalUnits = 0;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalInventoryValue = 0;

    filteredProducts.forEach((p) => {
      const units = p.totalStock ?? ((p.storeStock || 0) + (p.warehouseStock || 0));
      totalUnits += units;
      totalInventoryValue += units * (p.price || 0);

      if (p.status === 'Healthy') {
        inStockCount++;
      } else if (p.status === 'Low Stock' || p.status === 'Low') {
        lowStockCount++;
      } else if (p.status === 'Critical' || p.status === 'Out of Stock') {
        outOfStockCount++;
      } else {
        inStockCount++;
      }
    });

    return {
      totalProducts,
      totalUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalInventoryValue,
    };
  }, [filteredProducts]);

  if (loading && !data) {
    return <Loading text="Connecting to Store & Warehouse Inventory Systems..." />;
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        {/* ================= HEADER ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Inventory
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Database className="w-3 h-3 text-emerald-600" />
                  Live Unified System
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Product catalog, stock levels and inventory intelligence
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-2xs"
                title="Refresh master inventory data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* ================= STEP 2: TOP FILTER BAR ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter & Sort Catalog
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({filteredProducts.length} of {rawProducts.length} items)
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 text-xs">
            {/* 1. Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search product, SKU, barcode..."
                className="w-full pl-8 pr-7 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Stock Status */}
            <div>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Stock Statuses</option>
                <option value="Healthy">Healthy Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical Alert</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* 4. Location */}
            <div>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Locations</option>
                <option value="Store">Store Stock Available</option>
                <option value="Warehouse">Warehouse Stock Available</option>
              </select>
            </div>

            {/* 5. Sort */}
            <div>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="name_asc">Product (A → Z)</option>
                <option value="name_desc">Product (Z → A)</option>
                <option value="stock_asc">Stock (Low → High)</option>
                <option value="stock_desc">Stock (High → Low)</option>
                <option value="price_asc">Price (Low → High)</option>
                <option value="price_desc">Price (High → Low)</option>
                <option value="units_desc">Units Sold (High → Low)</option>
                <option value="revenue_desc">Revenue (High → Low)</option>
                <option value="velocity_desc">Velocity (High → Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= STEP 3: DYNAMIC KPI ROW ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* KPI 1: TOTAL PRODUCTS */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Products
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {kpis.totalProducts.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Catalog SKUs</span>
          </div>

          {/* KPI 2: TOTAL UNITS */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Units
            </span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">
              {kpis.totalUnits.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Store + Warehouse</span>
          </div>

          {/* KPI 3: IN STOCK (HEALTHY) */}
          <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              In Stock
            </span>
            <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1 font-mono">
              {kpis.inStockCount.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-0.5 block">Healthy buffer</span>
          </div>

          {/* KPI 4: LOW STOCK */}
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              Low Stock
            </span>
            <p className="text-xl font-extrabold text-amber-900 dark:text-amber-300 mt-1 font-mono">
              {kpis.lowStockCount.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 block">≤ Reorder level</span>
          </div>

          {/* KPI 5: OUT OF STOCK / CRITICAL */}
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-red-800 dark:text-red-300 uppercase tracking-wider">
              Out of Stock
            </span>
            <p className="text-xl font-extrabold text-red-900 dark:text-red-400 mt-1 font-mono">
              {kpis.outOfStockCount.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-red-700 dark:text-red-400 mt-0.5 block">Depleted / critical</span>
          </div>

          {/* KPI 6: TOTAL INVENTORY VALUE IN INR */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
              Total Value
            </span>
            <p className="text-xl font-extrabold text-emerald-950 dark:text-emerald-400 mt-1 font-mono truncate">
              {formatINR(kpis.totalInventoryValue, 0)}
            </p>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">Asset valuation</span>
          </div>
        </div>

        {/* ================= STEP 4: MAIN PRODUCT + INVENTORY TABLE ================= */}
        <InventoryTable
          products={filteredProducts}
          onSelectProduct={(p) => setSelectedProductId(p.id)}
          onReplenish={(p) => setReplenishProduct(p)}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          pageSize={pageSize}
        />

        {/* ================= INVENTORY INTELLIGENCE (BELOW TABLE) ================= */}
        <InventoryIntelligence products={filteredProducts} />

        {/* ================= PRODUCT DETAILS MODAL ================= */}
        {selectedProductId && (
          <ProductDetailsModal
            productId={selectedProductId}
            isOpen={!!selectedProductId}
            onClose={() => setSelectedProductId(null)}
            onReplenished={loadData}
          />
        )}

        {/* ================= QUICK REPLENISH MODAL ================= */}
        {replenishProduct && (
          <ReplenishmentModal
            product={replenishProduct}
            onClose={() => setReplenishProduct(null)}
            onReplenished={loadData}
          />
        )}

        {/* ================= ADD PRODUCT MODAL ================= */}
        {showAddModal && (
          <AddProductModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onProductCreated={() => {
              loadData();
              toast.success('Product Created', 'New item has been added to master catalog.');
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
