import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Package, AlertTriangle, XCircle, DollarSign } from 'lucide-react';

export default function InventorySummary({ lowStock }) {
  return (
    <Card title="Inventory Summary" subtitle="Stock health & replenishment priorities">
      {/* Overview Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Package className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Total Products</span>
          </div>
          <p className="text-lg font-bold text-slate-900">512</p>
        </div>

        <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-amber-700 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Low Stock</span>
          </div>
          <p className="text-lg font-bold text-amber-700">24</p>
        </div>

        <div className="p-3 bg-red-50/60 border border-red-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-red-700 mb-1">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Out of Stock</span>
          </div>
          <p className="text-lg font-bold text-red-700">8</p>
        </div>

        <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl">
          <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-[11px] font-medium">Inventory Value</span>
          </div>
          <p className="text-lg font-bold text-emerald-700">₹18,75,000</p>
        </div>
      </div>

      {/* Low Stock Items Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-2 font-semibold">Product</th>
              <th className="pb-2 font-semibold">Category</th>
              <th className="pb-2 font-semibold text-center">Current Stock</th>
              <th className="pb-2 font-semibold text-right">Reorder Level</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {lowStock.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-2.5 font-semibold text-slate-800">{item.product}</td>
                <td className="py-2.5">
                  <Badge variant="neutral" size="sm">
                    {item.category}
                  </Badge>
                </td>
                <td className="py-2.5 text-center font-bold text-red-600">
                  <span className="px-2 py-0.5 bg-red-50 rounded border border-red-200">
                    {item.stock}
                  </span>
                </td>
                <td className="py-2.5 text-right font-medium text-slate-600">{item.reorderLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
