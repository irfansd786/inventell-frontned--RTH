import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Package, Warehouse, Store, IndianRupee, RefreshCw } from 'lucide-react';

export default function ProductModal({ product, onClose, onReplenish }) {
  if (!product) return null;

  return (
    <Modal
      isOpen={!!product}
      onClose={onClose}
      title={`Product Overview: ${product.name}`}
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">SKU</span>
            <p className="font-mono font-bold text-slate-900">{product.sku}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Category</span>
            <Badge variant="neutral" size="sm">{product.category}</Badge>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Supplier</span>
            <p className="font-semibold text-slate-800">{product.supplier}</p>
          </div>
        </div>

        {/* Stock Breakdown Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-500 font-medium">Store Stock</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{product.storeStock} units</p>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="text-[10px] text-emerald-700 font-medium">Warehouse Stock</span>
            <p className="text-xl font-extrabold text-emerald-950 mt-0.5">{product.warehouseStock} units</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-500 font-medium">Total System Stock</span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">{product.storeStock + product.warehouseStock} units</p>
          </div>
        </div>

        {/* Financials & Reorder Threshold */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-xl">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Selling Price</span>
            <p className="text-base font-black text-emerald-600">₹{product.price}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Cost Price</span>
            <p className="text-base font-bold text-slate-700">₹{product.cost}</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Reorder Threshold</span>
            <p className="text-sm font-bold text-slate-800">{product.reorderLevel} units</p>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Daily Sales Avg</span>
            <p className="text-sm font-bold text-slate-800">{product.dailySalesAvg || 20} units/day</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          {onReplenish && (
            <Button
              variant="primary"
              size="sm"
              icon={RefreshCw}
              onClick={() => {
                onClose();
                onReplenish(product);
              }}
            >
              Replenish Store Stock
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
