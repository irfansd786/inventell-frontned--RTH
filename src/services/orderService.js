import { apiGet, apiPost, apiPut } from './api';
import { orderKpis, masterOrdersList, sampleOrderDetails } from '../data/ordersData';

const LOCAL_ORDERS_KEY = 'invintell_custom_orders';

function getLocalOrders() {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // If cache is from older 12-order test, invalidate and reseed from masterOrdersList (120 orders, 100 today)
    if (!Array.isArray(parsed) || parsed.length < 100) {
      localStorage.removeItem(LOCAL_ORDERS_KEY);
      return [];
    }
    return parsed;
  } catch {
    return [];
  }
}

function saveLocalOrders(orders) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('invintell_orders_updated', { detail: orders }));
    }
  } catch {
    /* ignore */
  }
}

function normalizeOrdersList(rawList) {
  const seen = new Set();
  const list = [];
  for (const ord of rawList) {
    if (!ord || !ord.id || seen.has(ord.id)) continue;
    seen.add(ord.id);

    const items = (ord.items || []).map((it) => {
      const requested = Number(it.requested || it.quantity || 0);
      const allocated = Number(it.allocated || 0);
      const picked = Number(it.picked || 0);
      const isPostPack = ['Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(ord.status);
      const packed = Number(it.packed !== undefined ? it.packed : isPostPack ? (picked || allocated || requested) : 0);

      return {
        ...it,
        requested,
        allocated,
        picked,
        packed,
        warehouseStock: Number(it.warehouseStock !== undefined ? it.warehouseStock : 50),
        storeStock: Number(it.storeStock || 0),
        unitPrice: Number(it.unitPrice || it.price || 50),
        subtotal: Number(it.subtotal || requested * (it.unitPrice || it.price || 50)),
      };
    });

    const itemsCount = items.length;
    const totalUnits = items.reduce((s, it) => s + it.requested, 0);
    const totalAmount = items.reduce((s, it) => s + (it.subtotal || 0), 0);

    list.push({
      ...ord,
      items,
      itemsCount,
      totalUnits,
      totalAmount,
    });
  }
  return list;
}

function getUnifiedOrders() {
  const custom = getLocalOrders();
  const baseList = custom.length >= 100 ? custom : masterOrdersList;
  return normalizeOrdersList(baseList);
}

export async function getOrdersData(params = {}) {
  try {
    const qs = new URLSearchParams(params).toString();
    const raw = await apiGet(`/orders${qs ? `?${qs}` : ''}`);
    const rows = Array.isArray(raw) ? raw : raw?.items || raw?.data || raw?.orders || [];
    
    const custom = getLocalOrders();
    // Prefer full datasets (100+ orders)
    const baseList = custom.length >= 100 ? custom : (rows.length >= 100 ? rows : [...masterOrdersList]);
    const list = normalizeOrdersList(baseList);

    const todayOrders = list.filter((o) => o.createdAt?.startsWith('2026-09-09') || o.dateLabel?.includes('09 Sep 2026'));
    const pending = list.filter((o) => ['pending', 'draft', 'confirmed'].includes((o.status || '').toLowerCase())).length;
    const processing = list.filter((o) => ['allocated', 'partially allocated', 'picking', 'ready for picking', 'packing', 'ready for packing', 'packed', 'ready for dispatch'].includes((o.status || '').toLowerCase())).length;
    const completed = list.filter((o) => ['dispatched', 'delivered'].includes((o.status || '').toLowerCase())).length;
    const atRisk = list.filter((o) => (o.status || '').toLowerCase() === 'at risk' || o.isAtRisk).length;

    return {
      kpis: {
        total: list.length,
        today: todayOrders.length,
        pending,
        processing,
        inProgress: processing,
        completed,
        atRisk,
        dispatchedToday: completed,
      },
      orders: list,
      sampleDetail: list[0] || sampleOrderDetails,
    };
  } catch {
    const custom = getLocalOrders();
    const list = normalizeOrdersList(custom.length >= 100 ? custom : [...masterOrdersList]);
    const todayOrders = list.filter((o) => o.createdAt?.startsWith('2026-09-09') || o.dateLabel?.includes('09 Sep 2026'));
    const pending = list.filter((o) => ['pending', 'draft', 'confirmed'].includes((o.status || '').toLowerCase())).length;
    const processing = list.filter((o) => ['allocated', 'partially allocated', 'picking', 'ready for picking', 'packing', 'ready for packing', 'packed', 'ready for dispatch'].includes((o.status || '').toLowerCase())).length;
    const completed = list.filter((o) => ['dispatched', 'delivered'].includes((o.status || '').toLowerCase())).length;
    const atRisk = list.filter((o) => (o.status || '').toLowerCase() === 'at risk' || o.isAtRisk).length;

    return {
      kpis: {
        total: list.length,
        today: todayOrders.length,
        pending,
        processing,
        inProgress: processing,
        completed,
        atRisk,
        dispatchedToday: completed,
      },
      orders: list,
      sampleDetail: list[0] || sampleOrderDetails,
    };
  }
}

export async function getTodayOrdersCount() {
  const result = await getOrdersData();
  const list = result.orders || [];
  return list.filter((o) => o.createdAt?.startsWith('2026-09-09') || o.dateLabel?.includes('09 Sep 2026')).length;
}

export async function getOrderById(orderId) {
  try {
    const custom = getLocalOrders();
    const found = custom.find((o) => o.id === orderId) || masterOrdersList.find((o) => o.id === orderId);
    if (found) return found;
    return await apiGet(`/orders/${orderId}`);
  } catch {
    return sampleOrderDetails;
  }
}

export async function createOrder(payload) {
  const newId = `ORD-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const now = new Date();
  const dateLabel = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const items = payload.items || [];
  const itemsCount = items.length;
  const totalUnits = items.reduce((sum, it) => sum + (Number(it.requested || it.quantity) || 0), 0);
  const totalAmount = items.reduce((sum, it) => sum + (Number(it.subtotal) || (Number(it.unitPrice || it.price || 0) * Number(it.requested || it.quantity || 0))), 0);

  const orderRecord = {
    id: payload.id || newId,
    createdAt: now.toISOString(),
    dateLabel,
    type: payload.type || 'Replenishment',
    source: payload.source || 'Central Warehouse',
    destination: payload.destination || 'Main Street Store',
    priority: payload.priority || 'Normal',
    status: payload.status || 'Pending',
    expectedDate: payload.expectedDate || 'Within 48h',
    picker: 'Unassigned',
    packer: 'Unassigned',
    notes: payload.notes || '',
    isAtRisk: false,
    items: items.map((it) => ({
      product: it.product || it.name || 'Standard Retail SKU',
      sku: it.sku || 'SKU-000',
      barcode: it.barcode || '890000000000',
      requested: Number(it.requested || it.quantity) || 10,
      allocated: 0,
      picked: 0,
      unitPrice: Number(it.unitPrice || it.price) || 50,
      storeStock: Number(it.storeStock) || 0,
      warehouseStock: Number(it.warehouseStock) || 50,
      subtotal: (Number(it.requested || it.quantity) || 10) * (Number(it.unitPrice || it.price) || 50),
    })),
    itemsCount,
    totalUnits,
    totalAmount,
  };

  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  list.unshift(orderRecord);
  saveLocalOrders(list);

  try {
    await apiPost('/orders', {
      customer_id: null,
      items: orderRecord.items.map((it) => ({ product_id: 1, quantity: it.requested })),
    });
  } catch {
    /* ignore backend network failure */
  }

  return orderRecord;
}

export async function transitionOrder(orderId, action) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const idx = list.findIndex((o) => o.id === orderId);
  let updatedStatus = 'Updated';

  const actionMap = {
    confirm: 'Confirmed',
    allocate: 'Allocated',
    'start-picking': 'Picking',
    'complete-picking': 'Packed',
    pack: 'Packed',
    dispatch: 'Dispatched',
    deliver: 'Delivered',
    cancel: 'Cancelled',
  };

  updatedStatus = actionMap[action] || action;

  if (idx >= 0) {
    list[idx].status = updatedStatus;
    if (updatedStatus === 'Allocated') {
      list[idx].items = list[idx].items.map((it) => ({ ...it, allocated: it.requested }));
    } else if (updatedStatus === 'Picking') {
      list[idx].items = list[idx].items.map((it) => ({ ...it, picked: Math.round(it.requested / 2) }));
    } else if (updatedStatus === 'Packed') {
      list[idx].items = list[idx].items.map((it) => ({ ...it, picked: it.requested }));
    }
    saveLocalOrders(list);
  }

  try {
    await apiPost(`/orders/${orderId}/${action}`, {});
  } catch {
    /* ignore */
  }

  return { id: orderId, action, status: updatedStatus };
}

export async function updateOrderStatus(orderId, status) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const idx = list.findIndex((o) => o.id === orderId);
  if (idx >= 0) {
    list[idx].status = status;
    saveLocalOrders(list);
  }
  try {
    return await apiPut(`/orders/${orderId}/status`, { status });
  } catch {
    return { id: orderId, status };
  }
}

/**
 * Allocate specific quantity for an order line item
 */
export async function allocateOrderItem(orderId, sku, quantityToAllocate) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];
  const itemIdx = order.items.findIndex((it) => it.sku === sku);
  if (itemIdx < 0) return null;

  const item = order.items[itemIdx];
  const qty = Math.min(Number(quantityToAllocate), item.warehouseStock || 0);

  // Reserve warehouse stock and record allocation
  item.warehouseStock = Math.max(0, (item.warehouseStock || 0) - qty);
  item.allocated = (item.allocated || 0) + qty;

  // Check order completion status
  const allFullyAllocated = order.items.every((it) => (it.allocated || 0) >= it.requested);
  const anyAllocated = order.items.some((it) => (it.allocated || 0) > 0);

  if (allFullyAllocated) {
    order.status = 'Ready for Picking';
    order.isAtRisk = false;
  } else if (anyAllocated) {
    order.status = 'Partially Allocated';
  }

  saveLocalOrders(list);
  return { order, item, allocatedQty: qty };
}

/**
 * Send an allocated order to the picking floor
 */
export async function sendOrderToPicking(orderId) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  list[orderIdx].status = 'Ready for Picking';
  list[orderIdx].picker = list[orderIdx].picker === 'Unassigned' ? 'Ramesh K.' : list[orderIdx].picker;
  saveLocalOrders(list);

  try {
    await apiPost(`/orders/${orderId}/start-picking`, {});
  } catch {
    /* ignore */
  }

  return list[orderIdx];
}

/**
 * Record picking quantity for a specific SKU in an order
 */
export async function pickOrderItem(orderId, sku, quantityToPick) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];
  const itemIdx = order.items.findIndex((it) => it.sku === sku);
  if (itemIdx < 0) return null;

  const item = order.items[itemIdx];
  const maxPickable = item.allocated || item.requested || 0;
  const qty = Math.min(Number(quantityToPick), maxPickable);
  item.picked = qty;

  // Determine order status
  const allPicked = order.items.every((it) => (it.picked || 0) >= (it.allocated || it.requested || 0));
  const somePicked = order.items.some((it) => (it.picked || 0) > 0);

  if (allPicked) {
    order.status = 'Ready for Packing';
  } else if (somePicked) {
    order.status = 'Partially Picked';
  } else {
    order.status = 'Picking';
  }

  saveLocalOrders(list);
  return { order, item, pickedQty: qty };
}

/**
 * Complete picking for an entire order
 */
export async function markOrderPicked(orderId) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];
  order.items = order.items.map((it) => ({
    ...it,
    picked: it.allocated || it.requested,
  }));
  order.status = 'Ready for Packing';
  order.picker = order.picker === 'Unassigned' ? 'Ramesh K.' : order.picker;

  saveLocalOrders(list);

  try {
    await apiPost(`/orders/${orderId}/complete-picking`, {});
  } catch {
    /* ignore */
  }

  return order;
}

/**
 * Record packing quantity for a specific SKU in an order
 */
export async function packOrderItem(orderId, sku, quantityToPack, packageInfo = {}) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];
  const itemIdx = order.items.findIndex((it) => it.sku === sku);
  if (itemIdx < 0) return null;

  const item = order.items[itemIdx];
  const maxPackable = item.picked || item.allocated || 0;
  const qty = Math.min(Number(quantityToPack), maxPackable);
  item.packed = qty;

  if (packageInfo.packageCount) order.packageCount = packageInfo.packageCount;
  if (packageInfo.boxType) order.boxType = packageInfo.boxType;

  // Determine order status
  const allPacked = order.items.every((it) => (it.packed || 0) >= (it.picked || it.allocated || 0));
  const somePacked = order.items.some((it) => (it.packed || 0) > 0);

  if (allPacked) {
    order.status = 'Ready for Dispatch';
  } else if (somePacked) {
    order.status = 'Partially Packed';
  } else {
    order.status = 'Packing';
  }

  saveLocalOrders(list);
  return { order, item, packedQty: qty };
}

/**
 * Complete packing for an entire order
 */
export async function markOrderPacked(orderId, packageInfo = {}) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];
  order.items = order.items.map((it) => ({
    ...it,
    packed: it.picked || it.allocated || it.requested,
  }));
  order.status = 'Ready for Dispatch';
  order.packer = order.packer === 'Unassigned' ? 'Sunita P.' : order.packer;
  order.packageCount = packageInfo.packageCount || order.packageCount || 2;
  order.boxType = packageInfo.boxType || order.boxType || 'Corrugated Carton B2';
  order.sealNumber = packageInfo.sealNumber || order.sealNumber || `SEAL-${Math.floor(100000 + Math.random() * 900000)}`;

  saveLocalOrders(list);

  try {
    await apiPost(`/orders/${orderId}/pack`, {});
  } catch {
    /* ignore */
  }

  return order;
}

/**
 * Dispatch an order to transport carrier
 */
export async function dispatchOrder(orderId, dispatchInfo = {}) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];

  // Validation: ensure required quantities are allocated, picked, and packed
  const totalRequired = order.items.reduce((s, it) => s + (it.requested || 0), 0);
  const totalPacked = order.items.reduce((s, it) => s + (it.packed || 0), 0);

  if (totalPacked < totalRequired && order.status !== 'Ready for Dispatch' && order.status !== 'Packed') {
    throw new Error(`Dispatch blocked: Only ${totalPacked} of ${totalRequired} units have been packed.`);
  }

  order.status = 'Dispatched';
  order.carrier = dispatchInfo.carrier || order.carrier || 'Dedicated Fleet - Van #3';
  order.trackingNumber = dispatchInfo.trackingNumber || order.trackingNumber || `TRK-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  order.dockDoor = dispatchInfo.dockDoor || order.dockDoor || 'Dock Bay 4';
  order.dispatchedAt = new Date().toISOString();

  saveLocalOrders(list);

  try {
    await apiPost(`/orders/${orderId}/dispatch`, dispatchInfo);
  } catch {
    /* ignore */
  }

  return order;
}

/**
 * Record an operational exception on an order
 */
export async function reportOrderException(orderId, stage, reason, details = {}) {
  const custom = getLocalOrders();
  const list = custom.length > 0 ? custom : [...masterOrdersList];
  const orderIdx = list.findIndex((o) => o.id === orderId);
  if (orderIdx < 0) return null;

  const order = list[orderIdx];
  order.isAtRisk = true;
  order.status = 'Exception';
  order.exceptionStage = stage;
  order.riskReason = `${stage} Disruption: ${reason}`;
  order.riskImpact = details.impact || `Operational hold on ${stage} floor for ${order.destination}`;
  order.riskAction = details.recommendedAction || 'Supervisor review required before workflow resumption.';
  order.exceptionSeverity = details.severity || 'High';

  saveLocalOrders(list);
  return order;
}

export async function getAllocationQueue() {
  try {
    const raw = await apiGet('/allocation/queue');
    return Array.isArray(raw) ? raw : raw?.items || raw?.data || raw?.queue || [];
  } catch {
    return [];
  }
}

export async function getPickingQueue() {
  try {
    const raw = await apiGet('/picking/queue');
    return Array.isArray(raw) ? raw : raw?.items || raw?.data || raw?.queue || [];
  } catch {
    return [];
  }
}

export async function getPackingQueue() {
  try {
    const raw = await apiGet('/packing/queue');
    return Array.isArray(raw) ? raw : raw?.items || raw?.data || raw?.queue || [];
  } catch {
    return [];
  }
}

export async function getDispatchQueue() {
  try {
    const raw = await apiGet('/dispatch/queue');
    return Array.isArray(raw) ? raw : raw?.items || raw?.data || raw?.queue || [];
  } catch {
    return [];
  }
}

