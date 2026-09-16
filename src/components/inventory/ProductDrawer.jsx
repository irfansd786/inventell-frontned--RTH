import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Package,
  IndianRupee,
  TrendingUp,
  Warehouse,
  Store,
  VideoOff,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  BarChart2,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { getProductDetails } from '../../services/productService';
import { formatINR } from '../../utils/formatters';
import { enrichProductData } from '../../utils/productIntelligence';
import BarcodeVisual from '../common/BarcodeVisual';

export default function ProductDrawer({ productId, isOpen, onClose, onReplenish }) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      getProductDetails(productId)
        .then((data) => {
          setProduct(enrichProductData(data));
        })
        .catch(() => {
          setProduct(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setProduct(null);
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const handleCopySku = () => {
    if (product?.sku) {
      navigator.clipboard.writeText(product.sku);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const marginPct =
    product && product.price > 0 && product.cost_price > 0
      ? Math.round(((product.price - product.cost_price) / product.price) * 100)
      : null;

  const stockRatio =
    product && product.reorder_level > 0
      ? Math.min(Math.round((product.store_stock / product.reorder_level) * 100), 200)
      : 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md sm:max-w-lg bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                  {product?.category || 'Product'}
                </span>
                {product?.dataset_source && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Source: {product.dataset_source}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                {product?.name || 'Product Details'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                SKU: {product?.sku || '—'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-slate-500 font-semibold">Loading product intelligence...</p>
              </div>
            ) : !product ? (
              <div className="py-20 text-center text-slate-500">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p>Could not load product details.</p>
              </div>
            ) : (
              <>
                {/* BARCODE SECTION — Truthful to dataset */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        BARCODE
                      </span>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                        Not available in dataset
                      </p>
                    </div>
                    <button
                      onClick={handleCopySku}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                      title="Copy item SKU to clipboard"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                      {copied ? 'SKU Copied' : 'Copy SKU'}
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
                    The source M5 Forecasting and Retail Inventory datasets do not contain universal UPC/EAN barcodes. The product is indexed in the retail catalog by Item ID / SKU (<strong>{product.sku}</strong>).
                  </p>
                </div>

                {/* PRICING & MARGIN */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Selling Price</span>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5 font-mono">
                      {formatINR(product.price, 2)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Price</span>
                    <p className="text-base font-extrabold text-slate-700 dark:text-slate-300 mt-0.5 font-mono">
                      {formatINR(product.cost_price, 2)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Margin</span>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      {marginPct !== null ? `${marginPct}%` : '—'}
                    </p>
                  </div>
                </div>

                {/* INVENTORY HEALTH & SPLIT */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Warehouse className="w-3.5 h-3.5 text-emerald-600" />
                      INVENTORY & STOCK HEALTH
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        product.stock_status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200'
                          : product.stock_status === 'Low Stock'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200'
                          : product.stock_status === 'Critical'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {product.stock_status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Store className="w-3 h-3 text-slate-500" /> Store Shelf Stock
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {product.store_stock} <span className="text-xs font-normal text-slate-500">units</span>
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                        <Warehouse className="w-3 h-3 text-slate-500" /> Central Warehouse
                      </span>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                        {product.warehouse_stock} <span className="text-xs font-normal text-slate-500">units</span>
                      </p>
                    </div>
                  </div>

                  {/* Stock health progress bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span>Store Stock vs Reorder Level ({product.reorder_level} pcs)</span>
                      <span className="font-bold">{stockRatio}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          product.stock_status === 'Healthy'
                            ? 'bg-emerald-500'
                            : product.stock_status === 'Low Stock'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(stockRatio, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* SALES PERFORMANCE & VELOCITY */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Units Sold</span>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                      {product.units_sold.toLocaleString()} pcs
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                    <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 font-mono">
                      {formatINR(product.revenue, 2)}
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Sales Velocity</span>
                    <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                      {product.sales_velocity} <span className="text-[10px] font-normal">pcs/day</span>
                    </p>
                  </div>
                </div>

                {/* HISTORICAL SALES TREND CHART */}
                <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    HISTORICAL SALES TREND
                  </h3>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Actual transaction units for this product over time
                  </p>

                  <div className="h-44 w-full">
                    {product.sales_trend && product.sales_trend.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={product.sales_trend} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="productTrendGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0f172a',
                              borderColor: '#1e293b',
                              borderRadius: '8px',
                              color: '#fff',
                              fontSize: '11px',
                            }}
                            formatter={(v, name) => [
                              name === 'revenue' ? formatINR(v, 2) : `${v} pcs`,
                              name === 'revenue' ? 'Revenue' : 'Units',
                            ]}
                          />
                          <Area type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2} fill="url(#productTrendGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">
                        No historical checkout records found for this item.
                      </div>
                    )}
                  </div>
                </div>

                {/* CUSTOMER ACTIVITY / INTEREST SECTION */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <VideoOff className="w-3.5 h-3.5 text-slate-400" />
                    CUSTOMER ACTIVITY
                  </h3>
                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-700 dark:text-slate-200">
                      Customer activity mapping unavailable.
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Product-to-CCTV spatial zone telemetry requires physical shelf coordinate mapping. To configure shelf cameras, visit Spatial Intelligence.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                if (product && onReplenish) {
                  onReplenish(product);
                  onClose();
                }
              }}
              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Warehouse className="w-3.5 h-3.5" />
              Quick Replenish
            </button>
            <button
              onClick={onClose}
              className="py-2 px-4 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
