import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle2, Clock, XCircle, Edit3, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import { managementActionService } from '../../services/managementActionService';

export default function ManagementActions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState([]);
  const [activeTab, setActiveTab] = useState('Pending'); // Pending | Approved | In Progress | Completed

  useEffect(() => {
    async function loadActions() {
      setLoading(true);
      try {
        const list = await managementActionService.getActions();
        setActions(list);
      } catch (err) {
        console.error('Failed to load management actions', err);
      } finally {
        setLoading(false);
      }
    }
    loadActions();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await managementActionService.updateActionStatus(id, newStatus);
    setActions((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
  };

  if (loading) {
    return <LoadingState message="Loading management action recommendations..." />;
  }

  const filteredActions = actions.filter((a) => a.status === activeTab);

  const tabs = [
    { label: 'Pending Recommendations', status: 'Pending', count: actions.filter((a) => a.status === 'Pending').length },
    { label: 'Approved Actions', status: 'Approved', count: actions.filter((a) => a.status === 'Approved').length },
    { label: 'In Progress', status: 'In Progress', count: actions.filter((a) => a.status === 'In Progress').length },
    { label: 'Completed History', status: 'Completed', count: actions.filter((a) => a.status === 'Completed').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Management Actions & Decision Control"
        subtitle="Review, approve, modify, and execute AI-generated operational recommendations into physical warehouse and store actions."
      />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.status}
            onClick={() => setActiveTab(t.status)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === t.status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{t.label}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${
              activeTab === t.status ? 'bg-emerald-500 text-white font-black' : 'bg-slate-100 text-slate-700'
            }`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {filteredActions.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500 text-xs">
            No items currently in state "{activeTab}".
          </div>
        ) : (
          filteredActions.map((card) => (
            <div
              key={card.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">ID: {card.id} • {card.relatedModule}</span>
                    <h3 className="font-bold text-sm text-slate-900 mt-0.5">{card.recommendation}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                    {card.confidence} Confidence
                  </span>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                    Status: {card.status}
                  </span>
                </div>
              </div>

              {/* Details Body */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-slate-500 font-bold uppercase text-[10px]">Reasoning & Detection</p>
                  <p className="text-slate-800 font-medium leading-relaxed">{card.reason}</p>
                </div>
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-1">
                  <p className="text-emerald-900 font-bold uppercase text-[10px]">Expected Business Impact</p>
                  <p className="text-emerald-950 font-bold leading-relaxed">{card.expectedImpact}</p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => card.modulePath && navigate(card.modulePath)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 underline flex items-center gap-1"
                >
                  View Related Module ({card.relatedModule})
                  <ArrowRight className="w-3 h-3" />
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {card.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(card.id, 'Rejected')}
                        className="px-3.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleStatusChange(card.id, 'Approved')}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve Action
                      </button>
                    </>
                  )}

                  {card.status === 'Approved' && (
                    <button
                      onClick={() => handleStatusChange(card.id, 'In Progress')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      Start Execution
                    </button>
                  )}

                  {card.status === 'In Progress' && (
                    <button
                      onClick={() => handleStatusChange(card.id, 'Completed')}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                    >
                      Mark Completed
                    </button>
                  )}

                  {card.status === 'Completed' && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Executed & Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
