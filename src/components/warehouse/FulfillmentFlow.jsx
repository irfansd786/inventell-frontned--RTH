import React from 'react';
import Card from '../common/Card';
import { ShoppingCart, Layers, PackageCheck, Box, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FulfillmentFlow({ kpis = {} }) {
  const steps = [
    { label: 'Orders', count: kpis.pendingOrders ?? 18, icon: ShoppingCart, link: '/orders', color: 'emerald' },
    { label: 'Allocation', count: 18, icon: Layers, link: '/allocation', color: 'indigo' },
    { label: 'Picking', count: kpis.pickTasks ?? 12, icon: PackageCheck, link: '/picking', color: 'amber' },
    { label: 'Packing', count: 8, icon: Box, link: '/packing', color: 'blue' },
    { label: 'Dispatch', count: kpis.dispatchReady ?? 6, icon: Truck, link: '/dispatch', color: 'emerald' },
  ];

  return (
    <Card
      title="Warehouse Fulfillment Flow"
      subtitle="Click any stage to jump directly into operations management"
    >
      <div className="p-4 bg-slate-900 rounded-xl text-white">
        <div className="grid grid-cols-5 gap-2 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Link
                key={idx}
                to={step.link}
                className="flex flex-col items-center text-center group p-2 rounded-lg hover:bg-slate-800 transition-all cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 group-hover:scale-105 group-hover:border-emerald-500 transition-all mb-2 shadow-md">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">{step.count} active</span>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
