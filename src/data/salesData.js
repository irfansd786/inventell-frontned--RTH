export const salesKpis = {
  todayRevenue: '₹2,45,320',
  revenueChange: '+18.4%',
  transactionsCount: 320,
  transactionsChange: '+12.1%',
  avgOrderValue: '₹766.63',
  avgOrderChange: '+5.4%',
  itemsSold: '1,284',
  itemsSoldChange: '+14.8%',
  refunds: '₹4,320',
  netRevenue: '₹2,41,000',
};

export const salesTrendData = [
  { time: '8 AM', revenue: 14500, transactions: 24 },
  { time: '10 AM', revenue: 38200, transactions: 48 },
  { time: '12 PM', revenue: 74500, transactions: 92 },
  { time: '2 PM', revenue: 112000, transactions: 145 },
  { time: '4 PM', revenue: 168000, transactions: 210 },
  { time: '6 PM', revenue: 215000, transactions: 280 },
  { time: '8 PM', revenue: 245320, transactions: 320 },
];

export const recentTransactionsData = [
  { id: 'INV-10234', time: '06:42 PM', itemsCount: 5, amount: '₹1,240', paymentMethod: 'UPI', status: 'Completed', customer: 'Walk-in Customer' },
  { id: 'INV-10233', time: '06:39 PM', itemsCount: 8, amount: '₹2,340', paymentMethod: 'Card', status: 'Completed', customer: 'Loyalty Member #8821' },
  { id: 'INV-10232', time: '06:35 PM', itemsCount: 3, amount: '₹560', paymentMethod: 'Cash', status: 'Completed', customer: 'Walk-in Customer' },
  { id: 'INV-10231', time: '06:28 PM', itemsCount: 12, amount: '₹4,180', paymentMethod: 'UPI', status: 'Completed', customer: 'Loyalty Member #1042' },
  { id: 'INV-10230', time: '06:15 PM', itemsCount: 2, amount: '₹320', paymentMethod: 'UPI', status: 'Completed', customer: 'Walk-in Customer' },
  { id: 'INV-10229', time: '06:05 PM', itemsCount: 6, amount: '₹1,850', paymentMethod: 'Card', status: 'Completed', customer: 'Loyalty Member #5512' },
];

export const salesByCategoryData = [
  { category: 'Beverages', revenue: 64200, share: 26, color: '#10B981' },
  { category: 'Snacks', revenue: 48500, share: 20, color: '#3B82F6' },
  { category: 'Food', revenue: 42100, share: 17, color: '#F59E0B' },
  { category: 'Personal Care', revenue: 38400, share: 16, color: '#8B5CF6' },
  { category: 'Household', revenue: 28120, share: 11, color: '#EC4899' },
  { category: 'Dairy', revenue: 24000, share: 10, color: '#06B6D4' },
];

export const paymentMethodsData = [
  { method: 'UPI', percentage: 48, revenue: '₹1,17,753', color: '#10B981' },
  { method: 'Card (Credit/Debit)', percentage: 32, revenue: '₹78,502', color: '#3B82F6' },
  { method: 'Cash', percentage: 17, revenue: '₹41,704', color: '#F59E0B' },
  { method: 'Other / Wallet', percentage: 3, revenue: '₹7,361', color: '#8B5CF6' },
];
