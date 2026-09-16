import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, AlertTriangle, CheckCircle2, Search, Filter, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import RiskModal from '../../components/intelligence/RiskModal';
import { riskService } from '../../services/riskService';

export default function Risks() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [risks, setRisks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedRisk, setSelectedRisk] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sum, list] = await Promise.all([riskService.getSummaryKPIs(), riskService.getRisks()]);
        setSummary(sum);
        setRisks(list);
      } catch (err) {
        console.error('Failed to load risks', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleResolveRisk = async (id) => {
    try {
      await riskService.resolveRisk(id);
    } catch {
      /* offline — still mark resolved locally */
    }
    setRisks((prev) => (Array.isArray(prev) ? prev : []).map((r) => (r.id === id ? { ...r, status: 'Resolved' } : r)));
  };

  const categories = [
    'All',
    'Stockout Risk',
    'Overstock Risk',
    'Queue Congestion',
    'Fulfillment Delay',
    'Inventory Mismatch',
    'Warehouse Capacity'
  ];

  const filteredRisks = (Array.isArray(risks) ? risks : []).filter((r) => {
    const matchesSearch =
      (r.riskName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.itemOrArea || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading || !summary) {
    return <LoadingState message="Scanning enterprise risk matrix..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <PageHeader
        title="Operational & Business Risks"
        subtitle="SIH Enterprise Risk Matrix — Proactively detect stockout, queue, inventory, and operational vulnerabilities."
        actions={
          <button
            onClick={() => navigate('/scenario-simulation')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Simulate Risk Mitigation
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-red-50/70 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-red-800 dark:text-red-300">
            <span className="text-xs font-bold uppercase">Critical Risks</span>
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-900 dark:text-red-200 mt-1">{summary.critical}</div>
          <p className="text-[10px] text-red-700 dark:text-red-400 font-medium">Requires immediate manager action</p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800">
            <span className="text-xs font-bold uppercase">High Risks</span>
            <ShieldAlert className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900 mt-1">{summary.high}</div>
          <p className="text-[10px] text-amber-700 font-medium">Potential SLA/stock impact</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase">Medium Risks</span>
            <Filter className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{summary.medium}</div>
          <p className="text-[10px] text-emerald-700 font-medium">Operational warnings</p>
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase">Resolved Risks</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1">{summary.resolved}</div>
          <p className="text-[10px] text-emerald-700 font-medium">Resolved in past 24h</p>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search risk, SKU, area..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900 text-slate-200 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Risk & Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Target Item/Area</th>
                <th className="p-3.5">Probability</th>
                <th className="p-3.5">Business Impact</th>
                <th className="p-3.5 text-center">Risk Score</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {filteredRisks.map((item) => {
                const isCrit = item.scoreLevel === 'Critical';
                const isHigh = item.scoreLevel === 'High';

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{item.riskName}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {item.id} • {item.detectedAt}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-bold text-[10px]">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-800 font-semibold">{item.itemOrArea}</td>
                    <td className="p-3.5 text-slate-700">{item.probability}</td>
                    <td className="p-3.5 text-slate-700">{item.impact}</td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black" style={{
                        backgroundColor: isCrit ? '#FEF2F2' : isHigh ? '#FEF3C7' : '#EFF6FF',
                        color: isCrit ? '#991B1B' : isHigh ? '#92400E' : '#1E40AF'
                      }}>
                        <span>{item.riskScore}</span>
                        <span className="text-[9px] uppercase">({item.scoreLevel})</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedRisk(item)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 text-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View & Act
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Detail Modal */}
      {selectedRisk && (
        <RiskModal
          isOpen={!!selectedRisk}
          onClose={() => setSelectedRisk(null)}
          risk={selectedRisk}
          onResolve={handleResolveRisk}
        />
      )}
    </div>
  );
}
