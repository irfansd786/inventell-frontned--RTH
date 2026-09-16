import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Plus, CheckCircle2 } from 'lucide-react';
import { createProduct } from '../../services/productService';

export default function AddProductModal({ isOpen, onClose, onProductCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Beverages',
    brand: '',
    price: '',
    cost: '',
    storeStock: '',
    warehouseStock: '',
    reorderLevel: '30',
    supplier: 'ABC Distributors',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) return;

    const created = await createProduct({
      ...formData,
      price: Number(formData.price || 0),
      cost: Number(formData.cost || 0),
      storeStock: Number(formData.storeStock || 0),
      warehouseStock: Number(formData.warehouseStock || 0),
      reorderLevel: Number(formData.reorderLevel || 30),
    });

    if (onProductCreated) onProductCreated(created);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product to Catalog">
      <form onSubmit={handleSubmit} className="space-y-3 text-xs">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
          <input
            type="text"
            required
            placeholder="e.g. Sprite 500ml Can"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">SKU</label>
            <input
              type="text"
              placeholder="BEV-003"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
            >
              <option value="Beverages">Beverages</option>
              <option value="Snacks">Snacks</option>
              <option value="Food">Food</option>
              <option value="Personal Care">Personal Care</option>
              <option value="Household">Household</option>
              <option value="Dairy">Dairy</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Selling Price (₹)</label>
            <input
              type="number"
              required
              placeholder="40"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Cost Price (₹)</label>
            <input
              type="number"
              placeholder="28"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Store Stock</label>
            <input
              type="number"
              placeholder="50"
              value={formData.storeStock}
              onChange={(e) => setFormData({ ...formData, storeStock: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Initial Warehouse Stock</label>
            <input
              type="number"
              placeholder="100"
              value={formData.warehouseStock}
              onChange={(e) => setFormData({ ...formData, warehouseStock: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" icon={CheckCircle2}>
            Create Product
          </Button>
        </div>
      </form>
    </Modal>
  );
}
