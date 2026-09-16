import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Search,
  AlertTriangle,
  Clock,
  Activity,
  Layers,
  CheckCircle,
  Package,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import AIInsightModal from '../../components/intelligence/AIInsightModal';
import { aiInsightService } from '../../services/aiInsightService';
import { useToast } from '../../context/ToastContext';

export default function AIInsights() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState([]);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const list = await aiInsightService.getInsights();
      setInsights(list);
      if (isRefresh) {
        toast.success('Intelligence Refreshed', 'Successfully synchronized telemetry and prescriptive models.');
      }
    } catch (err) {
      console.error('Failed to load AI insights', err);
      toast.error('Sync Error', 'Unable to refresh intelligence stream.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExecuteAction = (item) => {
    setInsights((prev) =>
      prev.map((ins) =>
        ins.id === item.id ? { ...ins, status: 'Resolved' } : ins
      )
    );
    toast.success('Prescriptive Action Executed', `Workflow action dispatched for ${item.title}`);
  };

  // Filter and Search logic
  const filteredInsights = useMemo(() => {
    return insights.filter((ins) => {
      const matchCategory =
        activeCategory === 'All' ||
        String(ins.category || '').toLowerCase() === activeCategory.toLowerCase();

      const matchSeverity =
        severityFilter === 'All' ||
        String(ins.priority || '').toLowerCase() === severityFilter.toLowerCase();

      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        String(ins.title || '').toLowerCase().includes(query) ||
        String(ins.explanation || '').toLowerCase().includes(query) ||
        String(ins.sku || '').toLowerCase().includes(query) ||
        String(ins.product || '').toLowerCase().includes(query) ||
        String(ins.recommendedAction || '').toLowerCase().includes(query) ||
        String(ins.source || '').toLowerCase().includes(query);

      return matchCategory && matchSeverity && matchSearch;
    });
  }, [insights, activeCategory, severityFilter, searchQuery]);

  // Dynamic KPI calculations
  const totalInsights = insights.length;
  const highPriorityCount = insights.filter(
    (i) => i.priority === 'Critical' || i.priority === 'High'
  ).length;
  const actionRequiredCount = insights.filter(
    (i) => i.status !== 'Resolved'
  ).length;
  const resolvedCount = insights.filter((i) => i.status === 'Resolved').length;

  const categories = ['All', 'Sales', 'Inventory', 'Customer', 'Operations'];

  if (loading) {
    return <LoadingState message="Aggregating enterprise telemetry & prescriptive intelligence..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <PageHeader
        title="AI Insights & Product Intelligence"
        subtitle="Real-time prescriptive business intelligence generated from sales velocity, store inventory, CCTV flow, and supply chain telemetry."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Intelligence'}</span>
            </button>
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Insights</span>
            <Brain className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">{totalInsights}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Continuous telemetry scan</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">High Priority</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{highPriorityCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Critical & High severity</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-600 dark:text-red-400">Action Required</span>
            <Activity className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{actionRequiredCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Awaiting manager execution</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Resolved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{resolvedCount}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Executed today</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Severity & Search Controls */}
        <div className="flex items-center gap-2">
          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, SKU, insight..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Intelligence Feed Grid */}
      {filteredInsights.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
          No product insights found matching Category "{activeCategory}", Severity "{severityFilter}" and query "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredInsights.map((card) => {
            const isCrit = card.priority === 'Critical';
            const isHigh = card.priority === 'High';
            const isResolved = card.status === 'Resolved';

            const badgeClass = isCrit
              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50 font-bold'
              : isHigh
              ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50 font-bold'
              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 font-semibold';

            return (
              <div
                key={card.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  {/* Card Meta Bar */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider border ${badgeClass}`}>
                        {card.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[10px] font-semibold border border-slate-200 dark:border-slate-700">
                        {card.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 px-1.5 py-0.5 rounded text-[10px]">
                        {card.confidence}% Conf.
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-2.5 leading-snug">
                    {card.title}
                  </h3>

                  {/* PRODUCT & SKU BADGE */}
                  {(card.product || card.sku) && (
                    <div className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-between gap-1.5">
                      <span className="flex items-center gap-1.5 truncate">
                        <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{card.product || 'Product Item'}</span>
                      </span>
                      {card.sku && (
                        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800 shrink-0">
                          {card.sku}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Source & Timestamp */}
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-400" />
                      {card.source}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {card.detectedTime || card.time}
                    </span>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed font-normal line-clamp-3">
                    {card.explanation}
                  </p>

                  {/* Impact Snippet */}
                  {card.impact && (
                    <div className="mt-3 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="font-bold text-amber-700 dark:text-amber-400 shrink-0">Impact:</span>
                      <span className="truncate font-medium">{card.impact}</span>
                    </div>
                  )}

                  {/* Telemetry Preview */}
                  {card.metrics && card.metrics.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {card.metrics.slice(0, 2).map((m, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase truncate">{m.label}</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5">{m.value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Action Section */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-emerald-950 dark:text-emerald-300 text-xs">
                    <strong className="text-emerald-900 dark:text-emerald-400 block text-[10px] font-bold uppercase tracking-wider">
                      Recommended Action:
                    </strong>
                    <p className="mt-0.5 font-medium leading-tight line-clamp-2">{card.recommendedAction}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {card.status || 'Action Required'}
                    </span>

                    <button
                      onClick={() => setSelectedInsight(card)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedInsight && (
        <AIInsightModal
          isOpen={!!selectedInsight}
          onClose={() => setSelectedInsight(null)}
          insight={selectedInsight}
          onExecuteAction={handleExecuteAction}
        />
      )}
    </div>
  );
}
