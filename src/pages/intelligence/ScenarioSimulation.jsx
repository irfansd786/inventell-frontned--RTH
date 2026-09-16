import React, { useState, useEffect } from 'react';
import { Sliders, ArrowRight, ShieldAlert, CheckCircle2, RefreshCw, BarChart2, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import { simulationService } from '../../services/simulationService';
import { useTheme } from '../../context/ThemeContext';

export default function ScenarioSimulation() {
  const { chartTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('SCN-01');

  // Input state
  const [storeStock, setStoreStock] = useState(12);
  const [warehouseStock, setWarehouseStock] = useState(86);
  const [dailySales, setDailySales] = useState(10);
  const [demandIncreasePct, setDemandIncreasePct] = useState(25);
  const [transferQty, setTransferQty] = useState(40);

  // Result state
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function loadPresets() {
      setLoading(true);
      try {
        const presets = await simulationService.getPresetScenarios();
        setScenarios(presets);
      } catch (err) {
        console.error('Failed to load scenarios', err);
      } finally {
        setLoading(false);
      }
    }
    loadPresets();
  }, []);

  useEffect(() => {
    async function calculate() {
      try {
        const res = await simulationService.runSimulation(selectedScenarioId, {
          currentStoreStock: Number(storeStock),
          warehouseStock: Number(warehouseStock),
          dailySales: Number(dailySales),
          expectedDemandIncreasePct: Number(demandIncreasePct),
          transferQty: Number(transferQty)
        });
        setResult(res);
      } catch {
        setResult(null);
      }
    }
    calculate();
  }, [selectedScenarioId, storeStock, warehouseStock, dailySales, demandIncreasePct, transferQty]);

  if (loading) {
    return <LoadingState message="Initializing decision simulator engine..." />;
  }

  if (!result || !result.before || !result.after) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <PageHeader
          title="Scenario Simulation (What-If Analysis)"
          subtitle="Evaluate potential operational decisions before committing inventory, staff, or budget resources."
        />
        <LoadingState message="Simulator unavailable — please adjust inputs and retry." />
      </div>
    );
  }

  const comparisonChartData = [
    {
      metric: 'Stockout Risk Score',
      CURRENT: result.before.stockoutRiskScore,
      AFTER: result.after.stockoutRiskScore,
    },
    {
      metric: 'Days of Stock Coverage',
      CURRENT: parseFloat(result.before.daysOfCoverage),
      AFTER: parseFloat(result.after.daysOfCoverage),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Scenario Simulation (What-If Analysis)"
        subtitle="Evaluate potential operational decisions before committing inventory, staff, or budget resources."
      />

      {/* Preset Scenario Selector Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {scenarios.map((sc) => (
          <button
            key={sc.id}
            onClick={() => setSelectedScenarioId(sc.id)}
            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
              selectedScenarioId === sc.id
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-white shadow-md ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[10px] font-bold uppercase opacity-70">
              <span>{sc.category}</span>
              <span>{sc.id}</span>
            </div>
            <div className="font-bold text-xs mt-1 leading-snug">{sc.name}</div>
          </button>
        ))}
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameter Inputs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Simulation Variables</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Store Stock: <strong className="text-slate-900 dark:text-slate-100">{storeStock} units</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={storeStock}
                onChange={(e) => setStoreStock(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Central Warehouse Stock: <strong className="text-slate-900 dark:text-slate-100">{warehouseStock} units</strong>
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={warehouseStock}
                onChange={(e) => setWarehouseStock(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Baseline Daily Sales: <strong className="text-slate-900 dark:text-slate-100">{dailySales} units/day</strong>
              </label>
              <input
                type="range"
                min="1"
                max="50"
                value={dailySales}
                onChange={(e) => setDailySales(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expected Demand Surge: <strong className="text-emerald-600 dark:text-emerald-400">+{demandIncreasePct}%</strong>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={demandIncreasePct}
                onChange={(e) => setDemandIncreasePct(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block font-bold text-slate-900 dark:text-slate-100 mb-1">
                Proposed Transfer Quantity: <strong className="text-emerald-600 dark:text-emerald-400">{transferQty} units</strong>
              </label>
              <input
                type="range"
                min="5"
                max="100"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Results & Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {/* Before / After Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* BEFORE */}
            <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-red-200 dark:border-red-900/40 pb-2">
                <span className="font-extrabold text-xs text-red-900 dark:text-red-300 uppercase tracking-wider">Current (Before Action)</span>
                <span className="px-2 py-0.5 bg-red-200 dark:bg-red-900/60 text-red-900 dark:text-red-200 rounded font-bold text-[10px]">
                  {result.before.riskLevel} Risk
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Store Stock</p>
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">{result.before.storeStock} units</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Stock Coverage</p>
                  <p className="text-lg font-black text-red-700 dark:text-red-400">{result.before.daysOfCoverage} days</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Stockout Risk Score</p>
                  <p className="text-lg font-black text-red-600 dark:text-red-400">{result.before.stockoutRiskScore} / 100</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-red-100 dark:border-red-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Projected Outage</p>
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">{result.before.projectedStockoutHours} hrs</p>
                </div>
              </div>
            </div>

            {/* AFTER */}
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-900/40 pb-2">
                <span className="font-extrabold text-xs text-emerald-900 dark:text-emerald-300 uppercase tracking-wider">After Simulation</span>
                <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 rounded font-bold text-[10px]">
                  {result.after.riskLevel} Risk
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Projected Store Stock</p>
                  <p className="text-lg font-black text-slate-900 dark:text-slate-100">{result.after.storeStock} units</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">New Stock Coverage</p>
                  <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">{result.after.daysOfCoverage} days</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Risk Score Reduction</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">-{result.after.riskReductionPct}%</p>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">Protected Revenue</p>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{result.after.revenueImpact}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Comparison Chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-3">Before vs After Metric Comparison</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                  <XAxis dataKey="metric" stroke={chartTheme.axisStroke} fontSize={11} />
                  <YAxis stroke={chartTheme.axisStroke} fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }} />
                  <Legend />
                  <Bar dataKey="CURRENT" fill={chartTheme.danger} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="AFTER" fill={chartTheme.emerald} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
