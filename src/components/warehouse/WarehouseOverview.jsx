import React from 'react';
import Card from '../common/Card';
import { Warehouse, Boxes, Package, Activity } from 'lucide-react';

export default function WarehouseOverview({ kpis = {} }) {
  return (
    <Card title="Central Warehouse Capacity & Health" subtitle="Single central warehouse storage metrics">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <span className="text-[11px] text-slate-500 font-medium">Total SKUs Stored</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{kpis.totalSkus}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <span className="text-[11px] text-slate-500 font-medium">Total Units</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{kpis.totalUnits}</p>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200/60 rounded-xl">
          <span className="text-[11px] text-emerald-800 font-medium">Warehouse Inventory Value</span>
          <p className="text-lg font-bold text-emerald-950 mt-0.5">{kpis.inventoryValue}</p>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl">
          <span className="text-[11px] text-slate-500 font-medium">Storage Location Load</span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{kpis.storageLocations}</p>
        </div>
      </div>

      <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2">
        <div className="flex justify-between text-xs font-semibold">
          <span>Warehouse Storage Capacity Used</span>
          <span className="text-emerald-400">{kpis.usedCapacity}% Occupied (32% Available)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${kpis.usedCapacity}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
