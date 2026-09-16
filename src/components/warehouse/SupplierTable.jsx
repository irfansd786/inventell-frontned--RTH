import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { Eye } from 'lucide-react';

export default function SupplierTable({ suppliers = [], onSelectSupplier }) {
  return (
    <Card title="Active Supplier Directory" subtitle="Vendor performance and procurement lead times">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Supplier Name</th>
              <th className="pb-3 font-semibold">Contact</th>
              <th className="pb-3 font-semibold text-center">Category</th>
              <th className="pb-3 font-semibold text-center">Products Supplied</th>
              <th className="pb-3 font-semibold text-center">Total Orders</th>
              <th className="pb-3 font-semibold text-center">On-Time %</th>
              <th className="pb-3 font-semibold text-center">Lead Time</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(suppliers || []).map((sup) => (
              <tr key={sup.id} className="hover:bg-slate-50 transition-colors">
                <td className="py-3 font-bold text-slate-900">{sup.name}</td>
                <td className="py-3 text-slate-600 font-medium">{sup.contact}</td>
                <td className="py-3 text-center">
                  <Badge variant="neutral" size="sm">{sup.category}</Badge>
                </td>
                <td className="py-3 text-center font-bold text-slate-800">{sup.productsCount} products</td>
                <td className="py-3 text-center font-semibold text-slate-800">{sup.totalOrders} orders</td>
                <td className="py-3 text-center font-bold text-emerald-600">{sup.onTimePercent}%</td>
                <td className="py-3 text-center text-slate-600 font-mono text-[11px]">{sup.avgLeadTime}</td>
                <td className="py-3 text-right">
                  <Button variant="outline" size="sm" icon={Eye} onClick={() => onSelectSupplier(sup)}>
                    View Supplier
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
