import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Printer, CheckCircle2, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function TransactionModal({ transaction, onClose }) {
  const { toast } = useToast();
  if (!transaction) return null;

  return (
    <Modal
      isOpen={!!transaction}
      onClose={onClose}
      title={`POS Invoice Details: ${transaction.id}`}
    >
      <div className="space-y-4 text-xs">
        <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Customer</span>
            <p className="font-bold text-slate-800">{transaction.customer}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Time</span>
            <p className="font-mono text-slate-700">{transaction.time}</p>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Payment</span>
            <Badge variant="neutral" size="sm">{transaction.paymentMethod}</Badge>
          </div>
        </div>

        {/* Invoice Item List */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Purchased Items</h4>
          <div className="p-3 bg-slate-900 text-white rounded-xl space-y-2 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-1 text-slate-400 text-[10px]">
              <span>PRODUCT</span><span>QTY x PRICE</span><span>TOTAL</span>
            </div>
            <div className="flex justify-between">
              <span>Coca Cola 500ml</span><span>2 x ₹40</span><span>₹80</span>
            </div>
            <div className="flex justify-between">
              <span>Lays Classic Chips 50g</span><span>3 x ₹20</span><span>₹60</span>
            </div>
            <div className="flex justify-between">
              <span>Dove Bath Soap 100g</span><span>1 x ₹65</span><span>₹65</span>
            </div>
          </div>
        </div>

        {/* Subtotals & Total */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 font-medium">
          <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>₹205.00</span></div>
          <div className="flex justify-between text-slate-600"><span>Taxes (GST 18%):</span><span>₹36.90</span></div>
          <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-200 pt-1.5">
            <span>Total Paid:</span><span className="text-emerald-600">{transaction.amount}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button
            variant="outline"
            size="sm"
            icon={Printer}
            onClick={() => {
              toast.info('Printing Receipt', `Sending invoice #${transaction.id} to POS thermal printer.`);
            }}
          >
            Print Receipt
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Close Invoice
          </Button>
        </div>
      </div>
    </Modal>
  );
}
