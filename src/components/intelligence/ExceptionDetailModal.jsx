import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  ShieldCheck,
  Package,
  ShoppingCart,
  User,
  Layers,
  FileText,
} from 'lucide-react';
import Modal from '../common/Modal';

export default function ExceptionDetailModal({
  isOpen,
  onClose,
  exception,
  onSaveStatus,
  onResolve,
}) {
  const navigate = useNavigate();
  const [currentStatus, setCurrentStatus] = useState('Open');
  const [assignedAssociate, setAssignedAssociate] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    if (exception) {
      setCurrentStatus(exception.status || 'Open');
      setAssignedAssociate(exception.assignedTo || 'Unassigned');
      setResolutionNotes('');
    }
  }, [exception]);

  if (!exception) return null;

  const isCrit = exception.priority === 'Critical';
  const isHigh = exception.priority === 'High';
  const isResolved = currentStatus === 'Resolved';

  const priorityBadgeClass = isCrit
    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50'
    : isHigh
    ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50'
    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';

  const handleQuickResolve = () => {
    onResolve(exception.id);
    onClose();
  };

  const handleUpdate = () => {
    onSaveStatus(exception.id, currentStatus, assignedAssociate, resolutionNotes);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Exception: ${exception.id}`} maxWidth="max-w-2xl">
      <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${priorityBadgeClass}`}>
              {exception.priority}
            </span>
            <span className="px-2 py-0.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded text-[11px] font-semibold">
              {exception.module} Module
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
              {exception.type}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {exception.detectedAt || 'Recent'}
            </span>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
              isResolved
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : currentStatus === 'In Progress'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
            }`}>
              {currentStatus}
            </span>
          </div>
        </div>

        {/* Product & Order Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Related Product / SKU
            </span>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                {exception.product}
              </span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded font-bold">
                {exception.sku}
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Order Reference
            </span>
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-slate-400" />
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-xs">
                {exception.orderId || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Quantities & Shortfall Comparison */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Required Qty
            </span>
            <span className="text-base font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
              {exception.requiredQty ?? exception.systemCount ?? '—'}
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg text-center">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">
              Available Qty
            </span>
            <span className="text-base font-black font-mono text-slate-900 dark:text-slate-100 mt-0.5 block">
              {exception.availableQty ?? exception.physicalCount ?? '—'}
            </span>
          </div>

          <div className={`p-2.5 rounded-lg text-center border ${
            (exception.shortfall || 0) < 0
              ? 'bg-red-50/70 dark:bg-red-950/30 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200'
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200'
          }`}>
            <span className="text-[10px] font-bold uppercase tracking-wider block">
              Shortfall
            </span>
            <span className="text-base font-black font-mono mt-0.5 block">
              {exception.shortfall !== undefined ? `${exception.shortfall} units` : (exception.discrepancy || '0')}
            </span>
          </div>
        </div>

        {/* Route / Locations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Source Staging</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{exception.source || exception.location}</p>
          </div>

          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>Destination</span>
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{exception.destination || 'Primary Outbound Staging'}</p>
          </div>
        </div>

        {/* Impact Callout */}
        {exception.impact && (
          <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 dark:text-amber-300 block text-[11px] font-bold uppercase tracking-wider">
                Operational & Fulfillment Impact
              </strong>
              <p className="text-amber-950 dark:text-amber-200/90 text-xs mt-0.5 font-medium">
                {exception.impact}
              </p>
            </div>
          </div>
        )}

        {/* Suggested Resolution */}
        <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-lg space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Suggested Operating Resolution</span>
          </div>
          <p className="text-emerald-950 dark:text-emerald-200 text-xs font-medium leading-relaxed">
            {exception.suggestedResolution || exception.notes}
          </p>
        </div>

        {/* Manage Assignee & Status */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
          <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider">
            Workflow Status & Floor Assignment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Investigation Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200"
              >
                <option value="Open">Open (Pending Review)</option>
                <option value="In Progress">In Progress (Active Floor Audit)</option>
                <option value="Resolved">Resolved (Audit Completed)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Assigned Floor Lead
              </label>
              <input
                type="text"
                value={assignedAssociate}
                onChange={(e) => setAssignedAssociate(e.target.value)}
                placeholder="Assignee name..."
                className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Add Resolution Log / Audit Note
            </label>
            <input
              type="text"
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Physical stock verified in adjacent bin; replenishment triggered..."
              className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {exception.orderId && (
              <button
                onClick={() => {
                  onClose();
                  navigate('/orders');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-slate-400" />
                <span>View Order</span>
              </button>
            )}

            {exception.relatedPath && (
              <button
                onClick={() => {
                  onClose();
                  navigate(exception.relatedPath);
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5"
              >
                <span>View Module</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </button>
            )}

            <button
              onClick={handleUpdate}
              className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-lg text-xs transition-colors"
            >
              Save Updates
            </button>

            {!isResolved && (
              <button
                onClick={handleQuickResolve}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Resolve Exception</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
