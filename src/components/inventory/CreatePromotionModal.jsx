import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Tag, Sparkles, CheckCircle2, AlertCircle, Calendar, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { approveRecommendation, launchRecommendation } from '../../services/recommendationService';

export default function CreatePromotionModal({ product, isOpen, onClose, onApproved }) {
  const { toast } = useToast();
  const initialDiscount = product?.aiRecommendation?.discount_pct || 15;
  const [discount, setDiscount] = useState(initialDiscount);
  const [duration, setDuration] = useState('14 Days (Standard)');
  const [objective, setObjective] = useState(
    product?.aiRecommendation?.expected_objective || 'Liquidate Idle Capital & Free Shelf Space'
  );
  const [strategy, setStrategy] = useState(
    product?.aiRecommendation?.strategy === 'Bundle' ? 'Bundle Offer' : 'Clearance Markdown'
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const originalPrice = product.price || 0;
  const promotionalPrice = Math.max(0, originalPrice * (1 - discount / 100));
  const storeStock = product.storeStock ?? product.store_stock ?? 0;
  const capitalTiedUp = storeStock * originalPrice;

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      if (product.recId) {
        await approveRecommendation(product.recId);
        await launchRecommendation(product.recId).catch(() => {});
      }
      toast.success(
        'Promotion Approved & Launched',
        `${discount}% markdown approved and launched for "${product.name}". New promotional price: ${formatINR(
          promotionalPrice,
          2
        )}.`,
        4500
      );
      if (onApproved) {
        await onApproved(product, {
          discount,
          promotionalPrice,
          duration,
          strategy,
          objective,
          notes,
        });
      }
      onClose();
    } catch (err) {
      console.error('Failed to approve promotion:', err);
      toast.error('Approval Error', err?.message || 'Unable to approve promotion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Inventory Action: ${product.name}`}
      maxWidth="max-w-xl"
    >
      <div className="space-y-4 text-xs">
        {/* Product Snapshot Bar */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                {product.name}
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                {product.riskType || 'Clearance Candidate'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
              <span>{product.sku}</span>
              <span>•</span>
              <span>{product.category}</span>
              {product.barcode && (
                <>
                  <span>•</span>
                  <span>{product.barcode}</span>
                </>
              )}
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-700 sm:pl-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tied-Up Capital</span>
            <span className="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
              {formatINR(capitalTiedUp, 0)}
            </span>
            <span className="text-[10px] text-slate-400 block">({storeStock} pcs store stock)</span>
          </div>
        </div>

        {/* Explainable AI Rationale */}
        <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-300 font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI Clearance Rationale
          </div>
          <p className="text-[11px] text-indigo-950 dark:text-indigo-200 leading-relaxed">
            {product.aiRecommendation?.reason ||
              `Zero or sluggish sales velocity in recent period with ${storeStock} units in store. Markdown will accelerate turnover without incurring storage decay.`}
          </p>
        </div>

        {/* Pricing & Discount Interactive Calculator */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Configure Promotional Markdown (%)
            </span>
            <span className="font-mono font-black text-sm text-indigo-600 dark:text-indigo-400">
              {discount}% OFF
            </span>
          </div>

          {/* Quick preset discount pills */}
          <div className="flex items-center gap-2">
            {[5, 10, 15, 20, 25].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setDiscount(pct)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                  discount === pct
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {pct}%
              </button>
            ))}
          </div>

          {/* Price Before & After Calculation */}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Current Base Price</span>
              <span className="text-sm font-extrabold text-slate-600 dark:text-slate-300 font-mono line-through">
                {formatINR(originalPrice, 2)}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold">
                New Promotional Price
              </span>
              <span className="text-base font-black text-emerald-900 dark:text-emerald-300 font-mono">
                {formatINR(promotionalPrice, 2)}
              </span>
            </div>
          </div>
        </div>

        {/* Campaign Settings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Promotion Strategy
            </label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="Clearance Markdown">Clearance Markdown</option>
              <option value="Bundle Offer">Bundle with Fast Mover</option>
              <option value="Buy-More-Save-More">Buy 2 Get 15% Off</option>
              <option value="Featured Shelf Talker">Featured Shelf Placement</option>
              <option value="Flash Weekend Sale">Flash Weekend Sale</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Campaign Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="7 Days (Flash Clearance)">7 Days (Flash Clearance)</option>
              <option value="14 Days (Standard)">14 Days (Standard)</option>
              <option value="30 Days (Extended Clearance)">30 Days (Extended Clearance)</option>
              <option value="Until Depleted">Until Stock Depleted</option>
            </select>
          </div>
        </div>

        {/* Manager Approval Notes */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
            Manager Authorization Notes (Optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Authorized under seasonal inventory clearance mandate..."
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={isSubmitting ? RefreshCw : ShieldCheck}
            onClick={handleApprove}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? 'Approving & Launching...' : 'Approve & Launch Promotion'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
