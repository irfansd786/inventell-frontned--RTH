import React, { useState } from 'react';
import { FileText, Download, Check, Eye } from 'lucide-react';
import Modal from '../common/Modal';

export default function ReportPreviewModal({ isOpen, onClose, report }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!report) return null;

  const summary = report.payload?.summary || {};
  const sales = report.payload?.sales || {};
  const hourly = report.payload?.hourly || [];
  const peakHour = hourly.reduce(
    (best, h) => ((h.revenue || 0) > (best.revenue || 0) ? h : best),
    hourly[0] || {}
  );

  const kpi = (label, value, accent) => (
    <div className="p-3 border border-slate-200 rounded-lg">
      <p className="text-[10px] text-slate-500 uppercase font-semibold">{label}</p>
      <p className={`text-sm font-bold mt-0.5 ${accent || 'text-slate-900'}`}>{value}</p>
    </div>
  );

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Report Preview — ${report.title}`} maxWidth="max-w-3xl">
      <div className="space-y-4 text-xs text-slate-700">
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="font-bold text-slate-900 text-sm">{report.title}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">Category: {report.category} • Last Generated: {report.lastGenerated}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {report.formats.map((f, i) => (
              <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Mock Report PDF Document Canvas */}
        <div className="bg-white border-2 border-slate-200 rounded-xl p-6 shadow-xs space-y-4 font-sans text-slate-800">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-wider">INVINTELL INTELLIGENCE REPORT</h2>
              <p className="text-[10px] text-slate-500 font-semibold uppercase">{report.title}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-emerald-600">ST-001 Main Street Store</p>
              <p className="text-[10px] text-slate-400">Date: {new Date().toLocaleDateString('en-US')}</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg text-slate-600 leading-relaxed text-xs">
            <strong>Executive Summary:</strong> {report.description} This document provides empirical telemetry, operational benchmarks, and automated AI prescriptive indicators.
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            {kpi('Revenue (anchor day)', summary.revenue_today !== undefined ? `₹${Number(summary.revenue_today).toLocaleString('en-IN')}` : '—')}
            {kpi('Orders (anchor day)', sales.orders ?? summary.orders_today ?? '—', 'text-emerald-600')}
            {kpi('Peak sales hour', peakHour.hour ? `${peakHour.hour} (₹${Number(peakHour.revenue || 0).toLocaleString('en-IN')})` : '—', 'text-rose-600')}
          </div>

          <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-100 font-bold text-slate-700">
                <tr>
                  <th className="p-2">Metric</th>
                  <th className="p-2">Actual (live backend)</th>
                  <th className="p-2">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-medium">Units sold</td>
                  <td className="p-2 font-bold text-emerald-600">{sales.units_sold ?? '—'}</td>
                  <td className="p-2 text-slate-500">sales table</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Average order value</td>
                  <td className="p-2 font-bold text-emerald-600">{sales.average_order_value !== undefined ? `₹${sales.average_order_value}` : '—'}</td>
                  <td className="p-2 text-slate-500">sales table</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Refunds</td>
                  <td className="p-2 font-bold text-rose-600">{sales.refunds !== undefined ? `₹${sales.refunds}` : '—'}</td>
                  <td className="p-2 text-slate-500">sales table</td>
                </tr>
                <tr>
                  <td className="p-2 font-medium">Dataset period</td>
                  <td className="p-2 font-bold">{summary.dataset_period || '—'}</td>
                  <td className="p-2 text-slate-500">dataset metadata</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-slate-100">
            Generated automatically by INVINTELL Platform Engine • Confidential Enterprise Document
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors text-xs"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 text-xs"
          >
            {downloading ? (
              <span>Generating Export...</span>
            ) : downloaded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Report ({report.formats[0]})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
