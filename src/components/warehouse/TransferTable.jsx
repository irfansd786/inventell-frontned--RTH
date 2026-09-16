import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function TransferTable({ transfers = [] }) {
  return (
    <Card title="Stock Transfer Log" subtitle="Inventory movement between Central Warehouse and Main Street Store">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Transfer ID</th>
              <th className="pb-3 font-semibold">Product Name</th>
              <th className="pb-3 font-semibold text-center">SKU</th>
              <th className="pb-3 font-semibold text-center">Quantity</th>
              <th className="pb-3 font-semibold">Origin → Destination</th>
                <th className="pb-3 font-semibold text-center">Date</th>
                <th className="pb-3 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(transfers || []).map((tr) => (
              <tr key={tr.dbId || tr.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 font-mono font-bold text-slate-900">{tr.id}</td>
                <td className="py-3 font-bold text-slate-800">{tr.product}</td>
                <td className="py-3 text-center font-mono text-slate-500 text-[11px]">{tr.sku}</td>
                <td className="py-3 text-center font-black text-slate-900">{tr.quantity} units</td>
                <td className="py-3 font-medium text-slate-600">{tr.from} → {tr.to}</td>
                <td className="py-3 text-center font-mono text-[11px] text-slate-500">{tr.date || '—'}</td>
                <td className="py-3 text-right">
                  <Badge
                    variant={
                      tr.status === 'Completed'
                        ? 'emerald'
                        : tr.status === 'In Transit'
                        ? 'emerald'
                        : 'amber'
                    }
                    size="sm"
                    dot
                  >
                    {tr.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
