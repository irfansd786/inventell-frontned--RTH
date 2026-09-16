import React from 'react';
import {
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Copy,
  AlertTriangle,
  Boxes,
} from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import BarcodeVisual from '../common/BarcodeVisual';
import { useToast } from '../../context/ToastContext';

export default function InventoryTable({
  products = [],
  onSelectProduct,
  onReplenish,
  currentPage = 1,
  onPageChange,
  pageSize = 10,
}) {
  const { toast } = useToast();
  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = products.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Healthy':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50';
      case 'Low Stock':
      case 'Low':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50';
      case 'Critical':
        return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200/50';
      case 'Out of Stock':
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
      {/* Table Header Summary Bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Product Catalog & Master Inventory</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Combined product catalog, multi-location stock levels and real sales velocities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} matching filter
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">SKU / Item ID</th>
              <th className="py-3 px-3">Barcode</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3 text-right">Price</th>
              <th className="py-3 px-3 text-right">Current Stock</th>
              <th className="py-3 px-3 text-right">Store Stock</th>
              <th className="py-3 px-3 text-right">Warehouse</th>
              <th className="py-3 px-3 text-right">Units Sold</th>
              <th className="py-3 px-3 text-right">Revenue</th>
              <th className="py-3 px-3 text-right">Velocity</th>
              <th className="py-3 px-3 text-center">Stock Status</th>
              <th className="py-3 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {paginatedProducts.length > 0 ? (
              paginatedProducts.map((item) => {
                const isCritical = item.status === 'Critical' || item.status === 'Out of Stock';
                const isLow = item.status === 'Low Stock' || item.status === 'Low';
                const barcodeVal = item.barcode || '8900000000000';

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectProduct && onSelectProduct(item)}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    {/* 1. PRODUCT */}
                    <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex flex-col">
                        <span className="font-bold hover:text-blue-600 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          {item.department ? `${item.department}` : 'Retail Catalog'}
                        </span>
                      </div>
                    </td>

                    {/* 2. SKU / ITEM ID */}
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {item.sku}
                    </td>

                    {/* 3. BARCODE (Visual Bars + 890 Number + Copy) */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex flex-col items-start gap-1">
                        <div className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">
                          <BarcodeVisual
                            value={barcodeVal}
                            height={18}
                            showDigits={false}
                            className="scale-95 origin-left"
                          />
                        </div>
                        <div className="flex items-center gap-1">
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

                    {/* 4. CATEGORY */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {item.category}
                      </span>
                    </td>

                    {/* 5. PRICE */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatINR(item.price, 2)}
                    </td>

                    {/* 6. CURRENT STOCK (Total) */}
                    <td className="py-3 px-3 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      {item.totalStock?.toLocaleString('en-IN')} pcs
                    </td>

                    {/* 7. STORE STOCK */}
                    <td className="py-3 px-3 text-right font-mono">
                      <span
                        className={`font-bold ${
                          isCritical
                            ? 'text-red-600 dark:text-red-400'
                            : isLow
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {item.storeStock?.toLocaleString('en-IN')} pcs
                      </span>
                    </td>

                    {/* 8. WAREHOUSE STOCK */}
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      {(item.warehouseStock || 0) > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {item.warehouseStock?.toLocaleString('en-IN')} pcs
                        </span>
                      ) : (
                        <span className="text-red-500 text-[10px]">Depleted</span>
                      )}
                    </td>

                    {/* 9. UNITS SOLD */}
                    <td className="py-3 px-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {item.hasDemandData ? (
                        `${Number(item.unitsSold || 0).toLocaleString('en-IN')} pcs`
                      ) : (
                        <span className="text-slate-400 text-[10px]">0 pcs</span>
                      )}
                    </td>

                    {/* 10. REVENUE */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(item.revenue || 0, 2)}
                    </td>

                    {/* 11. SALES VELOCITY */}
                    <td className="py-3 px-3 text-right font-mono">
                      {item.salesVelocity !== null && item.salesVelocity !== undefined ? (
                        <span className="text-slate-800 dark:text-slate-200 font-semibold">
                          {item.salesVelocity} /d
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Demand n/a</span>
                      )}
                    </td>

                    {/* 12. STOCK STATUS */}
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>

                    {/* 13. ACTION */}
                    <td className="py-3 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectProduct && onSelectProduct(item)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 transition-colors cursor-pointer"
                          title="View Intelligence Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onReplenish && onReplenish(item)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer shadow-xs"
                          title="Replenish from Central Warehouse"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Replenish
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={13} className="py-12 text-center text-slate-500">
                  <div className="max-w-sm mx-auto space-y-2">
                    <Boxes className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No products match the selected filters
                    </p>
                    <p className="text-xs text-slate-400">
                      Try relaxing your search terms or reset the category, stock status, and location filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {products.length > pageSize && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(startIndex + pageSize, products.length)}
            </span>{' '}
            of <span className="font-semibold text-slate-800 dark:text-slate-200">{products.length}</span> products
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
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
              onClick={() => onPageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
