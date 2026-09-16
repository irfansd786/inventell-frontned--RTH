import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { Package, Award } from 'lucide-react';

export default function TopProducts({ products }) {
  return (
    <Card title="Top Selling Products" subtitle="Best performing items today">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-2.5 font-semibold">Rank & Product</th>
              <th className="pb-2.5 font-semibold">Category</th>
              <th className="pb-2.5 font-semibold text-center">Qty Sold</th>
              <th className="pb-2.5 font-semibold text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {products.map((item, index) => (
              <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 font-semibold text-slate-800 flex items-center gap-2.5">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      index === 0
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : index === 1
                        ? 'bg-slate-200 text-slate-700'
                        : index === 2
                        ? 'bg-amber-700/20 text-amber-900'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span>{item.name}</span>
                </td>
                <td className="py-3">
                  <Badge variant="neutral" size="sm">
                    {item.category}
                  </Badge>
                </td>
                <td className="py-3 text-center font-bold text-slate-900">{item.qtySold}</td>
                <td className="py-3 text-right font-extrabold text-emerald-600">{item.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
