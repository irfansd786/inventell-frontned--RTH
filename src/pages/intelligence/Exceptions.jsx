import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Eye,
  ShieldCheck,
  Layers,
  Package,
  ShoppingCart,
  UserCheck,
  Truck,
  Boxes,
  Boxes as PickingIcon,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ExceptionDetailModal from '../../components/intelligence/ExceptionDetailModal';
import { exceptionService } from '../../services/exceptionService';
import { useToast } from '../../context/ToastContext';

export default function Exceptions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exceptions, setExceptions] = useState([]);
  const [selectedException, setSelectedException] = useState(null);
  const [activeModuleFilter, setActiveModuleFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await exceptionService.getExceptions();
      setExceptions([...list]);
      if (isRefresh) {
        toast.success('Exceptions Refreshed', 'Workflow mismatch audit queue synchronized.');
      }
    } catch (err) {
      console.error('Failed to load exceptions', err);
      toast.error('Sync Error', 'Unable to fetch operational exceptions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleResolveException = async (id) => {
    await exceptionService.resolveException(id);
    setExceptions((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'Resolved' } : e))
    );
    toast.success('Exception Resolved', `Operational issue ${id} marked as resolved.`);
  };

  const handleSaveStatus = async (id, status, assignedTo, note) => {
    const updated = await exceptionService.updateExceptionStatus(id, status, assignedTo, note);
    if (updated) {
      setExceptions((prev) =>
        prev.map((e) => (e.id === id ? { ...updated } : e))
      );
      toast.success('Exception Updated', `Audit status updated for ${id}.`);
    }
  };

  // Filters & Search
  const filteredExceptions = useMemo(() => {
    return exceptions.filter((item) => {
      const matchModule =
        activeModuleFilter === 'All' ||
        String(item.module).toLowerCase() === activeModuleFilter.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(item.id || '').toLowerCase().includes(query) ||
        String(item.type || '').toLowerCase().includes(query) ||
        String(item.title || '').toLowerCase().includes(query) ||
        String(item.product || '').toLowerCase().includes(query) ||
        String(item.sku || '').toLowerCase().includes(query) ||
        String(item.orderId || '').toLowerCase().includes(query) ||
        String(item.assignedTo || '').toLowerCase().includes(query) ||
        String(item.impact || '').toLowerCase().includes(query);

      return matchModule && matchSearch;
    });
  }, [exceptions, activeModuleFilter, searchQuery]);

  // Dynamic KPI counts
  const openCount = exceptions.filter((e) => e.status === 'Open').length;
  const criticalCount = exceptions.filter(
    (e) => e.priority === 'Critical' && e.status !== 'Resolved'
  ).length;
  const inProgressCount = exceptions.filter((e) => e.status === 'In Progress').length;
  const resolvedCount = exceptions.filter((e) => e.status === 'Resolved').length;

  const moduleFilters = ['All', 'Inventory', 'Orders', 'Allocation', 'Picking', 'Packing', 'Dispatch'];

  if (loading) {
    return <LoadingState message="Scanning warehouse operations for workflow exceptions..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <PageHeader
        title="Exceptions"
        subtitle="Operational issues preventing normal workflow completion."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Open Exceptions</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{openCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Immediate investigation required</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">Critical</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{criticalCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">High financial / SLA impact</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">In Progress</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{inProgressCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Assigned to floor staff</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Audit complete today</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Module Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {moduleFilters.map((mod) => (
            <button
              key={mod}
              onClick={() => setActiveModuleFilter(mod)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeModuleFilter === mod
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search exceptions, orders, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Main Enterprise Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 w-24">Priority</th>
                <th className="p-3.5 min-w-[260px]">Exception Details</th>
                <th className="p-3.5 w-28">Module</th>
                <th className="p-3.5 min-w-[220px]">Impact</th>
                <th className="p-3.5 w-28">Status</th>
                <th className="p-3.5 w-36 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No operational exceptions found matching filter "{activeModuleFilter}".
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((item) => {
                  const isCrit = item.priority === 'Critical';
                  const isHigh = item.priority === 'High';
                  const isResolved = item.status === 'Resolved';
                  const isInProg = item.status === 'In Progress';

                  const badgeClass = isCrit
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                    : isHigh
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Priority */}
                      <td className="p-3.5 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                          {item.priority}
                        </span>
                      </td>

                      {/* Exception Title + Type + SKU/Order */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              onClick={() => setSelectedException(item)}
                              className="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-emerald-600 transition-colors cursor-pointer"
                            >
                              {item.title || item.type}
                            </span>
                            <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                              {item.id}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                            {item.orderId && (
                              <span className="flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-700 dark:text-slate-300">
                                <ShoppingCart className="w-3 h-3 text-slate-400" />
                                {item.orderId}
                              </span>
                            )}
                            {item.sku && (
                              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-bold text-slate-700 dark:text-slate-300">
                                {item.sku}
                              </span>
                            )}
                            <span className="truncate">{item.product || item.relatedItem}</span>
                          </div>
                        </div>
                      </td>

                      {/* Module */}
                      <td className="p-3.5 align-top">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold">
                          {item.module}
                        </span>
                      </td>

                      {/* Impact */}
                      <td className="p-3.5 align-top">
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal line-clamp-2">
                          {item.impact || item.notes}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : isInProg
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {item.status}
                        </span>
                        {item.assignedTo && (
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 truncate">
                            {item.assignedTo}
                          </p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-3.5 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isResolved && (
                            <button
                              onClick={() => handleResolveException(item.id)}
                              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded font-bold text-[11px] transition-colors"
                              title="Resolve exception"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedException(item)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-semibold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Investigate</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exception Detail Modal */}
      {selectedException && (
        <ExceptionDetailModal
          isOpen={!!selectedException}
          onClose={() => setSelectedException(null)}
          exception={selectedException}
          onSaveStatus={handleSaveStatus}
          onResolve={handleResolveException}
        />
      )}
    </div>
  );
}
