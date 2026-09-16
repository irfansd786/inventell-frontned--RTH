import React from 'react';
import Card from '../common/Card';
import { DollarSign, ShoppingBag, ShoppingCart, TrendingUp, RefreshCw, CreditCard } from 'lucide-react';

export default function SalesKPI({ kpis = {} }) {
  const cards = [
    { label: "Today's Revenue", value: kpis.todayRevenue ?? '—', change: kpis.revenueChange ?? '', icon: DollarSign, color: 'emerald' },
    { label: 'Transactions', value: kpis.transactionsCount ?? '—', change: kpis.transactionsChange ?? '', icon: ShoppingBag, color: 'emerald' },
    { label: 'Avg Order Value', value: kpis.avgOrderValue ?? '—', change: kpis.avgOrderChange ?? '', icon: ShoppingCart, color: 'indigo' },
    { label: 'Items Sold', value: kpis.itemsSold ?? '—', change: kpis.itemsSoldChange ?? '', icon: TrendingUp, color: 'amber' },
    { label: 'Refunds', value: kpis.refunds ?? '—', change: '1.7% of sales', icon: RefreshCw, color: 'red' },
    { label: 'Net Revenue', value: kpis.netRevenue ?? '—', change: 'After refunds', icon: CreditCard, color: 'emerald' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase">{c.label}</span>
              <div className="p-1.5 bg-slate-100 rounded-md text-slate-700">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-extrabold text-slate-900 tracking-tight">{c.value}</p>
            <span className="text-[10px] font-semibold text-emerald-600 mt-1 block">{c.change}</span>
          </div>
        );
      })}
    </div>
  );
}
