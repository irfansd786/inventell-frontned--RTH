export const inventoryKpis = {
  totalProducts: 512,
  totalUnits: '24,850',
  inventoryValue: '₹18,75,000',
  lowStockCount: 24,
  outOfStockCount: 8,
  healthyStockCount: 480,
};

export const inventoryHealthBreakdown = [
  { name: 'Healthy Stock', value: 480, color: '#10B981' },
  { name: 'Low Stock', value: 24, color: '#F59E0B' },
  { name: 'Out of Stock', value: 8, color: '#EF4444' },
];

export const stockMovementData = [
  { day: 'Mon', opening: 24200, purchases: 1200, transfersIn: 800, sales: 1400, closing: 24800 },
  { day: 'Tue', opening: 24800, purchases: 900, transfersIn: 600, sales: 1550, closing: 24750 },
  { day: 'Wed', opening: 24750, purchases: 1500, transfersIn: 1000, sales: 1700, closing: 25550 },
  { day: 'Thu', opening: 25550, purchases: 800, transfersIn: 500, sales: 1600, closing: 25250 },
  { day: 'Fri', opening: 25250, purchases: 2000, transfersIn: 1200, sales: 2100, closing: 26350 },
  { day: 'Sat', opening: 26350, purchases: 2500, transfersIn: 1500, sales: 2600, closing: 27750 },
  { day: 'Sun', opening: 27750, purchases: 1000, transfersIn: 900, sales: 2350, closing: 27300 },
];
