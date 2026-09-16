import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function SupplierModal({ supplier, onClose }) {
  if (!supplier) return null;

  return (
    <Modal
      isOpen={!!supplier}
      onClose={onClose}
      title={`Supplier Performance Profile: ${supplier.name}`}
    >
      <div className="space-y-4 text-xs">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <p className="font-semibold text-slate-800">Contact Info: {supplier.contact}</p>
          <p className="text-slate-500">Category Specialty: {supplier.category}</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">On-Time Delivery</span>
            <p className="text-xl font-bold text-emerald-600 mt-0.5">{supplier.onTimePercent}%</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Avg Lead Time</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{supplier.avgLeadTime}</p>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Orders</span>
            <p className="text-xl font-bold text-slate-900 mt-0.5">{supplier.totalOrders}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
}
