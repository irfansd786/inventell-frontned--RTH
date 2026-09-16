import React from 'react';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function ShelfTable({ shelves = [], onSelectShelf }) {
  return (
    <Card title="Shelf Inventory & Availability" subtitle="Click any row to inspect shelf-vs-warehouse correlation">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="pb-3 font-semibold">Shelf</th>
              <th className="pb-3 font-semibold">Aisle / Zone</th>
              <th className="pb-3 font-semibold">Product Name</th>
              <th className="pb-3 font-semibold text-center">Shelf Status</th>
              <th className="pb-3 font-semibold text-center">Shelf Stock</th>
              <th className="pb-3 font-semibold text-center">Reorder Level</th>
              <th className="pb-3 font-semibold text-center">Warehouse</th>
              <th className="pb-3 font-semibold text-right">Last Checked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {(shelves || []).map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectShelf && onSelectShelf(item)}
                className="hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <td className="py-3 font-mono font-bold text-slate-900">{item.code || item.sku || item.id}</td>
                <td className="py-3">
                  <span className="font-semibold text-slate-800">{item.aisle || item.category || '—'}</span>
                  <span className="text-[10px] text-slate-400 block">{item.zone || ''}</span>
                </td>
                <td className="py-3 font-bold text-slate-800">{item.product || item.productName || item.name || '—'}</td>
                <td className="py-3 text-center">
                  <Badge
                    variant={
                      (item.shelfStatus || item.status) === 'Healthy'
                        ? 'emerald'
                        : (item.shelfStatus || item.status) === 'Low'
                        ? 'amber'
                        : 'rose'
                    }
                    size="sm"
                    dot
                  >
                    {item.shelfStatus || item.status || '—'}
                  </Badge>
                </td>
                <td className="py-3 text-center font-bold text-slate-900">{item.stock ?? item.currentStock ?? '—'}</td>
                <td className="py-3 text-center text-slate-500 font-medium">{item.reorderLevel ?? '—'}</td>
                <td className="py-3 text-center font-bold text-emerald-600">{item.warehouseStock ?? '—'} units</td>
                <td className="py-3 text-right font-mono text-[11px] text-slate-400">{item.lastChecked || item.lastReplenished || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
