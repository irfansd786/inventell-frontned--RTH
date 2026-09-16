import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AnalyticsHeader from '../../components/store-intelligence/AnalyticsHeader';
import WarehouseOverview from '../../components/warehouse/WarehouseOverview';
import FulfillmentFlow from '../../components/warehouse/FulfillmentFlow';
import InventoryTable from '../../components/inventory/InventoryTable';
import Loading from '../../components/common/Loading';
import Card from '../../components/common/Card';

import { getWarehouseData } from '../../services/warehouseService';
import { Warehouse as WarehouseIcon, Clock, Layers } from 'lucide-react';

export default function Warehouse() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getWarehouseData();
      setData(result);
    } catch {
      setData({ kpis: {}, timeline: [], products: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Connecting to Central Warehouse Telemetry Systems..." />;
  }

  return (
    <PageContainer>
      <AnalyticsHeader
        title="Warehouse Operations"
        subtitle="Monitor stock availability, capacity load, and fulfillment activity in your central warehouse."
        onRefresh={loadData}
      />

      <WarehouseOverview kpis={data?.kpis || {}} />

      <FulfillmentFlow kpis={data?.kpis || {}} />

      {/* Warehouse Activity Timeline */}
      <Card title="Warehouse Event Log" subtitle="Real-time storage and movement activity stream">
        <div className="space-y-3">
          {(data?.timeline || []).map((act, idx) => (
            <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <WarehouseIcon className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">{act.text}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 font-bold">{act.time}</span>
            </div>
          ))}
        </div>
      </Card>

      <InventoryTable products={data?.products || []} />
    </PageContainer>
  );
}
