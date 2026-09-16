import React from 'react';
import Card from '../common/Card';
import { Warehouse, ArrowRight, CheckCircle2, Clock, Truck, Package, Layers, ShoppingCart } from 'lucide-react';

export default function WarehouseOverview({ data }) {
  const steps = [
    { label: 'Orders', count: data.pendingOrders, icon: ShoppingCart, status: '18 Pending' },
    { label: 'Allocation', count: data.ordersInProcess, icon: Layers, status: '12 Processing' },
    { label: 'Picking', count: 8, icon: Package, status: '8 Picking' },
    { label: 'Packing', count: data.readyToDispatch, icon: Warehouse, status: '6 Packed' },
    { label: 'Dispatch', count: data.dispatchedToday, icon: Truck, status: '8 Dispatched' },
  ];

  return (
    <Card
      title="Warehouse Overview"
      subtitle="Single central warehouse order fulfillment pipeline"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <p className="text-[11px] text-slate-500 font-medium">Pending Orders</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{data.pendingOrders}</p>
        </div>
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
          <p className="text-[11px] text-emerald-700 font-medium">In Process</p>
          <p className="text-lg font-bold text-emerald-950 mt-0.5">{data.ordersInProcess}</p>
        </div>
        <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
          <p className="text-[11px] text-amber-700 font-medium">Ready to Dispatch</p>
          <p className="text-lg font-bold text-amber-950 mt-0.5">{data.readyToDispatch}</p>
        </div>
        <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
          <p className="text-[11px] text-emerald-700 font-medium">Dispatched Today</p>
          <p className="text-lg font-bold text-emerald-950 mt-0.5">{data.dispatchedToday}</p>
        </div>
      </div>

      {/* Fulfillment Workflow Pipeline */}
      <div className="p-4 bg-slate-900 rounded-xl text-white">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Fulfillment Pipeline
        </h4>
        <div className="grid grid-cols-5 gap-2 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center relative z-10">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-2 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white">{step.label}</span>
                <span className="text-[10px] text-slate-400 mt-0.5">{step.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
