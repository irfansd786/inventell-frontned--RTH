import { masterProducts } from './productsData.js';

const DESTINATIONS = [
  'Main Street Store',
  'Sector 18 Store',
  'Downtown Express',
  'Cyber City Store',
  'North Bay Hub',
  'Direct Customer Delivery',
];

const statusesToday = [
  ...Array(15).fill('Pending'),
  ...Array(10).fill('Confirmed'),
  ...Array(8).fill('Partially Allocated'),
  ...Array(12).fill('Allocated'),
  ...Array(6).fill('Ready for Picking'),
  ...Array(12).fill('Picking'),
  ...Array(5).fill('Ready for Packing'),
  ...Array(10).fill('Packing'),
  ...Array(8).fill('Packed'),
  ...Array(4).fill('Ready for Dispatch'),
  ...Array(6).fill('Dispatched'),
  ...Array(4).fill('Delivered'),
];

function generateDeterministicOrders() {
  const list = [];

  // 1. 100 Today Orders (09 Sep 2026)
  for (let i = 0; i < 100; i++) {
    const orderNum = 'ORD-2026-' + String(101 + i).padStart(5, '0');
    const status = statusesToday[i];
    const minutes = 375 + Math.floor((i / 100.0) * 915); // 06:15 to 21:30
    const hh = String(Math.floor(minutes / 60)).padStart(2, '0');
    const mm = String(minutes % 60).padStart(2, '0');
    const createdAt = '2026-09-09T' + hh + ':' + mm + ':00Z';
    const dateLabel = '09 Sep 2026';

    // Multi-product distribution:
    // ~30 with 1 product, ~35 with 2, ~25 with 3, ~10 with 4 products
    let numProducts = 1;
    if (i >= 30 && i < 65) numProducts = 2;
    else if (i >= 65 && i < 90) numProducts = 3;
    else if (i >= 90) numProducts = 4;

    const chosenProducts = [];
    for (let p = 0; p < numProducts; p++) {
      const idx = (i + p * 5) % masterProducts.length;
      chosenProducts.push(masterProducts[idx]);
    }

    const isAtRisk = [7, 18, 38, 62, 88].includes(i);
    const priority = isAtRisk ? 'Critical' : (i % 4 === 0 ? 'High' : (i % 7 === 0 ? 'Low' : 'Normal'));
    const orderType = i % 8 === 0 ? 'Customer Order' : (i % 5 === 0 ? 'Transfer' : 'Replenishment');
    const destination = DESTINATIONS[i % DESTINATIONS.length];
    const source = orderType === 'Customer Order' ? 'Main Street Store' : 'Central Warehouse';

    const items = chosenProducts.map((prod) => {
      const pNum = parseInt(prod.id.replace('prod-', ''), 10) || 1;
      const requested = 10 + ((i * 7 + pNum * 5) % 45); // 10 to 54 units
      let allocated = 0;
      let picked = 0;
      let packed = 0;

      if (['Pending', 'Confirmed', 'Draft'].includes(status)) {
        allocated = 0;
        picked = 0;
        packed = 0;
      } else if (status === 'Partially Allocated') {
        allocated = Math.floor(requested / 2);
        picked = 0;
        packed = 0;
      } else if (['Allocated', 'Ready for Picking'].includes(status)) {
        allocated = requested;
        picked = 0;
        packed = 0;
      } else if (status === 'Picking') {
        allocated = requested;
        picked = Math.floor(requested * 0.6);
        packed = 0;
      } else if (['Ready for Packing', 'Picked'].includes(status)) {
        allocated = requested;
        picked = requested;
        packed = 0;
      } else if (status === 'Packing') {
        allocated = requested;
        picked = requested;
        packed = Math.floor(requested * 0.5);
      } else {
        allocated = requested;
        picked = requested;
        packed = requested;
      }

      const unitPrice = prod.price;
      return {
        product: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        requested,
        allocated,
        picked,
        packed,
        unitPrice,
        subtotal: requested * unitPrice,
        storeStock: prod.storeStock,
        warehouseStock: prod.warehouseStock,
      };
    });

    const totalUnits = items.reduce((s, it) => s + it.requested, 0);
    const totalAmount = items.reduce((s, it) => s + it.subtotal, 0);

    list.push({
      id: orderNum,
      order_number: orderNum,
      createdAt,
      dateLabel,
      type: orderType,
      source,
      destination,
      priority,
      status,
      expectedDate: '10 Sep 2026',
      isAtRisk,
      riskReason: isAtRisk ? 'Fast-moving SKU floor buffer shortfall' : '',
      riskImpact: isAtRisk ? 'Risk of store out-of-stock within 4 hours' : '',
      riskAction: isAtRisk ? 'Expedite picking and prioritize dock bay loading' : '',
      items,
      itemsCount: items.length,
      totalUnits,
      totalAmount,
      picker: ['Picking', 'Ready for Packing', 'Packing', 'Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(status) ? 'Ramesh K.' : 'Unassigned',
      packer: ['Packed', 'Ready for Dispatch', 'Dispatched', 'Delivered'].includes(status) ? 'Sunita P.' : 'Unassigned',
      notes: 'Fast-track retail store fulfillment batch.',
    });
  }

  // 2. 20 Historical Orders (08 Sep 2026 down to 28 Aug 2026)
  const histDates = [
    { label: '08 Sep 2026', prefix: '2026-09-08' },
    { label: '07 Sep 2026', prefix: '2026-09-07' },
    { label: '06 Sep 2026', prefix: '2026-09-06' },
    { label: '05 Sep 2026', prefix: '2026-09-05' },
    { label: '03 Sep 2026', prefix: '2026-09-03' },
    { label: '01 Sep 2026', prefix: '2026-09-01' },
    { label: '28 Aug 2026', prefix: '2026-08-28' },
  ];

  for (let h = 0; h < 20; h++) {
    const orderNum = 'ORD-2026-' + String(201 + h).padStart(5, '0');
    const dObj = histDates[h % histDates.length];
    const createdAt = dObj.prefix + 'T' + String(10 + (h % 8)).padStart(2, '0') + ':30:00Z';
    const status = h < 14 ? 'Delivered' : (h < 18 ? 'Dispatched' : 'Cancelled');

    const numProducts = 1 + (h % 3);
    const chosenProducts = [];
    for (let p = 0; p < numProducts; p++) {
      const idx = (h * 2 + p) % masterProducts.length;
      chosenProducts.push(masterProducts[idx]);
    }

    const items = chosenProducts.map((prod) => {
      const requested = 20 + ((h * 3) % 30);
      const unitPrice = prod.price;
      return {
        product: prod.name,
        sku: prod.sku,
        barcode: prod.barcode,
        requested,
        allocated: status !== 'Cancelled' ? requested : 0,
        picked: status !== 'Cancelled' ? requested : 0,
        packed: status !== 'Cancelled' ? requested : 0,
        unitPrice,
        subtotal: requested * unitPrice,
        storeStock: prod.storeStock,
        warehouseStock: prod.warehouseStock,
      };
    });

    const totalUnits = items.reduce((s, it) => s + it.requested, 0);
    const totalAmount = items.reduce((s, it) => s + it.subtotal, 0);

    list.push({
      id: orderNum,
      order_number: orderNum,
      createdAt,
      dateLabel: dObj.label,
      type: h % 2 === 0 ? 'Replenishment' : 'Transfer',
      source: 'Central Warehouse',
      destination: DESTINATIONS[h % DESTINATIONS.length],
      priority: 'Normal',
      status,
      expectedDate: dObj.label,
      isAtRisk: false,
      items,
      itemsCount: items.length,
      totalUnits,
      totalAmount,
      picker: 'Amit V.',
      packer: 'Sunita P.',
      notes: 'Historical store requisition.',
    });
  }

  return list;
}

export const masterOrdersList = generateDeterministicOrders();

export const sampleOrderDetails = masterOrdersList[0];

export const orderKpis = {
  total: masterOrdersList.length,
  today: masterOrdersList.filter((o) => o.createdAt.startsWith('2026-09-09')).length,
  pending: masterOrdersList.filter((o) => ['Pending', 'Draft', 'Confirmed'].includes(o.status)).length,
  processing: masterOrdersList.filter((o) => ['Partially Allocated', 'Allocated', 'Ready for Picking', 'Picking', 'Ready for Packing', 'Packing', 'Packed', 'Ready for Dispatch'].includes(o.status)).length,
  completed: masterOrdersList.filter((o) => ['Dispatched', 'Delivered'].includes(o.status)).length,
  atRisk: masterOrdersList.filter((o) => o.status === 'At Risk' || o.isAtRisk).length,
};
