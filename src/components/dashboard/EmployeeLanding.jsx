import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ShoppingBag,
  Package,
  Boxes,
  TrendingUp,
  Truck,
  Brain,
  Bell,
  AlertTriangle,
  DollarSign,
  FileSpreadsheet,
  Users,
  Video,
  Grid,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { MODULE_MAP } from '../../config/permissions';

const ICON_MAP = {
  store_monitor: Video,
  customer_analytics: Users,
  spatial_intelligence: Grid,
  queue_intelligence: Clock,

  billing_sales: ShoppingBag,
  products: Package,
  inventory: Package,
  low_stock: AlertTriangle,
  forecasting: TrendingUp,

  ai_insights: Brain,
  alerts: Bell,
  exceptions: AlertTriangle,

  orders: ShoppingBag,
  allocation: Layers,
  picking: Boxes,
  packing: Package,
  dispatch: Truck,

  finance: DollarSign,
  staff: Users,
  report_center: FileSpreadsheet,
};

export default function EmployeeLanding() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const assigned = Array.isArray(profile?.assigned_modules) ? profile.assigned_modules : [];
  const assignedList = assigned.map((id) => MODULE_MAP[id]).filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                Staff Console
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Active Session
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              Welcome back, {profile?.name || 'Associate'}! 👋
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Logged in as <strong className="text-slate-700 dark:text-slate-300">{profile?.email}</strong> • Role: <strong className="text-emerald-700 dark:text-emerald-400 uppercase font-bold">{profile?.role || 'Employee'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Assigned Consoles</span>
              <p className="text-xl font-black text-slate-900 dark:text-white">{assignedList.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Assigned Work Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
              Your Assigned Work
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access the operational workflows authorized for your account.
            </p>
          </div>
        </div>

        {assignedList.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto text-amber-600 dark:text-amber-400">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No work has been assigned to your account yet.
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your account is active, but an administrator has not yet assigned operational modules. Please contact your manager or system administrator to receive task assignments.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedList.map((item) => {
              const Icon = ICON_MAP[item.id] || Briefcase;
              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500/50 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {item.groupTitle}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {item.id === 'orders' && 'Process customer orders and check inventory reserves.'}
                      {item.id === 'allocation' && 'Reserve inventory and assign stock to pending orders.'}
                      {item.id === 'picking' && 'Execute pick lists and verify SKU locations.'}
                      {item.id === 'packing' && 'Verify order contents, weigh and package parcels.'}
                      {item.id === 'dispatch' && 'Coordinate shipping carrier manifests and departures.'}
                      {item.id === 'inventory' && 'Audit store stock, warehouse buffer, and SKU valuations.'}
                      {item.id === 'low_stock' && 'Manage replenishment reorder thresholds and alerts.'}
                      {item.id === 'billing_sales' && 'Process customer register checkouts and POS tickets.'}
                      {item.id === 'forecasting' && 'Review M5 Ridge and Prophet demand forecasts.'}
                      {item.id === 'finance' && 'Monitor retail store gross margin and financial telemetry.'}
                      {item.id === 'report_center' && 'Generate and export analytical reports.'}
                      {item.id === 'staff' && 'Manage shift personnel and roster assignments.'}
                      {![
                        'orders',
                        'allocation',
                        'picking',
                        'packing',
                        'dispatch',
                        'inventory',
                        'low_stock',
                        'billing_sales',
                        'forecasting',
                        'finance',
                        'report_center',
                        'staff',
                      ].includes(item.id) && 'Access authorized intelligence operations console.'}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <span>Open Console</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security notice footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Enterprise Role-Based Access Control active. Direct URL access to unauthorized modules is automatically restricted.
        </span>
      </div>
    </div>
  );
}
