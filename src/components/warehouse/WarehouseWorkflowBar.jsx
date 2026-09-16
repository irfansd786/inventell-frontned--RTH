import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Layers, Boxes, Package, Truck, ArrowRight, Check } from 'lucide-react';
import { useProductSummary } from '../../hooks/useProductSummary';

const STAGES = [
  { id: 'orders', label: 'Orders', path: '/orders', icon: ShoppingCart },
  { id: 'allocation', label: 'Allocation', path: '/allocation', icon: Layers },
  { id: 'picking', label: 'Picking', path: '/picking', icon: Boxes },
  { id: 'packing', label: 'Packing', path: '/packing', icon: Package },
  { id: 'dispatch', label: 'Dispatch', path: '/dispatch', icon: Truck },
];

export default function WarehouseWorkflowBar({ activeStage = 'orders', orders = [] }) {
  const activeIndex = STAGES.findIndex((s) => s.id === activeStage);
  const { totalProducts, totalUnits, loading: summaryLoading } = useProductSummary();

  // Compute dynamic active count for each stage
  const stageCounts = useMemo(() => {
    const list = Array.isArray(orders) ? orders : [];
    
    // 1. Orders: Active orders needing fulfillment
    const ordersCount = list.filter((o) => !['Cancelled', 'Delivered'].includes(o.status)).length;
    
    // 2. Allocation: Orders pending or partially allocated
    const allocationCount = list.filter((o) =>
      ['Pending', 'Draft', 'Confirmed', 'Partially Allocated', 'Shortfall'].includes(o.status)
    ).length;

    // 3. Picking: Orders allocated or in picking
    const pickingCount = list.filter((o) =>
      ['Allocated', 'Ready for Picking', 'Picking', 'Partially Picked'].includes(o.status)
    ).length;

    // 4. Packing: Orders picked or in packing
    const packingCount = list.filter((o) =>
      ['Picked', 'Ready for Packing', 'Packing', 'Partially Packed'].includes(o.status)
    ).length;

    // 5. Dispatch: Orders packed and ready for dock release
    const dispatchCount = list.filter((o) =>
      ['Packed', 'Ready for Dispatch', 'Dispatched'].includes(o.status)
    ).length;

    return {
      orders: ordersCount,
      allocation: allocationCount,
      picking: pickingCount,
      packing: packingCount,
      dispatch: dispatchCount,
    };
  }, [orders]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 shadow-xs space-y-2.5">
      {/* ================= GLOBAL OPERATIONAL CONTEXT STRIP ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-lg text-xs">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <Boxes className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Warehouse Operations Master</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Products</span>
            <span
              id="warehouse-product-count"
              className="font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs shadow-2xs"
            >
              {summaryLoading || totalProducts === null ? '—' : totalProducts}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Orders</span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs shadow-2xs">
              {orders.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Units</span>
            <span className="font-bold text-slate-900 dark:text-white px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-xs shadow-2xs">
              {summaryLoading || totalUnits === null ? '—' : totalUnits.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-1 overflow-x-auto">
        {STAGES.map((stage, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const isUpcoming = idx > activeIndex;
          const Icon = stage.icon;
          const count = stageCounts[stage.id] ?? 0;

          return (
            <React.Fragment key={stage.id}>
              <Link
                to={stage.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isCurrent
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title={`Navigate to ${stage.label}`}
              >
                {/* Step indicator symbol */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isCurrent
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                      : isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : isCurrent ? '●' : idx + 1}
                </div>

                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 opacity-80" />
                  <span className="uppercase font-bold tracking-wider text-[11px]">
                    {stage.label}
                  </span>
                </div>

                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${
                      isCurrent
                        ? 'bg-slate-800 dark:bg-slate-200 text-slate-200 dark:text-slate-800'
                        : isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Link>

              {idx < STAGES.length - 1 && (
                <ArrowRight
                  className={`w-3.5 h-3.5 shrink-0 ${
                    idx < activeIndex
                      ? 'text-emerald-500 dark:text-emerald-400'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
