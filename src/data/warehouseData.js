export const warehouseKpis = {
  totalSkus: 512,
  totalUnits: '78,420',
  inventoryValue: '₹42,80,000',
  pendingOrders: 18,
  pickTasks: 12,
  dispatchReady: 6,
  usedCapacity: 68,
  storageLocations: '124 / 180',
};

export const warehouseActivityTimeline = [
  { time: '06:40 PM', text: 'Order ORD-1002 stock allocated from Rack B2', type: 'allocation' },
  { time: '06:35 PM', text: '42 Coca Cola units picked by Ramesh K. (Aisle 1, A1)', type: 'pick' },
  { time: '06:20 PM', text: 'Transfer TR-1021 created for Main Street Store replenishment', type: 'transfer' },
  { time: '06:05 PM', text: 'Stock shipment received from ABC Distributors (+200 units)', type: 'receipt' },
];
