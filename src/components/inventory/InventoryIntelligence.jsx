import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PieChart as PieIcon, BarChart3, TrendingUp } from 'lucide-react';
import { formatINR } from '../../utils/formatters';

export default function InventoryIntelligence({ products = [] }) {
  const safeProducts = Array.isArray(products) ? products : [];
  const totalCount = safeProducts.length;

  // 1. Stock Distribution Data
  const stockDistribution = useMemo(() => {
    let healthy = 0;
    let low = 0;
    let critical = 0;
    let out = 0;

    safeProducts.forEach((p) => {
      const st = p.status;
      if (st === 'Healthy') healthy++;
      else if (st === 'Low Stock' || st === 'Low') low++;
      else if (st === 'Critical') critical++;
      else if (st === 'Out of Stock') out++;
      else healthy++;
    });

    return [
      { name: 'Healthy', value: healthy, color: '#10B981' },
      { name: 'Low Stock', value: low, color: '#F59E0B' },
      { name: 'Critical', value: critical, color: '#EF4444' },
      { name: 'Out of Stock', value: out, color: '#64748B' },
    ];
  }, [safeProducts]);

  // 2. Inventory by Category Data
  const categoryData = useMemo(() => {
    const map = {};
    safeProducts.forEach((p) => {
      const c = p.category || 'General';
      if (!map[c]) {
        map[c] = {
          name: c,
          storeStock: 0,
          warehouseStock: 0,
          totalStock: 0,
          value: 0,
        };
      }
      const sStock = p.storeStock ?? p.store_stock ?? 0;
      const wStock = p.warehouseStock ?? p.warehouse_stock ?? 0;
      map[c].storeStock += sStock;
      map[c].warehouseStock += wStock;
      map[c].totalStock += sStock + wStock;
      map[c].value += (sStock + wStock) * (p.price || 0);
    });

    return Object.values(map)
      .sort((a, b) => b.totalStock - a.totalStock)
      .slice(0, 7);
  }, [safeProducts]);

  // 3. Top Fast-Moving Products Data
  const topMovingData = useMemo(() => {
    return safeProducts
      .filter((p) => p.salesVelocity && p.salesVelocity > 0)
      .sort((a, b) => (b.salesVelocity || 0) - (a.salesVelocity || 0))
      .slice(0, 6)
      .map((p) => ({
        name: p.name.length > 16 ? p.name.slice(0, 14) + '...' : p.name,
        fullName: p.name,
        velocity: p.salesVelocity,
        storeStock: p.storeStock ?? p.store_stock ?? 0,
        daysOfStock: p.daysOfStock ?? p.days_of_stock ?? null,
      }));
  }, [safeProducts]);

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <span>Inventory Intelligence</span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              Live Filtered Analytics
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time intelligence across {totalCount} active filtered products
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Panel 1: Stock Distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
                Stock Distribution
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {totalCount} SKUs
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Availability health breakdown
            </p>

            <div className="relative h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                    isAnimationActive={false}
                  >
                    {stockDistribution.map((entry, idx) => (
                      <Cell key={'cell-' + idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val, name) => [val + ' products', name]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                  {totalCount}
                </span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
                  Products
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            {stockDistribution.map((b, idx) => {
              const pct = totalCount > 0 ? ((b.value / totalCount) * 100).toFixed(0) : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] truncate">
                      {b.name}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white text-[11px] ml-1 shrink-0 font-mono">
                    {b.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel 2: Inventory by Category */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                Inventory by Category
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Store vs WH
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Units across store and warehouse
            </p>

            <div className="h-44 w-full pt-1">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} margin={{ top: 8, right: 8, left: -24, bottom: 18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 9 }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                      formatter={(v, name) => [v?.toLocaleString('en-IN') + ' pcs', name]}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    <Bar dataKey="storeStock" name="Store Stock" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="warehouseStock" name="Warehouse" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No categories in current filter
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>{categoryData.length} Categories</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Total Units: {categoryData.reduce((acc, c) => acc + c.totalStock, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Panel 3: Top Moving Products */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                Top Moving Products
              </span>
              <span className="text-[11px] font-mono text-indigo-600 font-bold">
                M5 Velocity
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Fastest burn rate (/day) & store stock
            </p>

            <div className="h-44 w-full pt-1">
              {topMovingData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMovingData} margin={{ top: 8, right: 8, left: -24, bottom: 18 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 9 }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 9 }} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#1e293b',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                      formatter={(v, name) => {
                        if (name === 'Daily Velocity') return [v + ' pcs/day', name];
                        if (name === 'Store Stock') return [v + ' pcs', name];
                        return [v, name];
                      }}
                      labelFormatter={(_, arr) => arr?.[0]?.payload?.fullName || ''}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }} />
                    <Bar dataKey="velocity" name="Daily Velocity" fill="#6366F1" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="storeStock" name="Store Stock" fill="#3B82F6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No sales velocity records in current filter
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Ranked by daily burn rate</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              Demand Signal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
