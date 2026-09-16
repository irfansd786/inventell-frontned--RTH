// Inventory service — API-first. Backend: GET /api/inventory/*
import { apiGet, apiPost } from './api';
import { getDeterministicBarcode } from '../utils/productIntelligence';

export async function getInventoryOverview() {
  const [summaryRaw, lowStockRaw, invListRaw, revenueRaw] = await Promise.all([
    apiGet('/inventory/summary').catch(() => ({})),
    apiGet('/inventory/low-stock').catch(() => []),
    apiGet('/inventory').catch(() => []),
    apiGet('/sales/revenue?range=30d').catch(() => ({ points: [] })),
  ]);

  const summary = summaryRaw && typeof summaryRaw === 'object' && !Array.isArray(summaryRaw) ? summaryRaw : {};
  const lowStock = Array.isArray(lowStockRaw) ? lowStockRaw : lowStockRaw?.items || lowStockRaw?.data || [];
  // Backend may return { items: [...] } / { data: [...] } or a plain array.
  const invList = Array.isArray(invListRaw) ? invListRaw : invListRaw?.items || invListRaw?.data || [];

  const totalSKUs = invList.length;
  const healthyCount = summary.healthy ?? invList.filter((i) => i.status === 'Healthy').length;
  const lowCount = summary.low_stock ?? invList.filter((i) => i.status === 'Low').length;
  const criticalCount = summary.critical ?? invList.filter((i) => i.status === 'Critical').length;
  const outOfStockCount = summary.out_of_stock ?? invList.filter((i) => i.status === 'Out of Stock').length;
  const totalUnits = (summary.store_stock || 0) + (summary.warehouse_stock || 0) || invList.reduce((acc, i) => acc + (i.store_stock || 0) + (i.warehouse_stock || 0), 0);
  const invVal = summary.inventory_value || invList.reduce((acc, i) => acc + ((i.store_stock || 0) + (i.warehouse_stock || 0)) * (i.price || 0), 0);

  const products = (invList || []).map((inv) => {
    const prodId = inv.product_id || inv.id;
    const skuCode = inv.sku || `SKU-${prodId}`;
    const barcode = inv.barcode || getDeterministicBarcode(skuCode, prodId);
    return {
      id: prodId,
      sku: skuCode,
      name: inv.name || `Product #${prodId}`,
      category: inv.category || 'General Merchandise',
      department: inv.department || null,
      storeStock: inv.store_stock ?? 0,
      warehouseStock: inv.warehouse_stock ?? 0,
      totalStock: inv.total_stock ?? ((inv.store_stock || 0) + (inv.warehouse_stock || 0)),
      reorderLevel: inv.reorder_level ?? 20,
      status: inv.status || 'Healthy',
      severity: inv.severity || (inv.status === 'Critical' ? 'Critical' : inv.status === 'Low Stock' || inv.status === 'Low' ? 'High' : 'Low'),
      price: inv.price || 0,
      costPrice: inv.cost_price || 0,
      unitsSold: inv.units_sold || 0,
      revenue: inv.revenue || 0,
      salesVelocity: inv.sales_velocity !== undefined ? inv.sales_velocity : null,
      daysOfStock: inv.days_of_stock !== undefined ? inv.days_of_stock : null,
      demandRisk: inv.demand_risk || 'Low',
      recommendedReplenishment: inv.recommended_replenishment || Math.max(0, (inv.reorder_level || 20) * 2 - (inv.store_stock || 0)),
      barcode: barcode,
      hasDemandData: inv.has_demand_data ?? false,
    };
  });

  const health = [
    { name: 'Healthy', value: healthyCount, color: '#10B981' },
    { name: 'Low Stock', value: lowCount, color: '#F59E0B' },
    { name: 'Critical', value: criticalCount, color: '#EF4444' },
    { name: 'Out of Stock', value: outOfStockCount, color: '#64748B' },
  ];

  const movement = (() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const buckets = days.map((day) => ({ day, bills: 0, revenue: 0 }));
    const points = revenueRaw?.points || [];
    points.forEach((p) => {
      const d = new Date(p.date || p.label);
      if (Number.isNaN(d.getTime())) return;
      const idx = (d.getDay() + 6) % 7;
      buckets[idx].bills += p.orders || 0;
      buckets[idx].revenue += p.revenue || 0;
    });
    return buckets;
  })();

  const categories = Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort();

  return {
    kpis: {
      totalProducts: totalSKUs,
      totalUnits: totalUnits,
      inventoryValue: invVal,
      healthyStockCount: healthyCount,
      lowStockCount: lowCount,
      criticalCount: criticalCount,
      outOfStockCount: outOfStockCount,
    },
    health,
    movement,
    products,
    categories,
    summary,
    lowStock,
  };
}

export async function getInventorySummary() {
  return apiGet('/inventory/summary');
}

export async function getInventoryList(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiGet(`/inventory${qs ? `?${qs}` : ''}`);
}

export async function getLowStock(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const raw = await apiGet(`/inventory/low-stock${qs ? `?${qs}` : ''}`).catch(() => []);
  const items = Array.isArray(raw) ? raw : raw?.items || raw?.data || [];

  return items.map((item) => {
    const prodId = item.product_id || item.id;
    const sku = item.sku || `SKU-${prodId}`;
    const barcode = item.barcode || getDeterministicBarcode(sku, prodId);
    return {
      id: prodId,
      productId: prodId,
      name: item.name || `Product #${prodId}`,
      sku,
      category: item.category || 'General Merchandise',
      department: item.department || null,
      price: item.price || 0,
      costPrice: item.cost_price || 0,
      storeStock: item.store_stock ?? item.storeStock ?? 0,
      warehouseStock: item.warehouse_stock ?? item.warehouseStock ?? 0,
      totalStock: item.total_stock ?? item.totalStock ?? ((item.store_stock || 0) + (item.warehouse_stock || 0)),
      reorderLevel: item.reorder_level ?? item.reorderLevel ?? 20,
      status: item.status || 'Healthy',
      severity: item.severity || 'Medium',
      riskType: item.risk_type || item.riskType || (item.store_stock <= 0 ? 'Out of Stock' : item.store_stock <= 10 ? 'Critical' : 'Low Stock'),
      demandLevel: item.demand_level || item.demandLevel || 'Medium Demand',
      demandRisk: item.demand_risk || item.demandRisk || 'Medium',
      unitsSold: item.units_sold ?? item.unitsSold ?? 0,
      revenue: item.revenue || 0,
      salesVelocity: item.sales_velocity !== undefined ? item.sales_velocity : item.salesVelocity,
      daysOfStock: item.days_of_stock !== undefined ? item.days_of_stock : item.daysOfStock,
      recommendedReplenishment: item.recommended_replenishment ?? item.recommendedReplenishment ?? 25,
      barcode,
      inventoryValue: item.inventory_value ?? item.inventoryValue ?? (((item.store_stock || 0) + (item.warehouse_stock || 0)) * (item.price || 0)),
      storeValue: item.store_value ?? item.storeValue ?? ((item.store_stock || 0) * (item.price || 0)),
      aiRecommendation: item.ai_recommendation || item.aiRecommendation || null,
      hasDemandData: item.has_demand_data ?? item.hasDemandData ?? false,
    };
  });
}

export async function getCriticalStock() {
  return apiGet('/inventory/critical');
}

export async function getInventoryByProduct(productId) {
  return apiGet(`/inventory/${productId}`);
}

export async function replenishStock(productId, quantity, source = 'warehouse') {
  return apiPost('/inventory/replenish', { product_id: productId, quantity, source });
}
