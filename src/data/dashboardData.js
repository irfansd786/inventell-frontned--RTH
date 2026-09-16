export const kpiData = [
  {
    id: 'visitors',
    title: 'Total Visitors',
    value: '1,248',
    change: '+12.4%',
    isPositive: true,
    subtitle: 'vs yesterday',
    iconName: 'Users',
  },
  {
    id: 'occupancy',
    title: 'Current Occupancy',
    value: '37%',
    change: '+5.6%',
    isPositive: true,
    subtitle: 'vs yesterday',
    iconName: 'Activity',
  },
  {
    id: 'dwellTime',
    title: 'Average Dwell Time',
    value: '18m 24s',
    change: '+6.3%',
    isPositive: true,
    subtitle: 'vs yesterday',
    iconName: 'Clock',
  },
  {
    id: 'peakHour',
    title: 'Peak Hour',
    value: '06:00 PM',
    change: 'Today',
    isPositive: true,
    subtitle: 'Peak traffic expected',
    iconName: 'Zap',
  },
  {
    id: 'totalSales',
    title: 'Total Sales',
    value: '₹2,45,320',
    change: '+18.4%',
    isPositive: true,
    subtitle: 'vs yesterday',
    iconName: 'TrendingUp',
  },
  {
    id: 'lowStock',
    title: 'Low Stock Items',
    value: '24',
    change: '+9',
    isPositive: false,
    subtitle: 'vs yesterday',
    iconName: 'AlertTriangle',
  },
  {
    id: 'activeAlerts',
    title: 'Active Alerts',
    value: '12',
    change: 'Requires attention',
    isPositive: false,
    subtitle: '4 high severity',
    iconName: 'Bell',
  },
];

export const footfallData = [
  { time: '12 AM', count: 12 },
  { time: '2 AM', count: 5 },
  { time: '4 AM', count: 2 },
  { time: '6 AM', count: 18 },
  { time: '8 AM', count: 145 },
  { time: '10 AM', count: 320 },
  { time: '12 PM', count: 480 },
  { time: '2 PM', count: 410 },
  { time: '4 PM', count: 620 },
  { time: '6 PM', count: 890 },
  { time: '8 PM', count: 710 },
  { time: '10 PM', count: 240 },
];

export const visitorTypeData = [
  { name: 'New Visitors', value: 72, color: '#10B981' },
  { name: 'Repeat Visitors', value: 28, color: '#3B82F6' },
];

export const queueOverviewData = [
  { id: 1, name: 'Checkout 1', people: 3, waitTime: '2m 15s', status: 'Normal', color: 'green' },
  { id: 2, name: 'Checkout 2', people: 9, waitTime: '6m 30s', status: 'High', color: 'red' },
  { id: 3, name: 'Checkout 3', people: 2, waitTime: '1m 45s', status: 'Normal', color: 'green' },
  { id: 4, name: 'Checkout 4', people: 5, waitTime: '4m 20s', status: 'Normal', color: 'amber' },
];

export const zoneAnalyticsData = [
  { id: 1, name: 'Beverages', visitors: 312, dwellTime: '4m 32s', traffic: '23%', trend: '+8%' },
  { id: 2, name: 'Snacks', visitors: 267, dwellTime: '6m 18s', traffic: '18%', trend: '+5%' },
  { id: 3, name: 'Personal Care', visitors: 223, dwellTime: '2m 41s', traffic: '16%', trend: '-2%' },
  { id: 4, name: 'Household', visitors: 180, dwellTime: '1m 52s', traffic: '12%', trend: '+1%' },
  { id: 5, name: 'Dairy', visitors: 120, dwellTime: '2m 06s', traffic: '8%', trend: '+4%' },
  { id: 6, name: 'Others', visitors: 146, dwellTime: '3m 12s', traffic: '23%', trend: '0%' },
];

export const salesOverviewData = [
  { time: '8 AM', sales: 14500 },
  { time: '10 AM', sales: 38200 },
  { time: '12 PM', sales: 74500 },
  { time: '2 PM', sales: 112000 },
  { time: '4 PM', sales: 168000 },
  { time: '6 PM', sales: 215000 },
  { time: '8 PM', sales: 245320 },
];

export const topProductsData = [
  { id: 1, name: 'Coca Cola 500ml', category: 'Beverages', qtySold: 120, revenue: '₹12,480' },
  { id: 2, name: 'Lays Classic Chips', category: 'Snacks', qtySold: 98, revenue: '₹9,310' },
  { id: 3, name: 'Pepsi Can 330ml', category: 'Beverages', qtySold: 85, revenue: '₹8,075' },
  { id: 4, name: 'Parle-G Biscuits', category: 'Snacks', qtySold: 75, revenue: '₹6,150' },
  { id: 5, name: 'Maggi 2-Min Noodles', category: 'Food', qtySold: 65, revenue: '₹5,330' },
];

export const lowStockData = [
  { id: 1, product: 'Coca Cola 500ml', category: 'Beverages', stock: 12, reorderLevel: 50, status: 'Critical' },
  { id: 2, product: 'Lays Classic Chips', category: 'Snacks', stock: 8, reorderLevel: 40, status: 'Critical' },
  { id: 3, product: 'Pepsi Can 330ml', category: 'Beverages', stock: 6, reorderLevel: 40, status: 'Critical' },
  { id: 4, product: 'Maggi Noodles 4-Pack', category: 'Food', stock: 15, reorderLevel: 30, status: 'Warning' },
];

export const warehouseData = {
  pendingOrders: 18,
  ordersInProcess: 12,
  readyToDispatch: 6,
  dispatchedToday: 8,
  steps: [
    { name: 'Orders', count: 18, active: true },
    { name: 'Allocation', count: 12, active: true },
    { name: 'Picking', count: 8, active: true },
    { name: 'Packing', count: 6, active: true },
    { name: 'Dispatch', count: 8, active: false },
  ]
};

export const aiRecommendationsData = [
  {
    id: 1,
    title: 'Replenish Coca Cola',
    description: 'Stock is below reorder level (12 remaining) and beverage zone footfall is high (+23%).',
    actionText: 'Reorder Now',
    type: 'inventory',
    urgency: 'High',
  },
  {
    id: 2,
    title: 'Increase Stock — Beverages',
    description: 'High footfall and rapid sales pace detected in beverage section over the last 3 hours.',
    actionText: 'View Details',
    type: 'sales',
    urgency: 'Medium',
  },
  {
    id: 3,
    title: 'Open Another Checkout',
    description: 'Queue length is increasing at Checkout 2 (9 customers, avg wait time 6m 30s).',
    actionText: 'Take Action',
    type: 'queue',
    urgency: 'Critical',
  },
  {
    id: 4,
    title: 'Promote Snacks',
    description: 'Low relative dwell time detected in snacks zone despite high footfall nearby.',
    actionText: 'Create Campaign',
    type: 'marketing',
    urgency: 'Low',
  },
];
