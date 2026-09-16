import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  ArrowRight,
  CheckCheck,
  Search,
  RefreshCw,
  Clock,
  MapPin,
  ShieldCheck,
  Package,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import AlertDetailModal from '../../components/intelligence/AlertDetailModal';
import { alertService } from '../../services/alertService';
import { useToast } from '../../context/ToastContext';

export default function Alerts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  const loadAlerts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await alertService.getAlerts();
      setAlerts(list);
      if (isRefresh) {
        toast.success('Alerts Synchronized', 'Real-time incident feed updated.');
      }
    } catch (err) {
      console.error('Failed to load alerts', err);
      toast.error('Sync Error', 'Unable to fetch real-time alerts.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkAllRead = async () => {
    await alertService.markAllAsRead();
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    toast.success('Alerts Acknowledged', 'Marked all active notifications as read.');
  };

  const handleResolveAlert = async (id) => {
    await alertService.resolveAlert(id);
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Resolved', read: true } : a))
    );
    toast.success('Alert Resolved', `Incident ${id} marked as resolved.`);
  };

  // Filters & Search
  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      let matchFilter = true;
      if (activeFilter === 'Critical') matchFilter = a.severity === 'Critical' && a.status !== 'Resolved';
      else if (activeFilter === 'High') matchFilter = a.severity === 'High' && a.status !== 'Resolved';
      else if (activeFilter === 'Medium') matchFilter = a.severity === 'Medium' && a.status !== 'Resolved';
      else if (activeFilter === 'Resolved') matchFilter = a.status === 'Resolved';

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(a.title || '').toLowerCase().includes(query) ||
        String(a.description || '').toLowerCase().includes(query) ||
        String(a.source || '').toLowerCase().includes(query) ||
        String(a.category || '').toLowerCase().includes(query) ||
        String(a.sku || '').toLowerCase().includes(query) ||
        String(a.id || '').toLowerCase().includes(query);

      return matchFilter && matchSearch;
    });
  }, [alerts, activeFilter, searchQuery]);

  // Dynamic KPI counts
  const activeCount = alerts.filter((a) => a.status !== 'Resolved').length;
  const criticalCount = alerts.filter(
    (a) => a.severity === 'Critical' && a.status !== 'Resolved'
  ).length;
  const highCount = alerts.filter(
    (a) => a.severity === 'High' && a.status !== 'Resolved'
  ).length;
  const resolvedCount = alerts.filter((a) => a.status === 'Resolved').length;

  const filters = ['All', 'Critical', 'High', 'Medium', 'Resolved'];

  if (loading) {
    return <LoadingState message="Connecting to operational incident stream..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <PageHeader
        title="Alerts"
        subtitle="Real-time operational events requiring attention."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadAlerts(true)}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCheck className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
              <span>Mark All as Read</span>
            </button>
          </div>
        }
      />

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Alerts</span>
            <Bell className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{activeCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Pending operational action</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Critical</span>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{criticalCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Immediate escalation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{highCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Floor supervisor review</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Successfully closed</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeFilter === f
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search alerts, locations, sources, SKUs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Enterprise Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5 w-24">Severity</th>
                <th className="p-3.5 min-w-[240px]">Alert Details</th>
                <th className="p-3.5 min-w-[160px]">Source & Location</th>
                <th className="p-3.5 w-28">Detected</th>
                <th className="p-3.5 w-24">Status</th>
                <th className="p-3.5 w-36 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                    No operational alerts found matching filter "{activeFilter}".
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => {
                  const isCrit = alert.severity === 'Critical';
                  const isHigh = alert.severity === 'High';
                  const isResolved = alert.status === 'Resolved';

                  const badgeClass = isCrit
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
                    : isHigh
                    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

                  return (
                    <tr
                      key={alert.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      {/* Severity */}
                      <td className="p-3.5 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                          {alert.severity}
                        </span>
                      </td>

                      {/* Alert Title & Description */}
                      <td className="p-3.5 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => setSelectedAlert(alert)}>
                              {alert.title}
                            </span>
                            {alert.sku && alert.sku !== 'N/A' && (
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px] font-bold">
                                {alert.sku}
                              </span>
                            )}
                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-medium">
                              {alert.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed font-normal">
                            {alert.description || alert.message}
                          </p>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 text-xs font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{alert.source}</span>
                        </div>
                      </td>

                      {/* Detected Time */}
                      <td className="p-3.5 align-top">
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[11px] font-mono whitespace-nowrap">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{alert.detectedTime || alert.time}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          isResolved
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}>
                          {alert.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isResolved && (
                            <button
                              onClick={() => handleResolveAlert(alert.id)}
                              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded font-bold text-[11px] transition-colors"
                              title="Resolve incident"
                            >
                              Resolve
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAlert(alert)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded font-semibold text-[11px] transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
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

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          isOpen={!!selectedAlert}
          onClose={() => setSelectedAlert(null)}
          alert={selectedAlert}
          onResolve={handleResolveAlert}
        />
      )}
    </div>
  );
}
