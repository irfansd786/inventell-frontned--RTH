/**
 * Reusable Warehouse Operations Utilities
 * Provides consistent product count, units calculation, location lookup, and CSV export
 */

/**
 * Returns count of unique products/SKUs across orders or items
 * PRODUCT COUNT RULE: PRODUCTS = count of distinct SKUs, UNITS = total physical quantity
 */
export function getUniqueProductCount(ordersOrItems = []) {
  if (!Array.isArray(ordersOrItems)) return 0;
  const skus = new Set();

  ordersOrItems.forEach((entry) => {
    if (entry.items && Array.isArray(entry.items)) {
      entry.items.forEach((it) => {
        if (it.sku) skus.add(it.sku);
      });
    } else if (entry.sku) {
      skus.add(entry.sku);
    }
  });

  return skus.size;
}

/**
 * Returns sum of units across orders or items for a specific field
 */
export function getTotalUnits(ordersOrItems = [], field = 'requested') {
  if (!Array.isArray(ordersOrItems)) return 0;

  return ordersOrItems.reduce((total, entry) => {
    if (entry.items && Array.isArray(entry.items)) {
      return (
        total +
        entry.items.reduce((subTotal, it) => {
          return subTotal + Number(it[field] ?? it.quantity ?? 0);
        }, 0)
      );
    }
    return total + Number(entry[field] ?? entry.quantity ?? entry.totalUnits ?? 0);
  }, 0);
}

/**
 * Formats a clean summary of products in an order:
 * e.g. "1 Product (Lays Classic Chips)" or "3 Products (Lays + Pepsi + Dairy Milk)"
 */
export function getOrderProductSummary(order = {}) {
  const items = order.items || [];
  const uniqueCount = items.length;
  const totalUnits = items.reduce((sum, it) => sum + Number(it.requested ?? it.quantity ?? 0), 0);
  const totalValue = items.reduce(
    (sum, it) => sum + (Number(it.subtotal) || Number(it.unitPrice || it.price || 0) * Number(it.requested || 0)),
    0
  );

  let namesSummary = '';
  if (items.length === 0) {
    namesSummary = 'No items';
  } else if (items.length === 1) {
    namesSummary = items[0].product || items[0].name || 'Product';
  } else if (items.length <= 3) {
    namesSummary = items.map((i) => (i.product || i.name || '').split(' ')[0]).join(' + ');
  } else {
    const firstTwo = items.slice(0, 2).map((i) => (i.product || i.name || '').split(' ')[0]).join(' + ');
    namesSummary = `${firstTwo} + ${items.length - 2} more`;
  }

  return {
    uniqueProducts: uniqueCount,
    totalUnits,
    totalValue,
    label: `${uniqueCount} ${uniqueCount === 1 ? 'Product' : 'Products'}`,
    namesSummary,
  };
}

/**
 * Computes global warehouse operation summary metrics
 * PRODUCT COUNT: global unique products/SKUs in the master catalog
 * ORDER PRODUCTS: stage-specific unique SKUs within active orders
 */
export function getWarehouseOperationSummary(orders = [], globalProducts = null) {
  const activeOrders = orders.filter((o) => !['Cancelled', 'Delivered'].includes(o.status));
  const orderProducts = getUniqueProductCount(activeOrders);
  const totalUnits = getTotalUnits(activeOrders, 'requested');
  const allocatedUnits = getTotalUnits(activeOrders, 'allocated');
  const pickedUnits = getTotalUnits(activeOrders, 'picked');
  const packedUnits = getTotalUnits(activeOrders, 'packed');

  return {
    totalOrders: orders.length,
    activeOrdersCount: activeOrders.length,
    globalProducts: globalProducts,
    orderProducts,
    uniqueProducts: globalProducts !== null ? globalProducts : orderProducts,
    totalUnits,
    allocatedUnits,
    pickedUnits,
    packedUnits,
  };
}

/**
 * Returns deterministic warehouse bin location for a given SKU
 */
export function getBinLocation(sku = '') {
  const normalized = (sku || '').toUpperCase().trim();
  if (normalized.startsWith('BEV')) {
    const num = normalized.replace('BEV-', '') || '1';
    return `Aisle 1 • Bay A • Shelf ${num}`;
  }
  if (normalized.startsWith('SNK')) {
    const num = normalized.replace('SNK-', '') || '1';
    return `Aisle 2 • Bay B • Shelf ${num}`;
  }
  if (normalized.startsWith('DRY')) {
    return `Cold Bay 1 • Chilled Rack 2`;
  }
  if (normalized.startsWith('PC')) {
    const num = normalized.replace('PC-', '') || '1';
    return `Aisle 4 • Bay C • Shelf ${num}`;
  }
  if (normalized.startsWith('HH')) {
    const num = normalized.replace('HH-', '') || '1';
    return `Aisle 5 • Bay D • Shelf ${num}`;
  }
  if (normalized.startsWith('FD')) {
    const num = normalized.replace('FD-', '') || '1';
    return `Aisle 3 • Bay A • Shelf ${num}`;
  }
  return `Aisle 3 • Bay B • Shelf 1`;
}

/**
 * Generic CSV exporter with proper escaping and auto-download
 */
export function exportWarehouseCSV({ filename = 'warehouse_export.csv', headers = [], rows = [] }) {
  if (!rows || rows.length === 0) return false;

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCSV).join(',');
  const rowLines = rows.map((row) => row.map(escapeCSV).join(','));
  const csvContent = [headerLine, ...rowLines].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}
