import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, Eye, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import Modal from '../../components/common/Modal';
import { activityLogService } from '../../services/activityLogService';

export default function ActivityLog() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const list = await activityLogService.getLogs();
        setLogs(list);
      } catch (err) {
        console.error('Failed to load activity logs', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const modules = ['All', 'Risks', 'Management Actions', 'Billing & Sales', 'Picking Operations', 'Alerts', 'Reports', 'Settings'];

  const filteredLogs = (Array.isArray(logs) ? logs : []).filter((l) => {
    const matchesSearch =
      (l.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.userOrSystem || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesModule = moduleFilter === 'All' || l.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  if (loading) {
    return <LoadingState message="Loading system audit log..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Enterprise Activity & Audit Log"
        subtitle="Immutable timestamped record of operational events, user decisions, AI recommendations, and inventory stock changes."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, user, description..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                moduleFilter === m ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User / System</th>
                <th className="p-3.5">Action</th>
                <th className="p-3.5">Module</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-slate-500 text-[11px] whitespace-nowrap">{item.timestamp}</td>
                  <td className="p-3.5 font-semibold text-slate-900">{item.userOrSystem}</td>
                  <td className="p-3.5 font-bold text-slate-800">{item.action}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-semibold text-[10px]">
                      {item.module}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-xs truncate">{item.description}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold text-[10px]">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => setSelectedLog(item)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs transition-colors inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Entry — ${selectedLog.id}`}
        >
          <div className="space-y-3 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <p><strong>Timestamp:</strong> {selectedLog.timestamp}</p>
              <p><strong>Initiator:</strong> {selectedLog.userOrSystem}</p>
              <p><strong>Action:</strong> {selectedLog.action}</p>
              <p><strong>Module:</strong> {selectedLog.module}</p>
              <p><strong>Status:</strong> {selectedLog.status}</p>
            </div>
            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1 font-mono text-[11px]">
              <p className="text-emerald-400 font-bold">Event Details:</p>
              <p>{selectedLog.description}</p>
              <p className="text-slate-400 pt-1">{selectedLog.details}</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
