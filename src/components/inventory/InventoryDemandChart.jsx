import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card from '../common/Card';
import { formatINR } from '../../utils/formatters';
import { Flame, Layers, BarChart2 } from 'lucide-react';

export default function InventoryDemandChart({ products = [], weekdayMovement = [] }) {
  const [viewMode, setViewMode] = useState('category'); // 'category' | 'velocity' | 'weekday'

  // 1. Category breakdown from current filtered products
  const categoryData = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const c = p.category || 'Other';
      if (!map[c]) {
        map[c] = { name: c, storeStock: 0, warehouseStock: 0, totalStock: 0, value: 0 };
      }
      map[c].storeStock += p.storeStock || 0;
      map[c].warehouseStock += p.warehouseStock || 0;
      map[c].totalStock += (p.storeStock || 0) + (p.warehouseStock || 0);
      map[c].value += ((p.storeStock || 0) + (p.warehouseStock || 0)) * (p.price || 0);
    });
    return Object.values(map)
      .sort((a, b) => b.totalStock - a.totalStock)
      .slice(0, 8);
  }, [products]);

  // 2. Top Fast-Moving Products by Sales Velocity from current filtered products
  const velocityData = useMemo(() => {
    return products
      .filter((p) => p.salesVelocity && p.salesVelocity > 0)
      .sort((a, b) => b.salesVelocity - a.salesVelocity)
      .slice(0, 7)
      .map((p) => ({
        name: p.name.length > 18 ? `${p.name.slice(0, 16)}…` : p.name,
        fullName: p.name,
        velocity: p.salesVelocity,
        storeStock: p.storeStock,
        daysOfStock: p.daysOfStock,
      }));
  }, [products]);

  return (
    <Card
      title="Inventory Flow & Demand Intelligence"
      subtitle="Dynamic category stock allocation and sales demand velocity"
      action={
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setViewMode('category')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'category'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            By Category
          </button>
          <button
            type="button"
            onClick={() => setViewMode('velocity')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'velocity'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Fast-Moving
          </button>
          <button
            type="button"
            onClick={() => setViewMode('weekday')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
              viewMode === 'weekday'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Weekday POS
          </button>
        </div>
      }
    >
      <div className="h-56 sm:h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'category' ? (
            <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(v, name) => [`${v?.toLocaleString('en-IN')} pcs`, name]}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="storeStock" name="Store Stock" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="warehouseStock" name="Warehouse Stock" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : viewMode === 'velocity' ? (
            <BarChart data={velocityData} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 10 }}
                interval={0}
                angle={-15}
                textAnchor="end"
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(v, name, item) => {
                  if (name === 'Daily Velocity') return [`${v} pcs/day`, name];
                  if (name === 'Store Stock') return [`${v} pcs`, name];
                  return [v, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="velocity" name="Daily Velocity" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="storeStock" name="Store Stock" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <BarChart data={weekdayMovement} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#1e293b',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(v, name) =>
                  name === 'Revenue (₹)' ? [formatINR(v, 2), name] : [`${v} bills`, name]
                }
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="bills" name="POS Bills" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue (₹)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
