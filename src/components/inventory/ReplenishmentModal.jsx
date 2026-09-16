import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { RefreshCw, Warehouse, Store, CheckCircle2 } from 'lucide-react';
import { STORE_INFO } from '../../utils/constants';
import { useToast } from '../../context/ToastContext';
import { replenishStock } from '../../services/inventoryService';

export default function ReplenishmentModal({ product, onClose, onReplenished }) {
  const { toast } = useToast();
  const defaultQty = Math.max(
    ((product?.reorder_level || product?.reorderLevel || 20) * 2) -
      (product?.storeStock ?? product?.store_stock ?? 0),
    25
  );
  const [qty, setQty] = useState(defaultQty);

  if (!product) return null;

  return (
    <Modal
      isOpen={!!product}
      onClose={onClose}
      title={`Create Replenishment Request: ${product.name}`}
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <Warehouse className="w-4 h-4 text-emerald-600" /> Stock Transfer Flow: Central Warehouse → {STORE_INFO.name}
          </p>
          <p className="text-[11px] text-emerald-800">
            Available Warehouse Stock: <strong>{product.warehouseStock} units</strong>. Current Store Stock: <strong>{product.storeStock} units</strong>.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Transfer Quantity (Units)
          </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            min={1}
            max={product.warehouseStock || 100}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
          <div className="flex justify-between"><span>Destination:</span><strong className="text-slate-900">{STORE_INFO.name} ({STORE_INFO.id})</strong></div>
          <div className="flex justify-between"><span>Priority:</span><strong className="text-red-600">HIGH (Low Stock Replenishment)</strong></div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={CheckCircle2}
            onClick={async () => {
              if (product.id) {
                await replenishStock(product.id, qty).catch(() => null);
              }
              toast.success(
                'Replenishment Request Created',
                `${qty} units requested for "${product.name}" from Central Warehouse.`,
                4500
              );
              if (onReplenished) {
                onReplenished();
              }
              onClose();
            }}
          >
            Submit Replenishment Request
          </Button>
        </div>
      </div>
    </Modal>
  );
}
