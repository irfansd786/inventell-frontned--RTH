import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import Loading from '../../components/common/Loading';
import ProductDetailsModal from '../../components/inventory/ProductDetailsModal';
import AddProductModal from '../../components/inventory/AddProductModal';
import ReplenishmentModal from '../../components/inventory/ReplenishmentModal';
import {
  Search,
  RefreshCw,
  Plus,
  Filter,
  X,
  Package,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Warehouse,
  Store,
  IndianRupee,
  Tag,
  BarChart2,
  Database,
  Copy,
} from 'lucide-react';
import { getProductCatalog, getProductKpis } from '../../services/productService';
import { formatINR } from '../../utils/formatters';
import { enrichProductData } from '../../utils/productIntelligence';
import { useToast } from '../../context/ToastContext';

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected product for centered floating details modal
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [replenishProduct, setReplenishProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Multi-Filter System
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState('All');
  const [salesPerfFilter, setSalesPerfFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name_asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catalogRes, kpisRes] = await Promise.all([
        getProductCatalog(),
        getProductKpis().catch(() => null),
      ]);
      const enriched = (Array.isArray(catalogRes) ? catalogRes : []).map(enrichProductData);
      setProducts(enriched);
      setKpis(kpisRes);
    } catch (err) {
      setError('Unable to load product catalog. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dynamically extract categories from real dataset products
  const availableCategories = useMemo(() => {
    const cats = new Set();
    products.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [products]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('All');
    setStockStatusFilter('All');
    setSalesPerfFilter('All');
    setSortBy('name_asc');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    categoryFilter !== 'All' ||
    stockStatusFilter !== 'All' ||
    salesPerfFilter !== 'All' ||
    sortBy !== 'name_asc';

  // MULTIPLE FILTER COMBINATION (ALL CONDITIONS APPLY TOGETHER)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchSku = p.sku?.toLowerCase().includes(q);
        const matchCategory = p.category?.toLowerCase().includes(q);
        const matchDept = p.department?.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCategory && !matchDept) {
          return false;
        }
      }

      // 2. Category filter
      if (categoryFilter !== 'All' && p.category !== categoryFilter) {
        return false;
      }

      // 3. Stock Status filter
      if (stockStatusFilter !== 'All' && p.stock_status !== stockStatusFilter) {
        return false;
      }

      // 4. Sales Performance filter
      if (salesPerfFilter !== 'All' && p.sales_performance !== salesPerfFilter) {
        return false;
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter, stockStatusFilter, salesPerfFilter]);

  // Sorting
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    list.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rev_desc':
          return (b.revenue || 0) - (a.revenue || 0);
        case 'rev_asc':
          return (a.revenue || 0) - (b.revenue || 0);
        case 'units_desc':
          return (b.units_sold || 0) - (a.units_sold || 0);
        case 'units_asc':
          return (a.units_sold || 0) - (b.units_sold || 0);
        case 'stock_desc':
          return (b.total_stock || 0) - (a.total_stock || 0);
        case 'stock_asc':
          return (a.total_stock || 0) - (b.total_stock || 0);
        case 'velocity_desc':
          return (b.sales_velocity || 0) - (a.sales_velocity || 0);
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return list;
  }, [filteredProducts, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(sortedProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedProducts.slice(start, start + pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  if (loading && products.length === 0) {
    return <Loading text="Loading Master Product Catalog..." />;
  }

  // Stock status pill colors
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Low Stock':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'Critical':
        return 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        {/* ================= PAGE HEADER ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Products
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Database className="w-3 h-3 text-emerald-600" />
                  M5 & Retail Inventory
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Product catalog with sales, inventory and customer-interest intelligence
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Refresh product catalog"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={loadData} className="font-bold underline cursor-pointer">
              Retry
            </button>
          </div>
        )}

        {/* ================= PRODUCT KPI ROW ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI 1: Total Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Products
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {kpis?.total_products || products.length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Master Catalog SKUs</p>
            </div>
          </div>

          {/* KPI 2: Active Products */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Products
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
                {kpis?.active_products || products.filter((p) => p.is_active).length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Active in Store & Warehouse</p>
            </div>
          </div>

          {/* KPI 3: Low Stock */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Low Stock
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
                {kpis?.low_stock !== undefined
                  ? kpis.low_stock
                  : products.filter((p) => p.stock_status === 'Low Stock' || p.stock_status === 'Critical').length}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">At or Below Reorder Threshold</p>
            </div>
          </div>

          {/* KPI 4: Top Seller */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Top Seller
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                {kpis?.top_seller?.name || '—'}
              </p>
              <p className="mt-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(kpis?.top_seller?.revenue || 0)}{' '}
                <span className="text-[11px] font-normal text-slate-400">
                  ({kpis?.top_seller?.units || 0} pcs sold)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* ================= PRODUCT FILTER SYSTEM (COMBINED) ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Filter & Sort Catalog
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                ({filteredProducts.length} of {products.length} products match)
              </span>
            </div>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline font-bold cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search products, SKU..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* 2. Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Stock Status */}
            <div>
              <select
                value={stockStatusFilter}
                onChange={(e) => {
                  setStockStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Stock Health</option>
                <option value="Healthy">Healthy Stock</option>
                <option value="Low Stock">Low Stock</option>
                <option value="Critical">Critical Level</option>
                <option value="Out of Stock">Out of Stock</option>
              </select>
            </div>

            {/* 4. Sales Performance */}
            <div>
              <select
                value={salesPerfFilter}
                onChange={(e) => {
                  setSalesPerfFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="All">All Sales Velocity</option>
                <option value="Top Sellers">Top Sellers</option>
                <option value="High Demand">High Demand</option>
                <option value="Low Demand">Low Demand</option>
                <option value="No Sales">No Sales</option>
              </select>
            </div>

            {/* 5. Sort By */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="name_asc">Product Name (A-Z)</option>
                <option value="name_desc">Product Name (Z-A)</option>
                <option value="rev_desc">Revenue High → Low</option>
                <option value="rev_asc">Revenue Low → High</option>
                <option value="units_desc">Units Sold High → Low</option>
                <option value="units_asc">Units Sold Low → High</option>
                <option value="stock_desc">Stock High → Low</option>
                <option value="stock_asc">Stock Low → High</option>
                <option value="velocity_desc">Sales Velocity High → Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================= PRODUCT TABLE ================= */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-3">Item ID / SKU</th>
                  <th className="py-3 px-3">Barcode</th>
                  <th className="py-3 px-3 text-right">Price</th>
                  <th className="py-3 px-3 text-right">Current Stock</th>
                  <th className="py-3 px-3 text-right">Units Sold</th>
                  <th className="py-3 px-3 text-right">Revenue</th>
                  <th className="py-3 px-3 text-right">Velocity</th>
                  <th className="py-3 px-3 text-center">Stock Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProductId(p.id)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    >
                      {/* Product Name & Category */}
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 transition-colors">
                          {p.name}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                          {p.category}
                        </span>
                      </td>

                      {/* Item ID / SKU */}
                      <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                        {p.sku}
                      </td>

                      {/* Barcode (Deterministic EAN-13) */}
                      <td className="py-3.5 px-3">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            {p.barcode}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(p.barcode);
                              toast.info('Barcode Copied', `${p.barcode} copied to clipboard.`);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors cursor-pointer"
                            title="Copy Barcode"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatINR(p.price, 2)}
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {p.total_stock} pcs
                        </span>
                        <p className="text-[10px] text-slate-400">
                          (Store: {p.store_stock}, WH: {p.warehouse_stock})
                        </p>
                      </td>

                      {/* Units Sold */}
                      <td className="py-3.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {Number(p.units_sold || 0).toLocaleString('en-IN')} pcs
                      </td>

                      {/* Revenue */}
                      <td className="py-3.5 px-3 text-right">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatINR(p.revenue, 2)}
                        </span>
                        {p.revenueType && p.revenueType !== 'Actual' && (
                          <span className="block text-[9px] text-slate-400 font-medium">
                            {p.revenueType}
                          </span>
                        )}
                      </td>

                      {/* Sales Velocity */}
                      <td className="py-3.5 px-3 text-right text-slate-600 dark:text-slate-300">
                        <span className="font-mono font-semibold">{p.sales_velocity}</span>{' '}
                        <span className="text-[10px] text-slate-400">/day</span>
                      </td>

                      {/* Stock Status */}
                      <td className="py-3.5 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${getStatusBadge(
                            p.stock_status
                          )}`}
                        >
                          {p.stock_status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProductId(p.id);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-500">
                      <p className="text-sm font-semibold">No products match the selected filter criteria.</p>
                      <button
                        onClick={resetFilters}
                        className="mt-2 text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          {sortedProducts.length > pageSize && (
            <div className="p-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <span>
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, sortedProducts.length)} of {sortedProducts.length} products
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2 font-bold">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= PRODUCT DETAILS MODAL (CENTERED FLOATING PANEL) ================= */}
        <ProductDetailsModal
          productId={selectedProductId}
          isOpen={!!selectedProductId}
          onClose={() => setSelectedProductId(null)}
          onReplenish={(p) => {
            setReplenishProduct({
              ...p,
              storeStock: p.store_stock,
              warehouseStock: p.warehouse_stock,
            });
          }}
          onReplenished={(p, qty) => {
            setProducts((prev) =>
              prev.map((item) =>
                item.id === p.id
                  ? {
                      ...item,
                      store_stock: (item.store_stock || 0) + qty,
                      warehouse_stock: Math.max(0, (item.warehouse_stock || 0) - qty),
                      total_stock: (item.store_stock || 0) + (item.warehouse_stock || 0),
                    }
                  : item
              )
            );
          }}
        />

        {/* ================= REPLENISHMENT MODAL ================= */}
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
            onProductCreated={(newProd) => {
              setProducts([newProd, ...products]);
              setShowAddModal(false);
            }}
          />
        )}
      </div>
    </PageContainer>
  );
}
