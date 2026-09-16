import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, Play, CheckCircle2, Filter, Sparkles } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ProvenanceBadge from '../../components/common/ProvenanceBadge';
import ReportPreviewModal from '../../components/intelligence/ReportPreviewModal';
import { reportService } from '../../services/reportService';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      try {
        const list = await reportService.getReports();
        setReports(list);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, []);

  const handleGenerate = async (reportId) => {
    setGeneratingId(reportId);
    setTimeout(async () => {
      await reportService.generateReport(reportId, 'PDF');
      setGeneratingId(null);
      const updated = reports.find((r) => r.id === reportId);
      if (updated) setSelectedReport(updated);
    }, 1000);
  };

  const categories = [
    'All',
    'Sales Reports',
    'Inventory Reports',
    'Customer Analytics',
    'Warehouse Reports',
    'AI Intelligence Reports',
    'Financial Reports'
  ];

  const filteredReports = reports.filter(
    (r) => activeCategory === 'All' || r.category === activeCategory
  );

  if (loading) {
    return <LoadingState message="Loading report center catalog..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Report Center"
        subtitle="Generate and review operational, sales, inventory, risk, and intelligence reports in PDF, CSV, or Excel formats."
        actions={
          <ProvenanceBadge kind="historical" text="Historical Dataset · live backend payloads" title="Every figure is fetched from backend APIs backed by ingested datasets" />
        }
      />

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
        <Filter className="w-4 h-4 text-slate-400 ml-2" />
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActiveCategory(c)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeCategory === c
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReports.map((card) => {
          const isGenerating = generatingId === card.id;

          return (
            <div
              key={card.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 font-bold rounded text-[10px]">
                    {card.category}
                  </span>
                  <div className="flex items-center gap-1">
                    {(card.formats || []).map((f, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-bold">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 mt-3">{card.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-normal">{card.description}</p>
                {card.headline && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1.5">{card.headline}</p>
                )}
                <p className="text-[10px] text-slate-400 mt-3">Last Generated: {card.lastGenerated}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedReport(card)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Preview
                </button>

                <button
                  onClick={() => handleGenerate(card.id)}
                  disabled={isGenerating}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-xs"
                >
                  {isGenerating ? (
                    <span>Generating...</span>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Generate Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {selectedReport && (
        <ReportPreviewModal
          isOpen={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          report={selectedReport}
        />
      )}
    </div>
  );
}
