// Transfer service — backend-driven (GET/POST /api/transfers).
// Transfer rows are real DB records; creating one also replenishes
// inventory server-side. Falls back to local demo data only offline.
import { apiGet, apiPost } from './api';
import { transferKpis, transfersList } from '../data/transferData';
import { STORE_INFO } from '../utils/constants';

function toRow(t = {}) {
  return {
    id: t.transfer_number || `TR-${t.id}`,
    dbId: t.id,
    product_id: t.product_id,
    product: t.product_name || t.product || '—',
    sku: t.product_sku || t.sku || '—',
    quantity: t.quantity ?? 0,
    from: t.warehouse_name || 'Central Warehouse',
    to: STORE_INFO.name,
    priority: t.priority || '—',
    status: t.status
      ? t.status.charAt(0) + t.status.slice(1).toLowerCase()
      : 'Pending',
    date: t.created_at ? new Date(t.created_at).toLocaleString() : t.date || '',
  };
}

function kpisFrom(rows) {
  const pending = rows.filter((r) => r.status === 'Pending').length;
  const completed = rows.filter((r) => r.status === 'Completed').length;
  return {
    ...(transferKpis || {}),
    totalTransfers: rows.length,
    pendingTransfers: pending,
    completedTransfers: completed,
    unitsMoved: rows.reduce((a, r) => a + (Number(r.quantity) || 0), 0),
  };
}

export async function getTransfersData() {
  try {
    const raw = await apiGet('/transfers');
    const list = Array.isArray(raw) ? raw : raw?.items || [];
    const rows = list.map(toRow);
    return { kpis: kpisFrom(rows), transfers: rows };
  } catch {
    return { kpis: transferKpis, transfers: transfersList };
  }
}

export async function createTransfer(transferData) {
  const payload = {
    product_id: Number(transferData.product_id || transferData.productId),
    quantity: Number(transferData.quantity),
  };
  if (!payload.product_id || !payload.quantity) {
    throw new Error('Select a product and quantity.');
  }
  const created = await apiPost('/transfers', payload);
  return toRow(created);
}
