import React, { useState, useEffect } from 'react';
import PageContainer from '../../components/layout/PageContainer';
import AnalyticsHeader from '../../components/store-intelligence/AnalyticsHeader';
import TransferTable from '../../components/warehouse/TransferTable';
import CreateTransferModal from '../../components/warehouse/CreateTransferModal';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';

import { getTransfersData } from '../../services/transferService';
import { ArrowRightLeft, Plus } from 'lucide-react';
import { STORE_INFO } from '../../utils/constants';

export default function Transfers() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transfers, setTransfers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await getTransfersData();
      setData(result);
      setTransfers([...(result?.transfers || [])]);
    } catch {
      setData({ transfers: [] });
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Connecting to Inter-Site Stock Transfer Engine..." />;
  }

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Stock Transfers</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage stock movement requests between Central Warehouse and {STORE_INFO.name}.</p>
        </div>

        <Button variant="primary" size="md" icon={Plus} onClick={() => setShowCreateModal(true)}>
          Create Stock Transfer
        </Button>
      </div>

      <TransferTable transfers={transfers} />

      {showCreateModal && (
        <CreateTransferModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTransferCreated={(newTr) => setTransfers([newTr, ...transfers])}
        />
      )}
    </PageContainer>
  );
}
