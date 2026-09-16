import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DollarSign, TrendingUp, CreditCard, ShoppingBag, Package, ArrowUpRight, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import PageHeader from '../../components/common/PageHeader';
import LoadingState from '../../components/common/LoadingState';
import ProvenanceBadge from '../../components/common/ProvenanceBadge';
import { financeService } from '../../services/financeService';
import { useTheme } from '../../context/ThemeContext';

export default function Finance() {
  const navigate = useNavigate();
  const { chartTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [paymentBreakdown, setPaymentBreakdown] = useState([]);
  const [grossVsNet, setGrossVsNet] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    async function loadFinance() {
      setLoading(true);
      try {
        const [k, p, g, tp] = await Promise.all([
          financeService.getSummaryKPIs(),
          financeService.getPaymentBreakdown(),
          financeService.getGrossVsNetTrend(),
          financeService.getTopRevenueProducts()
        ]);
        setKpis(k);
        setPaymentBreakdown(p);
        setGrossVsNet(g);
        setTopProducts(tp);
      } catch (err) {
        console.error('Failed to load finance data', err);
      } finally {
        setLoading(false);
      }
    }
    loadFinance();
  }, []);

  if (loading || !kpis) {
    return <LoadingState message="Loading financial telemetry..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <PageHeader
        title="Financial Telemetry & P&L"
        subtitle="Gross revenue, net margin breakdown, payment method distribution, and category financial metrics."
        actions={
          <>
            <ProvenanceBadge
              kind="historical"
              text={kpis.period ? `Historical Dataset · ${kpis.period.label}` : 'Historical Dataset'}
              title={kpis.period ? `${kpis.period.source} · ${kpis.period.label}` : 'Aggregated from ingested sales rows'}
            />
            <button
              onClick={() => navigate('/billing')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
              Open Billing Terminal
            </button>
          </>
        }
      />

      {/* Top Financial KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Sales</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{kpis.grossSales}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Total processed revenue</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Discounts & Refunds</span>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{kpis.discounts}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Refunds: {kpis.refunds}</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">Net Revenue</span>
          <div className="text-2xl font-black text-emerald-950 dark:text-emerald-100 mt-0.5">{kpis.netRevenue}</div>
          <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">After deductions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gross Margin %</span>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{kpis.grossMarginPct}</div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Net Margin: {kpis.netMarginPct}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gross vs Net Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Gross vs Net Revenue Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Monthly financial trajectory</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={grossVsNet}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} />
                <XAxis dataKey="month" stroke={chartTheme.axisStroke} fontSize={11} />
                <YAxis stroke={chartTheme.axisStroke} fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }} />
                <Legend />
                <Bar dataKey="gross" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Gross Sales (₹)" />
                <Bar dataKey="net" fill={chartTheme.emerald} radius={[4, 4, 0, 0]} name="Net Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">Payment Method Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Transaction channel split</p>
          <div className="h-44 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4}>
                  {paymentBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: chartTheme.tooltipBg, borderColor: chartTheme.tooltipBorder, color: chartTheme.tooltipText, borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-100 dark:border-slate-800">
            {paymentBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{item.value}% ({item.amount})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Revenue Products Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Top Revenue Generating Products</h3>
          <button
            onClick={() => navigate('/inventory')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
          >
            View Inventory
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">SKU</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Units Sold</th>
                <th className="p-3.5">Revenue</th>
                <th className="p-3.5 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium">
              {topProducts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900 dark:text-slate-100">{p.name}</td>
                  <td className="p-3.5 text-slate-500 dark:text-slate-400 font-mono">{p.sku}</td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-300">{p.category}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{p.unitsSold} units</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{p.revenue}</td>
                  <td className="p-3.5 text-right font-bold text-slate-900 dark:text-slate-100">{p.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
