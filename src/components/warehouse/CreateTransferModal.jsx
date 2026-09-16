import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ArrowRightLeft, CheckCircle2 } from 'lucide-react';
import { createTransfer } from '../../services/transferService';
import { getProductsData } from '../../services/productService';
import { STORE_INFO } from '../../utils/constants';

export default function CreateTransferModal({ isOpen, onClose, onTransferCreated }) {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProductsData().then((list) => {
      const arr = Array.isArray(list) ? list : [];
      setProducts(arr);
      if (arr.length > 0) setProductId(String(arr[0].id));
    }).catch(() => setProducts([]));
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const created = await createTransfer({ product_id: productId, quantity });
      if (onTransferCreated) onTransferCreated(created);
      onClose();
    } catch (err) {
      setError(err?.message || 'Transfer failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Stock Transfer Request">
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Select Product (live catalog)</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-medium focus:outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">Transfer Quantity (Units)</label>
          <input
            type="number"
            required
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-bold focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Origin Warehouse</label>
            <input
              type="text"
              disabled
              value="Central Warehouse"
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Destination Store</label>
            <input
              type="text"
              disabled
              value={STORE_INFO.name}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 font-medium"
            />
          </div>
        </div>

        {error && <p className="text-red-600 font-semibold">{error}</p>}

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={CheckCircle2} disabled={saving}>
            {saving ? 'Creating…' : 'Create Transfer'}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 flex items-center gap-1">
          <ArrowRightLeft className="w-3 h-3" /> Creating a transfer executes it against live inventory.
        </p>
      </form>
    </Modal>
  );
}
