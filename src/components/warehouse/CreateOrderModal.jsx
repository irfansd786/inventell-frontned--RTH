import React, { useState, useEffect } from 'react';
import {
  X,
  Package,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building2,
  Store,
} from 'lucide-react';
import { masterProducts } from '../../data/productsData';
import { formatINR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';
import { createOrder } from '../../services/orderService';
import { STORE_INFO } from '../../utils/constants';

export default function CreateOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
  initialProduct = null,
  initialQuantity = 50,
  initialType = 'Replenishment',
}) {
  const { toast } = useToast();

  const [orderType, setOrderType] = useState(initialType);
  const [source, setSource] = useState('Central Warehouse');
  const [destination, setDestination] = useState(STORE_INFO.name || 'Main Street Store');
  const [priority, setPriority] = useState('Normal');
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Line items state
  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id || initialProduct?.sku || masterProducts[0]?.sku || 'BEV-001'
  );
  const [quantity, setQuantity] = useState(initialQuantity);
  const [items, setItems] = useState([]);

  // Sync initial product if provided
  useEffect(() => {
    if (initialProduct) {
      const match = masterProducts.find(
        (p) => p.sku === initialProduct.sku || p.id === initialProduct.id || p.name === initialProduct.name
      ) || masterProducts[0];

      setSelectedProductId(match.sku);
      setQuantity(initialQuantity || 50);
      setOrderType(initialType || 'Replenishment');
      setItems([
        {
          sku: match.sku,
          product: match.name,
          barcode: match.barcode,
          requested: initialQuantity || 50,
          unitPrice: match.price,
          storeStock: match.storeStock,
          warehouseStock: match.warehouseStock,
          subtotal: (initialQuantity || 50) * match.price,
        },
      ]);
    } else if (items.length === 0) {
      const defaultProd = masterProducts[0];
      setItems([
        {
          sku: defaultProd.sku,
          product: defaultProd.name,
          barcode: defaultProd.barcode,
          requested: 40,
          unitPrice: defaultProd.price,
          storeStock: defaultProd.storeStock,
          warehouseStock: defaultProd.warehouseStock,
          subtotal: 40 * defaultProd.price,
        },
      ]);
    }
  }, [initialProduct, initialQuantity, initialType]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentSelectedProd = masterProducts.find((p) => p.sku === selectedProductId) || masterProducts[0];

  const handleAddItem = () => {
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      toast.error('Invalid Quantity', 'Please enter a valid quantity greater than 0.');
      return;
    }

    const existingIdx = items.findIndex((it) => it.sku === currentSelectedProd.sku);
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].requested += qty;
      updated[existingIdx].subtotal = updated[existingIdx].requested * updated[existingIdx].unitPrice;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          sku: currentSelectedProd.sku,
          product: currentSelectedProd.name,
          barcode: currentSelectedProd.barcode,
          requested: qty,
          unitPrice: currentSelectedProd.price,
          storeStock: currentSelectedProd.storeStock,
          warehouseStock: currentSelectedProd.warehouseStock,
          subtotal: qty * currentSelectedProd.price,
        },
      ]);
    }

    toast.success('Item Added', `${currentSelectedProd.name} (${qty} units) added to order draft.`);
  };

  const handleRemoveItem = (sku) => {
    setItems(items.filter((it) => it.sku !== sku));
  };

  const totalUnits = items.reduce((sum, it) => sum + it.requested, 0);
  const totalValue = items.reduce((sum, it) => sum + it.subtotal, 0);

  // Check if any item has insufficient warehouse reserve
  const hasShortfall = items.some((it) => it.requested > it.warehouseStock);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('No Items', 'Please add at least one line item to the order.');
      return;
    }

    setSaving(true);
    try {
      const dateFormatted = new Date(expectedDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });

      const orderPayload = {
        type: orderType,
        source,
        destination,
        priority,
        expectedDate: dateFormatted,
        notes,
        status: 'Pending',
        items,
      };

      const created = await createOrder(orderPayload);
      toast.success('Order Created', `Order ${created.id} created successfully.`);
      if (onOrderCreated) {
        onOrderCreated(created);
      }
      onClose();
    } catch {
      toast.error('Creation Failed', 'Unable to create order. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-[2px] animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase block">
              RETAIL WAREHOUSE FULFILLMENT
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              Create Fulfillment Order
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Top row: Type, Priority, Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Order Type
              </label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                <option value="Replenishment">Replenishment</option>
                <option value="Transfer">Transfer</option>
                <option value="Customer Order">Customer Order</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Expected Date
              </label>
              <input
                type="date"
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Locations Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Source Location
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                <option value="Central Warehouse">Central Warehouse</option>
                <option value="Main Street Store">Main Street Store</option>
                <option value="Regional Distribution Hub">Regional Distribution Hub</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Destination Location
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
              >
                <option value="Main Street Store">Main Street Store</option>
                <option value="Sector 18 Store">Sector 18 Store</option>
                <option value="Direct Customer Delivery">Direct Customer Delivery</option>
              </select>
            </div>
          </div>

          {/* Add Product Section */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2.5">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Add Products from Retail Catalog
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
              <div className="sm:col-span-6">
                <label className="block text-[10px] text-slate-500 mb-0.5">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none cursor-pointer"
                >
                  {masterProducts.map((p) => (
                    <option key={p.sku} value={p.sku}>
                      {p.name} ({p.sku}) — {formatINR(p.price, 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-[10px] text-slate-500 mb-0.5">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>
            </div>

            {/* Selected Product Stock Intelligence Pill */}
            {currentSelectedProd && (
              <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-md grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Barcode</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {currentSelectedProd.barcode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Store Stock</span>
                  <span
                    className={`font-mono font-bold ${
                      currentSelectedProd.storeStock === 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {currentSelectedProd.storeStock} pcs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Warehouse Reserve</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                    {currentSelectedProd.warehouseStock} pcs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Daily Velocity</span>
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                    {currentSelectedProd.dailySalesAvg} pcs/day
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Order Line Items ({items.length})
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                Total: {totalUnits} units • {formatINR(totalValue, 2)}
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2 px-3">Product</th>
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3 text-right">Quantity</th>
                    <th className="py-2 px-3 text-right">Unit Price</th>
                    <th className="py-2 px-3 text-right">Subtotal</th>
                    <th className="py-2 px-3 text-center w-10">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((it) => (
                    <tr key={it.sku} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {it.product}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{it.sku}</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {it.requested}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-slate-600 dark:text-slate-400">
                        {formatINR(it.unitPrice, 2)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatINR(it.subtotal, 2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.sku)}
                          className="text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Shortfall warning */}
          {hasShortfall && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Inventory Shortfall Warning</span>
                <span className="text-[11px] opacity-90">
                  One or more line items request quantities greater than current warehouse reserve. Supplier purchase
                  order or staggered fulfillment will be required.
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Operational Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add fulfillment instructions, bay allocations, or delivery notes..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || items.length === 0}
              className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-bold transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
            >
              {saving ? 'Creating Order…' : 'Confirm & Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
