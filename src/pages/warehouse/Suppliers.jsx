import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AnalyticsHeader from '../../components/store-intelligence/AnalyticsHeader';
import SupplierTable from '../../components/warehouse/SupplierTable';
import SupplierModal from '../../components/warehouse/SupplierModal';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';

import { getSuppliersData } from '../../services/supplierService';
import { Truck, CheckCircle2, Clock, ShoppingCart } from 'lucide-react';

export default function Suppliers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getSuppliersData();
      setData(result);
    } catch {
      setData({ kpis: {}, suppliers: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Loading Supplier Directory & Logistics Metrics..." />;
  }

  return (
    <PageContainer>
      <AnalyticsHeader
        title="Supplier Directory"
        subtitle="Monitor active supplier performance, lead times, and on-time fulfillment rates."
        onRefresh={loadData}
      />

      {/* Supplier KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Active Suppliers</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{data?.kpis?.activeSuppliers ?? '—'}</p>
          </div>
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Pending Supplier Orders</span>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{data?.kpis?.pendingOrders ?? '—'}</p>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">On-Time Delivery Rate</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{data?.kpis?.onTimeDelivery ?? '—'}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Average Lead Time</span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{data?.kpis?.avgLeadTime ?? '—'}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      <SupplierTable suppliers={data?.suppliers || []} onSelectSupplier={setSelectedSupplier} />

      {selectedSupplier && (
        <SupplierModal supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
      )}
    </PageContainer>
  );
}
