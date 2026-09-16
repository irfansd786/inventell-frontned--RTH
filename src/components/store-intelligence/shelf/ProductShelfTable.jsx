import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  AlertTriangle,
  CheckCircle,
  Package,
  Layers,
  ArrowRight,
  Warehouse,
} from 'lucide-react';

const RISK_BADGES = {
  CRITICAL: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  HIGH: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  MEDIUM: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
};

export default function ProductShelfTable({
  products = [],
  onRestock,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [restockedIds, setRestockedIds] = useState({});

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk =
        selectedRisk === 'ALL' || p.risk === selectedRisk;
      return matchesSearch && matchesRisk;
    });
  }, [products, searchTerm, selectedRisk]);

  const handleRestockClick = (item) => {
    setRestockedIds((prev) => ({ ...prev, [item.id]: true }));
    onRestock?.(item);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
      {/* Table Header Controls */}
      <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/80">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-slate-100">
            Product Shelf Inventory & Planogram Facings
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Real-time visual stock count vs central warehouse availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, Product, Bay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 sm:w-56"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={selectedRisk}
            onChange={(e) => setSelectedRisk(e.target.value)}
            className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Voids</option>
            <option value="HIGH">High Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Optimal (Low Risk)</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/40 dark:bg-slate-900/40">
              <th className="py-2.5 px-4">Product & SKU</th>
              <th className="py-2.5 px-3">Shelf Location</th>
              <th className="py-2.5 px-3">Facing / Capacity</th>
              <th className="py-2.5 px-3 text-center">Zone Visits</th>
              <th className="py-2.5 px-3 text-center">Whse Buffer</th>
              <th className="py-2.5 px-3 text-center">Risk Level</th>
              <th className="py-2.5 px-4 text-right">Replenishment Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="py-6 text-center text-slate-400 text-xs"
                >
                  No shelf facings matching filter criteria.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isCritical = item.risk === 'CRITICAL';
                const isRestocked = !!restockedIds[item.id];

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                      isCritical ? 'bg-red-50/20 dark:bg-red-950/10' : ''
                    }`}
                  >
                    {/* Product & SKU */}
                    <td className="py-2.5 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        {item.sku} • {item.category}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                      {item.location}
                    </td>

                    {/* Facing Count & Bar */}
                    <td className="py-2.5 px-3 min-w-[140px]">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span
                          className={`font-mono font-semibold ${
                            item.facingCount === 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {item.facingCount} / {item.maxFacing} units
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.stockPct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            item.stockPct === 0
                              ? 'bg-red-500'
                              : item.stockPct < 35
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(item.stockPct, 4)}%` }}
                        />
                      </div>
                    </td>

                    {/* Interactions */}
                    <td className="py-2.5 px-3 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.interactions != null ? `${item.interactions} visits` : 'Unavailable'}
                    </td>

                    {/* Whse Buffer */}
                    <td className="py-2.5 px-3 text-center font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                      {item.warehouseStock} units
                    </td>

                    {/* Risk Badge */}
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border tracking-wide ${
                          RISK_BADGES[item.risk] || RISK_BADGES.LOW
                        }`}
                      >
                        {item.risk}
                      </span>
                    </td>

                    {/* Replenishment Action */}
                    <td className="py-2.5 px-4 text-right">
                      {item.facingCount < item.maxFacing ? (
                        <button
                          type="button"
                          disabled={isRestocked}
                          onClick={() => handleRestockClick(item)}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded transition shadow-2xs ${
                            isRestocked
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 cursor-default'
                              : isCritical
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {isRestocked ? (
                            <span>Runner Dispatched</span>
                          ) : (
                            <>
                              <Warehouse className="w-3 h-3" />
                              <span>Restock</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Facing Full
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
