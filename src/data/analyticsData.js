export const analyticsKPIs = {
  revenue: { value: '₹4,85,250', change: '+14.2%', period: 'vs previous 30 days', raw: 485250 },
  customers: { value: '3,420', change: '+18.5%', period: 'vs previous 30 days', raw: 3420 },
  conversionRate: { value: '64.8%', change: '-1.2%', period: 'vs previous 30 days', raw: 64.8 },
  avgOrderValue: { value: '₹218.50', change: '+5.4%', period: 'vs previous 30 days', raw: 218.5 },
  inventoryTurnover: { value: '8.4x', change: '+0.6x', period: 'vs previous period', raw: 8.4 },
  fulfillmentRate: { value: '96.8%', change: '+1.4%', period: 'vs previous period', raw: 96.8 },
  stockoutRate: { value: '1.8%', change: '-0.5%', period: 'vs previous period', raw: 1.8 },
  operationalEfficiency: { value: '94.2%', change: '+2.1%', period: 'vs previous period', raw: 94.2 }
};

export const revenueTrendData = [
  { date: 'Mon', revenue: 42000, orders: 190, target: 40000 },
  { date: 'Tue', revenue: 48000, orders: 215, target: 40000 },
  { date: 'Wed', revenue: 53000, orders: 240, target: 40000 },
  { date: 'Thu', revenue: 61000, orders: 278, target: 45000 },
  { date: 'Fri', revenue: 74000, orders: 335, target: 50000 },
  { date: 'Sat', revenue: 89000, orders: 412, target: 60000 },
  { date: 'Sun', revenue: 82000, orders: 380, target: 55000 }
];

export const customerTrafficData = [
  { time: '09:00', visitors: 120, transactions: 72 },
  { time: '11:00', visitors: 280, transactions: 175 },
  { time: '13:00', visitors: 450, transactions: 298 },
  { time: '15:00', visitors: 390, transactions: 254 },
  { time: '17:00', visitors: 580, transactions: 382 },
  { time: '19:00', visitors: 640, transactions: 410 },
  { time: '21:00', visitors: 220, transactions: 145 }
];

export const conversionFunnelData = [
  { stage: 'Store Visitors', count: 5200, percent: 100 },
  { stage: 'Product Engagement', count: 4160, percent: 80 },
  { stage: 'Checkout Queue Entry', count: 3536, percent: 68 },
  { stage: 'Completed Purchase', count: 3369, percent: 64.8 }
];

export const categoryPerformanceData = [
  { category: 'Beverages', sales: 145000, margin: '34%', units: 3200 },
  { category: 'Snacks', sales: 112000, margin: '28%', units: 2800 },
  { category: 'Grocery', sales: 98000, margin: '22%', units: 1950 },
  { category: 'Personal Care', sales: 72000, margin: '42%', units: 1100 },
  { category: 'Dairy', sales: 58250, margin: '18%', units: 2400 }
];

export const inventoryHealthData = [
  { status: 'Healthy', count: 412, color: '#10B981' },
  { status: 'Low Stock', count: 64, color: '#F59E0B' },
  { status: 'Critical Risk', count: 28, color: '#EF4444' },
  { status: 'Out of Stock', count: 8, color: '#6B7280' }
];

export const fulfillmentPerformanceData = [
  { stage: 'Pending Allocation', count: 18, color: '#F59E0B' },
  { stage: 'Picking in Progress', count: 24, color: '#3B82F6' },
  { stage: 'Packing Completed', count: 32, color: '#8B5CF6' },
  { stage: 'Ready for Dispatch', count: 15, color: '#10B981' },
  { stage: 'Dispatched', count: 142, color: '#059669' }
];

export const customerBehaviorData = {
  avgDwellTimeMinutes: 14.8,
  topVisitedZones: [
    { zone: 'Packaged Beverages (Aisle 1)', visits: 1840, share: '32%' },
    { zone: 'Snacks & Confectionery (Aisle 2)', visits: 1420, share: '25%' },
    { zone: 'Fresh Dairy & Chillers (Rear)', visits: 1150, share: '20%' },
    { zone: 'Personal Care & Beauty (Aisle 3)', visits: 790, share: '14%' }
  ],
  avgQueueWaitSeconds: 142
};

export const analyticsKeyInsights = [
  {
    id: 'INS-01',
    severity: 'high',
    metric: 'Footfall vs Conversion',
    explanation: 'Footfall increased 18.5% on weekend peak hours while conversion rate dropped by 1.2% due to checkout queue congestion.',
    recommendedAction: 'Open an auxiliary checkout counter between 6:00 PM and 8:00 PM to capture ₹42,000 lost potential revenue.',
    relatedPath: '/queues'
  },
  {
    id: 'INS-02',
    severity: 'medium',
    metric: 'Category Engagement',
    explanation: 'Cold beverage shelf dwell time increased by 24% following the store entrance promotional display placement.',
    recommendedAction: 'Increase shelf replenishment rate for Coca Cola 500ml and Pepsi 500ml by 40 units/day.',
    relatedPath: '/shelves'
  },
  {
    id: 'INS-03',
    severity: 'critical',
    metric: 'Inventory Buffer Risk',
    explanation: '3 high-demand items (Coca Cola 500ml, Lays Classic 50g, Pepsi 500ml) have less than 1.5 days of store stock coverage.',
    recommendedAction: 'Execute express stock transfer from Central Warehouse immediately.',
    relatedPath: '/risks'
  }
];
