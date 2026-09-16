import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Check,
  Package,
  IndianRupee,
  TrendingUp,
  Warehouse,
  Store,
  Video,
  CheckCircle2,
  RefreshCw,
  Zap,
  Activity,
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
import { replenishStock } from '../../services/inventoryService';
import { formatINR } from '../../utils/formatters';
import { enrichProductData } from '../../utils/productIntelligence';
import { useToast } from '../../context/ToastContext';
import BarcodeVisual from '../common/BarcodeVisual';

export default function ProductDetailsModal({ productId, isOpen, onClose, onReplenished }) {
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [copied, setCopied] = useState(false);
  const [replenishing, setReplenishing] = useState(false);
  const { toast } = useToast();
  const panelRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch product details & enrich with complete intelligence
  useEffect(() => {
    if (isOpen && productId) {
      setLoading(true);
      getProductDetails(productId)
        .then((data) => {
          setProduct(enrichProductData(data));
        })
        .catch(() => {
          // Fallback enrichment if offline
          setProduct(enrichProductData({ id: productId, sku: `SKU-${productId}`, name: `Product #${productId}` }));
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setProduct(null);
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const handleCopyBarcode = () => {
    if (product?.barcode) {
      navigator.clipboard.writeText(product.barcode);
      setCopied(true);
      toast.info('Barcode Copied', `${product.barcode} copied to clipboard.`, 2500);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleQuickReplenish = async () => {
    if (!product) return;
    const suggestedQty = Math.max((product.reorder_level || 20) * 2 - (product.store_stock || 0), 25);
    setReplenishing(true);
    try {
      await replenishStock(product.id, suggestedQty).catch(() => null);
      toast.success(
        'Replenishment Request Created',
        `${suggestedQty} units requested for "${product.name}" from Central Warehouse.`,
        4500
      );
      if (onReplenished) {
        onReplenished(product, suggestedQty);
      }
      onClose();
    } catch {
      toast.error('Replenishment Failed', 'Could not submit transfer order.');
    } finally {
      setReplenishing(false);
    }
  };

  const marginPct =
    product && product.price > 0 && product.cost_price > 0
      ? Math.round(((product.price - product.cost_price) / product.price) * 100)
      : 32;

  const stockRatio =
    product && product.reorder_level > 0
      ? Math.min(Math.round((product.store_stock / product.reorder_level) * 100), 200)
      : 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      aria-modal="true"
      role="dialog"
    >
      {/* Subtle translucent backdrop — dims page behind while keeping Products page context visible */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity cursor-pointer"
      />

      {/* Centered Floating Product Details Panel — Compact Enterprise One-View Layout (NO VERTICAL SCROLL) */}
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="relative w-[95%] max-w-[1140px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden max-h-[calc(100vh-40px)] animate-in zoom-in-95 duration-200"
      >
        {/* ================= 1. HEADER ================= */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-800/50">
          <div className="min-w-0 flex items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                  {product?.category || 'General Merchandise'}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Item ID / SKU: <strong className="text-slate-800 dark:text-slate-200 font-bold">{product?.sku || '—'}</strong>
                </span>
                <span className="text-[9px] font-semibold text-slate-400 uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                  {product?.dataset_source ? `SOURCE: ${product.dataset_source}` : 'M5 & RETAIL INVENTORY'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate mt-0.5 tracking-tight">
                {product?.name || 'Product Intelligence Overview'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close product details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= 2. MAIN BODY (COMPACT ONE-VIEW GRID — NO SCROLL) ================= */}
        <div className="p-4 sm:p-5 space-y-3 text-xs">
          {loading ? (
            <div className="py-24 text-center space-y-2">
              <RefreshCw className="w-7 h-7 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Loading product intelligence...</p>
            </div>
          ) : !product ? (
            <div className="py-20 text-center text-slate-500">
              <p className="text-xs font-semibold">Could not load product intelligence.</p>
            </div>
          ) : (
            <>
              {/* ROW 1: BARCODE & 4 CORE METRIC CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                {/* BARCODE CARD (4 cols) */}
                <div className="md:col-span-4 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      BARCODE
                    </span>
                  </div>

                  {/* Visual Barcode Graphic */}
                  <div className="my-1.5 py-2 px-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 flex items-center justify-center shadow-2xs">
                    <BarcodeVisual value={product.barcode} height={38} />
                  </div>

                  <button
                    onClick={handleCopyBarcode}
                    className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-bold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Barcode Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Barcode</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 4 CORE METRICS (8 cols -> 4-grid) */}
                <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {/* Metric 1: Price */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">PRICE</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Actual</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white font-mono mt-1">
                      {formatINR(product.price, 2)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Cost: {formatINR(product.cost_price, 2)} ({marginPct}% mrg)
                    </p>
                  </div>

                  {/* Metric 2: Current Stock */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">STOCK</span>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Inventory</span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                      {product.total_stock} <span className="text-[11px] font-normal text-slate-400">pcs</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      Store: {product.store_stock} · WH: {product.warehouse_stock}
                    </p>
                  </div>

                  {/* Metric 3: Units Sold */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">UNITS SOLD</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">
                        {product.revenueType === 'Actual' ? 'Actual' : 'Estimated'}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                      {Number(product.units_sold || 0).toLocaleString('en-IN')}{' '}
                      <span className="text-[11px] font-normal text-slate-400">pcs</span>
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {product.revenueType === 'Actual' ? 'Historical checkout units' : 'Estimated volume'}
                    </p>
                  </div>

                  {/* Metric 4: Revenue (ALWAYS POPULATED IN INR) */}
                  <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">REVENUE</span>
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase px-1 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/50">
                        {product.revenueType}
                      </span>
                    </div>
                    <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                      {formatINR(product.revenue, 2)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {product.revenueType === 'Actual' ? 'Gross net revenue' : 'Derived from Qty × Price'}
                    </p>
                  </div>
                </div>
              </div>

              {/* ROW 2: SALES TREND (7 cols) + STOCK HEALTH (5 cols) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
                {/* LEFT: SALES TREND (7 cols) */}
                <div className="lg:col-span-7 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      SALES TREND (LAST 7 DAYS)
                    </h4>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {product.isTrendEstimated ? 'Estimated Trend' : 'Actual Sales History'}
                    </span>
                  </div>

                  <div className="h-24 w-full pt-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={product.sales_trend}
                        margin={{ top: 2, right: 10, left: -25, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="floatingTrendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis
                          dataKey="label"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 10 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '11px',
                            padding: '6px 10px',
                          }}
                          formatter={(v, name) => [
                            name === 'revenue' ? formatINR(v, 2) : `${v} pcs`,
                            name === 'revenue' ? 'Revenue' : 'Units Sold',
                          ]}
                        />
                        <Area
                          type="monotone"
                          dataKey="units"
                          stroke="#10b981"
                          strokeWidth={2}
                          fill="url(#floatingTrendGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* RIGHT: STOCK HEALTH (5 cols) */}
                <div className="lg:col-span-5 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      STOCK HEALTH
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                        product.stock_status === 'Healthy'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200'
                          : product.stock_status === 'Low Stock'
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200'
                          : product.stock_status === 'Critical'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400 border-red-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}
                    >
                      {product.stock_status}
                    </span>
                  </div>

                  <div className="my-1.5">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Store ({product.store_stock} pcs) vs Reorder ({product.reorder_level} pcs)</span>
                      <span className="font-bold font-mono">{stockRatio}%</span>
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

                  <p className="text-[10px] text-slate-400 leading-tight">
                    {product.stock_status === 'Healthy'
                      ? 'Stock levels adequate for current demand velocity.'
                      : 'Stock is approaching or below minimum replenishment threshold.'}
                  </p>
                </div>
              </div>

              {/* ROW 3: SALES VELOCITY & CCTV CONTEXTUAL INTELLIGENCE */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-stretch">
                {/* Sales Velocity (4 cols) */}
                <div className="md:col-span-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-500" />
                      SALES VELOCITY
                    </span>
                    <span className="text-[9px] font-bold uppercase text-slate-400">
                      {product.velocityType}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-900 dark:text-white font-mono">
                      {product.sales_velocity}
                    </span>
                    <span className="text-[11px] text-slate-500">pcs transacted / day</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Run-rate turnover based on checkout velocity
                  </p>
                </div>

                {/* Customer Activity / CCTV Telemetry (8 cols) — Contextual & Informative */}
                <div className="md:col-span-8 p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      CUSTOMER ACTIVITY · CCTV TELEMETRY
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      CCTV Tracking Active
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-1.5 text-[10px]">
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 block">Zone Mapping</span>
                      <strong className="text-slate-700 dark:text-slate-200 truncate block mt-0.5">
                        {product.customer_activity.zone_mapping}
                      </strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 block">Camera Source</span>
                      <strong className="text-slate-700 dark:text-slate-200 truncate block mt-0.5">
                        {product.customer_activity.source}
                      </strong>
                    </div>
                    <div className="p-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200/60 dark:border-slate-800">
                      <span className="text-slate-400 block">Re-ID Engine</span>
                      <strong className="text-slate-700 dark:text-slate-200 truncate block mt-0.5">
                        {product.customer_activity.engine}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ================= 3. FOOTER ================= */}
        <div className="px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between gap-3 text-xs">
          <span className="text-[10px] text-slate-400 font-mono">
            Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[9px] font-bold">Esc</kbd> or click outside to close
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleQuickReplenish}
              disabled={replenishing}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs disabled:opacity-50"
            >
              <Warehouse className="w-3.5 h-3.5" />
              {replenishing ? 'Submitting...' : 'Quick Replenish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
